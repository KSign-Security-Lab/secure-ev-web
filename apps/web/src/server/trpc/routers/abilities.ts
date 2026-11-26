import { router, publicProcedure } from "../init";
import { paginationSchema, searchQuerySchema } from "../schemas/common";
import {
  paginatedAbilitiesResponseSchema,
  abilityStatisticsSchema,
  abilitySchema,
  updateAbilityInputSchema,
  createAbilityInputSchema,
} from "../schemas/responses";
import {
  filterValuesResponseSchema,
  paginatedCommandSearchResponseSchema,
  commandSearchResultListSchema,
  searchCommandsByFiltersInputSchema,
  searchCommandsInputSchema,
} from "../schemas/abilities";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import prisma from "~/lib/prisma";
import type { Ability } from "@secure-ev-web/prisma";
import { parentTechniqueIds, platformLabels, splitTactics } from "~/lib/format";

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const serializeAbility = (ability: Ability) => ({
  ...ability,
  threat_groups: toStringArray(ability.threat_groups),
  cves: toStringArray(ability.cves),
  createdAt: ability.createdAt.toISOString(),
  updatedAt: ability.updatedAt.toISOString(),
});

export const abilitiesRouter = router({
  deleteMany: publicProcedure
    .input(z.object({ ids: z.array(z.string().uuid()).min(1).max(500) }))
    .mutation(async ({ input }) => {
      const { count } = await prisma.ability.deleteMany({
        where: { id: { in: input.ids } },
      });
      return { deleted: count };
    }),

  create: publicProcedure
    .input(createAbilityInputSchema)
    .output(abilitySchema)
    .mutation(async ({ input }) => {
      const created = await prisma.ability.create({
        data: {
          ...input,
          technique_id: input.technique_id.toUpperCase(),
          // Same shape as the seeded library ids (32 hex chars).
          ability_id: randomUUID().replace(/-/g, ""),
          payload: "",
          type: "Custom",
        },
      });
      return serializeAbility(created);
    }),

  update: publicProcedure
    .input(updateAbilityInputSchema)
    .output(abilitySchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updated = await prisma.ability.update({ where: { id }, data });
      return serializeAbility(updated);
    }),

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

      const transformedAbilities = abilities.map(serializeAbility);

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
          { technique_id: { contains: query } },
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

      const transformedAbilities = abilities.map(serializeAbility);

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
        // No `mode: "insensitive"`: Prisma rejects it on MySQL, whose default
        // collation already matches case-insensitively.
        andConditions.push({
          OR: [
            { command: { contains: query } },
            { ability_name: { contains: query } },
            { description: { contains: query } },
            { ability_id: { contains: query } },
            { tactic: { contains: query } },
            { technique_name: { contains: query } },
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
        // Normalised keys; the client turns them into localised labels.
        const tactics = splitTactics(item.tactic).filter((t) => t !== "x");
        const tactic =
          tactics.length === 0 ? "unknown" : tactics.length > 1 ? "multiple" : tactics[0];
        tacticCounts[tactic] = (tacticCounts[tactic] || 0) + 1;
        const platforms = platformLabels(item.platform);
        for (const platform of platforms.length ? platforms : ["unknown"]) {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        }
        const type = item.type?.trim() || "unknown";
        const typeKey = type.toLowerCase() === "unknown" ? "unknown" : type;
        typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
      });

      // Top 7 tactics plus an "other" bucket so the slices sum to the total
      // and every slice has a legend entry.
      const sortedTactics = Object.entries(tacticCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      const TOP_TACTICS = 7;
      const byTactic =
        sortedTactics.length > TOP_TACTICS + 1
          ? [
              ...sortedTactics.slice(0, TOP_TACTICS),
              {
                name: "other",
                value: sortedTactics
                  .slice(TOP_TACTICS)
                  .reduce((sum, item) => sum + item.value, 0),
              },
            ]
          : sortedTactics;

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
        abilities.flatMap((ab) => parentTechniqueIds(ab.technique_id))
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
   * MITRE ATT&CK coverage matrix for the heatmap.
   *
   * Built from the ability library: every ability row carries its tactic and
   * technique, so we group abilities by tactic → parent technique and count the
   * variants (depth of coverage). Enterprise coverage breadth (how many of the
   * ATT&CK techniques we can exercise at all) is measured against the Mitre
   * table, which also gives us the list of uncovered techniques (the gaps).
   */
  coverage: publicProcedure.query(async () => {
    const abilities = await prisma.ability.findMany({
      select: { tactic: true, technique_id: true, technique_name: true },
    });
    const mitre = await prisma.mitre.findMany({
      where: { platform: "Enterprise" },
      select: { technique_id: true, technique_name: true },
    });

    // Enterprise technique universe, deduped by id.
    const enterpriseNames = new Map<string, string>();
    for (const tech of mitre) {
      if (!enterpriseNames.has(tech.technique_id)) {
        enterpriseNames.set(tech.technique_id, tech.technique_name);
      }
    }

    // The 14 Enterprise tactics in kill-chain order. Anything else an ability
    // carries (ICS tactics, Caldera plugin buckets) is appended after these so
    // nothing is hidden, but the standard matrix reads left-to-right as ATT&CK.
    const TACTIC_ORDER = [
      "reconnaissance",
      "resource-development",
      "initial-access",
      "execution",
      "persistence",
      "privilege-escalation",
      "defense-evasion",
      "credential-access",
      "discovery",
      "lateral-movement",
      "collection",
      "command-and-control",
      "exfiltration",
      "impact",
    ];
    // Fold names from other taxonomies into the 14 Enterprise columns:
    // ATT&CK v18 split Defense Evasion into Stealth / Defense Impairment, and
    // "Stage Capabilities" is a Resource Development technique (T1608).
    const TACTIC_ALIASES: Record<string, string> = {
      stealth: "defense-evasion",
      "defense-impairment": "defense-evasion",
      "stage-capabilities": "resource-development",
    };
    const titleCase = (value: string) =>
      value
        .split(/[-\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // tactic key → (parent technique id → { name, count })
    const byTactic = new Map<string, Map<string, { name: string; count: number }>>();
    const coveredParents = new Set<string>();

    for (const ability of abilities) {
      // Some rows carry composite values ("Persistence, Privilege Escalation",
      // "T1059, T1059.004"); split both and count each (tactic, parent) once.
      const tactics = [
        ...new Set(
          splitTactics(ability.tactic)
            .filter((tactic) => tactic !== "unknown" && tactic !== "x")
            .map((tactic) => TACTIC_ALIASES[tactic] ?? tactic)
        ),
      ];
      const parents = parentTechniqueIds(ability.technique_id);
      if (!tactics.length || !parents.length) continue;

      for (const parent of parents) {
        if (enterpriseNames.has(parent)) coveredParents.add(parent);
      }
      // Only use the ability's own technique name when it maps to one id.
      const fallbackName = parents.length === 1 ? ability.technique_name : "";

      for (const tactic of tactics) {
        if (!byTactic.has(tactic)) byTactic.set(tactic, new Map());
        const techniques = byTactic.get(tactic)!;
        for (const parent of parents) {
          const existing = techniques.get(parent);
          const name = enterpriseNames.get(parent) || fallbackName || parent;
          if (existing) existing.count += 1;
          else techniques.set(parent, { name, count: 1 });
        }
      }
    }

    const orderIndex = (key: string) => {
      const idx = TACTIC_ORDER.indexOf(key);
      return idx === -1 ? TACTIC_ORDER.length : idx;
    };
    const matrix = [...byTactic.entries()]
      .map(([key, techniques]) => ({
        key,
        label: titleCase(key),
        standard: TACTIC_ORDER.includes(key),
        techniques: [...techniques.entries()]
          .map(([id, info]) => ({ id, name: info.name, count: info.count }))
          .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id)),
      }))
      .sort((a, b) => orderIndex(a.key) - orderIndex(b.key) || a.label.localeCompare(b.label));

    const uncovered = [...enterpriseNames.entries()]
      .filter(([id]) => !coveredParents.has(id))
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.id.localeCompare(b.id));

    const totalTechniques = enterpriseNames.size;
    const coveredTechniques = [...coveredParents].filter((id) =>
      enterpriseNames.has(id)
    ).length;

    return {
      summary: {
        totalAbilities: abilities.length,
        totalTechniques,
        coveredTechniques,
        coveragePercentage:
          totalTechniques > 0
            ? Math.round((coveredTechniques / totalTechniques) * 100)
            : 0,
        tacticsCovered: matrix.filter((t) => t.standard).length,
      },
      matrix,
      uncovered,
    };
  }),
});
