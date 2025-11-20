import { router, publicProcedure } from "../init";
import { paginationSchema, searchQuerySchema } from "../schemas/common";
import {
  paginatedAbilitiesResponseSchema,
  abilityStatisticsSchema,
} from "../schemas/responses";
import {
  filterValuesResponseSchema,
  paginatedCommandSearchResponseSchema,
  commandSearchResultListSchema,
  searchCommandsByFiltersInputSchema,
  searchCommandsInputSchema,
} from "../schemas/abilities";
import prisma from "~/lib/prisma";

export const abilitiesRouter = router({
  list: publicProcedure
    .input(paginationSchema)
    .output(paginatedAbilitiesResponseSchema)
    .query(async ({ input }) => {
      const pageNumber = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 10;
      const [abilities, count] = await prisma.$transaction([
        prisma.ability.findMany({
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        }),
        prisma.ability.count(),
      ]);

      const transformedAbilities = abilities.map((ability) => ({
        ...ability,
        createdAt: ability.createdAt.toISOString(),
        updatedAt: ability.updatedAt.toISOString(),
      }));

      return { abilities: transformedAbilities, count };
    }),

  search: publicProcedure
    .input(searchQuerySchema)
    .output(paginatedAbilitiesResponseSchema)
    .query(async ({ input }) => {
      const pageNumber = input.page;
      const pageSize = input.pageSize;
      const query = input.query;
      const whereClause = {
        OR: [
          { ability_name: { contains: query } },
          { ability_id: { contains: query } },
          { tactic: { contains: query } },
          { technique_name: { contains: query } },
        ],
      };
      const [abilities, count] = await prisma.$transaction([
        prisma.ability.findMany({
          where: whereClause,
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        }),
        prisma.ability.count({
          where: whereClause,
        }),
      ]);

      const transformedAbilities = abilities.map((ability) => ({
        ...ability,
        createdAt: ability.createdAt.toISOString(),
        updatedAt: ability.updatedAt.toISOString(),
      }));

      return { abilities: transformedAbilities, count };
    }),

  searchCommands: publicProcedure
    .input(searchCommandsInputSchema)
    .output(commandSearchResultListSchema)
    .query(async ({ input }) => {
      const abilities = await prisma.ability.findMany({
        where: {
          OR: [
            { command: { contains: input.query } },
            { ability_name: { contains: input.query } },
            { description: { contains: input.query } },
          ],
        },
        take: input.limit,
        select: {
          id: true,
          ability_name: true,
          command: true,
          description: true,
          platform: true,
          type: true,
          technique_name: true,
          tactic: true,
        },
      });

      return abilities;
    }),

  getFilterValues: publicProcedure
    .output(filterValuesResponseSchema)
    .query(async () => {
      // Fetch distinct values for each filter field
      const platformsRaw = await prisma.ability.findMany({
        distinct: ["platform"],
        select: { platform: true },
      });
      const typesRaw = await prisma.ability.findMany({
        distinct: ["type"],
        select: { type: true },
      });
      const techniqueNamesRaw = await prisma.ability.findMany({
        distinct: ["technique_name"],
        select: { technique_name: true },
      });
      const tacticsRaw = await prisma.ability.findMany({
        distinct: ["tactic"],
        select: { tactic: true },
      });
      // Filter out empty/null values and sort
      const platforms = platformsRaw
        .map((item) => item.platform?.trim())
        .filter((v) => v)
        .sort();
      const types = typesRaw
        .map((item) => item.type?.trim())
        .filter((v) => v)
        .sort();
      const techniqueNames = techniqueNamesRaw
        .map((item) => item.technique_name?.trim())
        .filter((v) => v)
        .sort();
      const tactics = tacticsRaw
        .map((item) => item.tactic?.trim())
        .filter((v) => v)
        .sort();
      return {
        platforms,
        types,
        techniqueNames,
        tactics,
      };
    }),

  searchCommandsByFilters: publicProcedure
    .input(searchCommandsByFiltersInputSchema)
    .output(paginatedCommandSearchResponseSchema)
    .query(async ({ input }) => {
      const pageNumber = input.page ?? 1;
      const pageSize = input.pageSize ?? 50;
      const skip = (pageNumber - 1) * pageSize;

      const andConditions: any[] = [];
      if (input.platform) {
        andConditions.push({ platform: input.platform });
      }
      if (input.type) {
        andConditions.push({ type: input.type });
      }
      if (input.techniqueName) {
        andConditions.push({ technique_name: input.techniqueName });
      }
      if (input.tactic) {
        andConditions.push({ tactic: input.tactic });
      }
      if (input.query?.trim()) {
        const query = input.query.trim();
        andConditions.push({
          OR: [
            { command: { contains: query, mode: "insensitive" } },
            { ability_name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { ability_id: { contains: query, mode: "insensitive" } },
            { tactic: { contains: query, mode: "insensitive" } },
            { technique_name: { contains: query, mode: "insensitive" } },
          ],
        });
      }

      const whereClause = andConditions.length ? { AND: andConditions } : {};

      const [abilities, count] = await prisma.$transaction([
        prisma.ability.findMany({
          where: whereClause,
          skip,
          take: pageSize,
          select: {
            id: true,
            ability_name: true,
            command: true,
            description: true,
            platform: true,
            type: true,
            technique_name: true,
            tactic: true,
          },
        }),
        prisma.ability.count({ where: whereClause }),
      ]);

      return { abilities, count };
    }),

  statistics: publicProcedure
    .output(abilityStatisticsSchema)
    .query(async () => {
      const totalCount = await prisma.ability.count();

      // Fetch all abilities with tactic, platform, and type in a single query
      const abilities = await prisma.ability.findMany({
        select: { tactic: true, platform: true, type: true },
      });
      // Aggregate tactics, platforms, and types in one pass
      const tacticCounts: Record<string, number> = {};
      const platformCounts: Record<string, number> = {};
      const typeCounts: Record<string, number> = {};
      abilities.forEach((item) => {
        const tactic = item.tactic || "Unknown";
        tacticCounts[tactic] = (tacticCounts[tactic] || 0) + 1;
        const platform = item.platform || "Unknown";
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        const type = item.type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const byTactic = Object.entries(tacticCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      const byPlatform = Object.entries(platformCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const byType = Object.entries(typeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      return {
        totalCount,
        byTactic,
        byPlatform,
        byType,
      };
    }),
});
