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
        select: {
          tactic: true,
          platform: true,
          type: true,
          technique_id: true,
        },
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

      // MITRE Coverage Calculation — unique Enterprise parent techniques. The
      // Mitre table can list a technique more than once, so dedupe by ID.
      const allMitre = await prisma.mitre.findMany({
        where: { platform: "Enterprise" },
        select: { technique_id: true },
      });
      const mitreTechniqueIds = new Set(
        allMitre.map((tech) => tech.technique_id)
      );
      const totalTechniques = mitreTechniqueIds.size;
      const uniqueAbilityTechiqueIds = new Set<string>(
        abilities.map((ab) => ab.technique_id.split(".")[0])
      );
      const coveredTechniques = [...mitreTechniqueIds].filter((id) =>
        uniqueAbilityTechiqueIds.has(id)
      ).length;

      return {
        totalCount,
        byTactic,
        byPlatform,
        byType,
        mitreCoverage: {
          totalTechniques,
          coveredTechniques,
          coveragePercentage:
            totalTechniques > 0
              ? Math.round((coveredTechniques / totalTechniques) * 100)
              : 0,
        },
      };
    }),

  /**
   * Full Enterprise ATT&CK matrix with ability coverage, for the heatmap.
   *
   * The Mitre table (scripts/import_mitre.py) holds every active tactic,
   * technique and sub-technique, so every cell of the matrix is returned —
   * including techniques with no ability (gaps). Coverage is keyed by
   * technique ID, not by the ability's tactic label: an ability on T1059.001
   * covers that sub-technique and its parent in every tactic column T1059
   * appears under.
   */
  coverage: publicProcedure.query(async () => {
    const [abilities, mitre] = await Promise.all([
      prisma.ability.findMany({ select: { technique_id: true } }),
      prisma.mitre.findMany({
        where: { platform: "Enterprise" },
        select: {
          tactic: true,
          tactic_name: true,
          tactic_order: true,
          technique_id: true,
          technique_name: true,
          subtechnique_id: true,
          subtechnique_name: true,
        },
      }),
    ]);

    // Abilities per exact ATT&CK ID (parent or sub-technique).
    const countById = new Map<string, number>();
    for (const ability of abilities) {
      const id = (ability.technique_id || "").trim();
      if (id) countById.set(id, (countById.get(id) ?? 0) + 1);
    }

    // Technique catalog (parent -> sub-techniques) and tactic columns.
    const catalog = new Map<string, { name: string; subs: Map<string, string> }>();
    const tactics = new Map<
      string,
      { label: string; order: number; techniqueIds: Set<string> }
    >();
    for (const row of mitre) {
      let parent = catalog.get(row.technique_id);
      if (!parent) {
        parent = { name: row.technique_name, subs: new Map() };
        catalog.set(row.technique_id, parent);
      }
      if (row.subtechnique_id) {
        parent.subs.set(row.subtechnique_id, row.subtechnique_name ?? row.subtechnique_id);
      }
      let tactic = tactics.get(row.tactic);
      if (!tactic) {
        tactic = {
          label: row.tactic_name || row.tactic,
          order: row.tactic_order,
          techniqueIds: new Set(),
        };
        tactics.set(row.tactic, tactic);
      }
      tactic.techniqueIds.add(row.technique_id);
    }

    const techniques = new Map(
      [...catalog.entries()].map(([id, info]) => {
        const subs = [...info.subs.entries()]
          .map(([subId, name]) => ({ id: subId, name, count: countById.get(subId) ?? 0 }))
          .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        const direct = countById.get(id) ?? 0;
        return [
          id,
          {
            id,
            name: info.name,
            /** Abilities tagged with the technique itself. */
            direct,
            /** Abilities on the technique or any of its sub-techniques. */
            count: direct + subs.reduce((sum, sub) => sum + sub.count, 0),
            subsCovered: subs.filter((sub) => sub.count > 0).length,
            subs,
          },
        ];
      })
    );

    const matrix = [...tactics.entries()]
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, tactic]) => {
        const list = [...tactic.techniqueIds]
          .map((id) => techniques.get(id)!)
          .sort((a, b) => a.name.localeCompare(b.name));
        return {
          key,
          label: tactic.label,
          covered: list.filter((t) => t.count > 0).length,
          techniques: list,
        };
      });

    const allTechniques = [...techniques.values()];
    const allSubs = allTechniques.flatMap((t) => t.subs);
    const enterpriseIds = new Set([
      ...techniques.keys(),
      ...allSubs.map((sub) => sub.id),
    ]);
    const enterpriseAbilities = [...countById.entries()]
      .filter(([id]) => enterpriseIds.has(id))
      .reduce((sum, [, n]) => sum + n, 0);
    const percent = (part: number, whole: number) =>
      whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

    const coveredTechniques = allTechniques.filter((t) => t.count > 0).length;
    const coveredSubs = allSubs.filter((sub) => sub.count > 0).length;

    return {
      summary: {
        totalAbilities: abilities.length,
        enterpriseAbilities,
        /** Untagged, ICS, or non-ATT&CK IDs — not placed on the matrix. */
        otherAbilities: abilities.length - enterpriseAbilities,
        techniques: {
          covered: coveredTechniques,
          total: allTechniques.length,
          percentage: percent(coveredTechniques, allTechniques.length),
        },
        subtechniques: {
          covered: coveredSubs,
          total: allSubs.length,
          percentage: percent(coveredSubs, allSubs.length),
        },
        tactics: {
          covered: matrix.filter((t) => t.covered > 0).length,
          total: matrix.length,
        },
      },
      matrix,
    };
  }),
});
