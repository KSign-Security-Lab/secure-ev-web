import { z } from "zod";
import { router, publicProcedure } from "../init";
import prisma from "~/lib/prisma";

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const assessmentInput = z.object({
  name: z.string().trim().min(1).max(191),
  target: z.string().trim().max(191).default(""),
  abilityIds: z.array(z.string().min(1)).max(500).default([]),
  agentPaws: z.array(z.string().min(1)).max(200).default([]),
  repeatCount: z.number().int().min(1).max(100).default(1),
});

export const assessmentsRouter = router({
  list: publicProcedure.query(async () => {
    const rows = await prisma.assessment.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => {
      const abilityIds = toStringArray(row.abilityIds);
      return {
        id: row.id,
        name: row.name,
        target: row.target,
        abilityIds,
        agentPaws: toStringArray(row.agentPaws),
        attackCount: abilityIds.length,
        repeatCount: row.repeatCount,
        lastRunAt: row.lastRunAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      };
    });
  }),

  /** Plan detail with the referenced abilities resolved to names. */
  get: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const row = await prisma.assessment.findUniqueOrThrow({ where: { id: input.id } });
    const abilityIds = toStringArray(row.abilityIds);
    const abilities = abilityIds.length
      ? await prisma.ability.findMany({
          where: { ability_id: { in: abilityIds } },
          select: {
            ability_id: true,
            ability_name: true,
            tactic: true,
            technique_id: true,
            platform: true,
          },
        })
      : [];
    const byId = new Map(abilities.map((a) => [a.ability_id, a]));
    return {
      id: row.id,
      name: row.name,
      target: row.target,
      repeatCount: row.repeatCount,
      agentPaws: toStringArray(row.agentPaws),
      lastRunAt: row.lastRunAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      // Keep plan order; abilities deleted from the library are reported as missing.
      abilities: abilityIds.map((id) => ({ id, ability: byId.get(id) ?? null })),
    };
  }),

  create: publicProcedure.input(assessmentInput).mutation(async ({ input }) => {
    const row = await prisma.assessment.create({ data: input });
    return { id: row.id };
  }),

  /** Stamped when an operation is launched from this plan. */
  markRun: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
    await prisma.assessment.update({ where: { id: input.id }, data: { lastRunAt: new Date() } });
    return { ok: true };
  }),

  deleteMany: publicProcedure
    .input(z.object({ ids: z.array(z.string().uuid()).min(1).max(200) }))
    .mutation(async ({ input }) => {
      const { count } = await prisma.assessment.deleteMany({ where: { id: { in: input.ids } } });
      return { deleted: count };
    }),
});
