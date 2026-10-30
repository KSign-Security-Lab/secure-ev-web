import { TRPCError } from "@trpc/server";
import {
  AGENT_DERIVED_FACT_KEYS,
  abilityPayloads,
  advanceOperation,
  extractPlaceholders,
  type PlanStep,
} from "@secure-ev-web/c2-core";
import type { Prisma } from "@secure-ev-web/prisma";
import { router, publicProcedure } from "../init";
import prisma from "~/lib/prisma";
import { env } from "~/config/env";
import {
  createOperationInputSchema,
  operationIdInputSchema,
  previewFactsInputSchema,
  setOperationStateInputSchema,
} from "../schemas/operations";

const DERIVED = new Set<string>(AGENT_DERIVED_FACT_KEYS);

/** Filenames present in the C2 payload dir, or null if the C2 was unreachable. */
async function fetchAvailablePayloads(): Promise<Set<string> | null> {
  try {
    const base = env.C2_PUBLIC_URL.replace(/\/+$/, "");
    const res = await fetch(`${base}/payloads`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const body = (await res.json()) as { files?: unknown };
    const files = Array.isArray(body.files) ? body.files.map(String) : [];
    return new Set(files);
  } catch {
    return null;
  }
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

const asFacts = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = String(v);
  return out;
};

const asPlan = (value: unknown): PlanStep[] => (Array.isArray(value) ? (value as PlanStep[]) : []);

export const operationsRouter = router({
  /**
   * Inspect a set of abilities before launching: which #{facts} the operator
   * must supply (agent-derived ones are filtered out), and which payload files
   * are present on the C2.
   */
  previewFacts: publicProcedure
    .input(previewFactsInputSchema)
    .query(async ({ input }) => {
      const abilities = await prisma.ability.findMany({
        where: { ability_id: { in: input.abilityIds } },
      });

      const available = await fetchAvailablePayloads();
      const requiredFacts = new Set<string>();

      const abilityViews = input.abilityIds.map((abilityId) => {
        const ability = abilities.find((item) => item.ability_id === abilityId);
        if (!ability) {
          return { abilityId, found: false as const };
        }
        const placeholders = extractPlaceholders(ability.command);
        for (const key of placeholders) {
          if (!DERIVED.has(key)) requiredFacts.add(key);
        }
        const payloads = abilityPayloads(ability).map((name) => ({
          name,
          available: available === null ? null : available.has(name),
        }));
        return {
          abilityId,
          found: true as const,
          abilityName: ability.ability_name,
          platform: ability.platform,
          shellType: ability.shell_type,
          placeholders,
          payloads,
        };
      });

      return {
        requiredFacts: [...requiredFacts],
        abilities: abilityViews,
        payloadListingAvailable: available !== null,
      };
    }),

  create: publicProcedure
    .input(createOperationInputSchema)
    .mutation(async ({ input }) => {
      const abilities = await prisma.ability.findMany({
        where: { ability_id: { in: input.steps.map((step) => step.abilityId) } },
      });
      const nameById = new Map(abilities.map((a) => [a.ability_id, a.ability_name]));

      const plan: PlanStep[] = input.steps.map((step) => {
        const abilityName = nameById.get(step.abilityId);
        if (!abilityName) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Unknown ability: ${step.abilityId}` });
        }
        return { abilityId: step.abilityId, abilityName, captures: step.captures };
      });

      const operation = await prisma.operation.create({
        data: {
          name: input.name,
          targetPaws: input.targetPaws,
          targetGroup: input.targetGroup ?? null,
          plan: plan as unknown as Prisma.InputJsonValue,
          facts: input.facts,
          stopOnError: input.stopOnError,
        },
      });

      // Queue the first step for every target agent immediately.
      await advanceOperation(prisma, operation.id);

      return { id: operation.id };
    }),

  list: publicProcedure.query(async () => {
    const operations = await prisma.operation.findMany({ orderBy: { createdAt: "desc" } });
    const grouped = await prisma.agentInstruction.groupBy({
      by: ["operationId", "status"],
      where: { operationId: { in: operations.map((op) => op.id) } },
      _count: { _all: true },
    });

    return operations.map((op) => {
      const rows = grouped.filter((row) => row.operationId === op.id);
      const total = rows.reduce((sum, row) => sum + row._count._all, 0);
      const done = rows
        .filter((row) => ["COMPLETE", "TIMEOUT", "SKIPPED"].includes(row.status))
        .reduce((sum, row) => sum + row._count._all, 0);
      const paws = asStringArray(op.targetPaws);
      return {
        id: op.id,
        name: op.name,
        state: op.state,
        agentCount: paws.length,
        stepCount: asPlan(op.plan).length,
        completed: done,
        total,
        createdAt: op.createdAt.toISOString(),
        finishedAt: op.finishedAt?.toISOString() ?? null,
      };
    });
  }),

  get: publicProcedure.input(operationIdInputSchema).query(async ({ input }) => {
    const op = await prisma.operation.findUnique({ where: { id: input.id } });
    if (!op) throw new TRPCError({ code: "NOT_FOUND", message: "Operation not found" });

    const instructions = await prisma.agentInstruction.findMany({
      where: { operationId: op.id },
      include: { result: true },
      orderBy: [{ paw: "asc" }, { stepOrder: "asc" }],
    });

    return {
      operation: {
        id: op.id,
        name: op.name,
        state: op.state,
        targetPaws: asStringArray(op.targetPaws),
        targetGroup: op.targetGroup,
        stopOnError: op.stopOnError,
        createdAt: op.createdAt.toISOString(),
        finishedAt: op.finishedAt?.toISOString() ?? null,
      },
      plan: asPlan(op.plan),
      facts: asFacts(op.facts),
      cells: instructions.map((item) => ({
        id: item.id,
        paw: item.paw,
        stepOrder: item.stepOrder ?? 0,
        abilityId: item.abilityId,
        abilityName: item.abilityName,
        executor: item.executor,
        status: item.status,
        output: item.result?.output ?? "",
        stderr: item.result?.stderr ?? "",
        exitCode: item.result?.exitCode ?? "",
        queuedAt: item.queuedAt.toISOString(),
        completedAt: item.completedAt?.toISOString() ?? null,
      })),
    };
  }),

  setState: publicProcedure
    .input(setOperationStateInputSchema)
    .mutation(async ({ input }) => {
      const op = await prisma.operation.update({
        where: { id: input.id },
        data: {
          state: input.state,
          finishedAt: input.state === "FINISHED" ? new Date() : null,
        },
      });
      // Resuming a paused operation should pick up where it left off.
      if (input.state === "RUNNING") await advanceOperation(prisma, op.id);
      return { id: op.id, state: op.state };
    }),

  delete: publicProcedure.input(operationIdInputSchema).mutation(async ({ input }) => {
    await prisma.operation.delete({ where: { id: input.id } });
    return { id: input.id };
  }),
});
