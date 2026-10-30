import type { PrismaClient, Prisma, Agent, Ability } from "@secure-ev-web/prisma";
import type { FactStore, PlanStep } from "./types";
import { agentDerivedFacts, applyCaptures, substitute, unresolvedPlaceholders } from "./facts";
import { resolveExecutor } from "./executor";

/**
 * The operation engine.
 *
 * An operation is an ordered plan of abilities fanned out across a set of
 * agents. `advanceOperation` is the state machine: for each agent it keeps at
 * most one step in flight, queuing the next only once the previous one is
 * terminal. It is idempotent and safe to call repeatedly — on operation create
 * (web) and whenever a result lands (C2 beacon).
 */

/** Terminal instruction statuses — a step is "done" when it reaches one of these. */
const TERMINAL = new Set(["COMPLETE", "TIMEOUT", "SKIPPED"]);
const PENDING = new Set(["QUEUED", "SENT"]);

const encodeCommand = (command: string): string =>
  Buffer.from(command, "utf-8").toString("base64");

/** Payload filenames an ability references, as stored comma-joined. */
export function abilityPayloads(ability: Pick<Ability, "payload">): string[] {
  return (ability.payload ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

type BuiltStep =
  | { ok: true; command: string; executor: string; payloads: string[] }
  | { ok: false; reason: "no-executor" | "unresolved-facts" };

/** Resolve one plan step for one agent into a tasking, or a skip reason. */
export function buildStep(
  ability: Pick<Ability, "command" | "shell_type" | "payload">,
  agent: Pick<Agent, "paw" | "server" | "group" | "location" | "host" | "platform">,
  executors: string[],
  facts: FactStore
): BuiltStep {
  const executor = resolveExecutor(ability.shell_type, executors);
  if (!executor) return { ok: false, reason: "no-executor" };

  const resolved = { ...facts, ...agentDerivedFacts(agent) };
  const command = substitute(ability.command, resolved);
  if (unresolvedPlaceholders(ability.command, resolved).length > 0) {
    return { ok: false, reason: "unresolved-facts" };
  }

  return { ok: true, command, executor, payloads: abilityPayloads(ability) };
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((entry) => String(entry)) : [];

const asFactStore = (value: unknown): FactStore => {
  if (!value || typeof value !== "object") return {};
  const out: FactStore = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = String(val);
  }
  return out;
};

const asPlan = (value: unknown): PlanStep[] =>
  Array.isArray(value) ? (value as PlanStep[]) : [];

/**
 * Queue the next runnable step for every agent in the operation, and mark the
 * operation FINISHED once every agent has a terminal entry for every step.
 */
export async function advanceOperation(prisma: PrismaClient, operationId: string): Promise<void> {
  const op = await prisma.operation.findUnique({ where: { id: operationId } });
  if (!op || op.state !== "RUNNING") return;

  const plan = asPlan(op.plan);
  const paws = asStringArray(op.targetPaws);
  const facts = asFactStore(op.facts);
  if (plan.length === 0 || paws.length === 0) return;

  const abilities = await prisma.ability.findMany({
    where: { ability_id: { in: plan.map((step) => step.abilityId) } },
  });
  const abilityById = new Map(abilities.map((ability) => [ability.ability_id, ability]));

  const existing = await prisma.agentInstruction.findMany({
    where: { operationId },
    orderBy: { stepOrder: "asc" },
  });

  for (const paw of paws) {
    const agent = await prisma.agent.findUnique({ where: { paw } });
    const steps = existing.filter((item) => item.paw === paw);

    // If a step is still in flight, leave this agent until it reports back.
    if (steps.some((item) => PENDING.has(item.status))) continue;

    let idx = steps.length;
    // A vanished agent cannot be tasked; skip its remaining steps so the
    // operation can still finish.
    if (!agent) {
      await skipRemaining(prisma, operationId, paw, plan, idx);
      continue;
    }

    const executors = asStringArray(agent.executors);

    while (idx < plan.length) {
      const step = plan[idx];
      const ability = abilityById.get(step.abilityId);
      const built = ability ? buildStep(ability, agent, executors, facts) : null;

      if (built?.ok) {
        await prisma.agentInstruction.create({
          data: {
            paw,
            command: encodeCommand(built.command),
            executor: built.executor,
            payloads: built.payloads as Prisma.InputJsonValue,
            operationId,
            stepOrder: idx,
            abilityId: step.abilityId,
            abilityName: step.abilityName,
          },
        });
        // One step in flight; stop here for this agent.
        break;
      }

      // Ability missing from the table, no compatible executor, or unresolved
      // facts — this step cannot run on this agent.
      await createSkipped(prisma, operationId, paw, step, idx);
      if (op.stopOnError) {
        await skipRemaining(prisma, operationId, paw, plan, idx + 1);
        break;
      }
      idx += 1;
    }
  }

  await maybeFinish(prisma, operationId, paws.length, plan.length);
}

function createSkipped(
  prisma: PrismaClient,
  operationId: string,
  paw: string,
  step: PlanStep,
  idx: number
) {
  return prisma.agentInstruction.create({
    data: {
      paw,
      command: "",
      executor: "",
      status: "SKIPPED",
      operationId,
      stepOrder: idx,
      abilityId: step.abilityId,
      abilityName: step.abilityName,
    },
  });
}

async function skipRemaining(
  prisma: PrismaClient,
  operationId: string,
  paw: string,
  plan: PlanStep[],
  from: number
): Promise<void> {
  for (let idx = from; idx < plan.length; idx += 1) {
    await createSkipped(prisma, operationId, paw, plan[idx], idx);
  }
}

async function maybeFinish(
  prisma: PrismaClient,
  operationId: string,
  agentCount: number,
  stepCount: number
): Promise<void> {
  const pending = await prisma.agentInstruction.count({
    where: { operationId, status: { in: ["QUEUED", "SENT"] } },
  });
  if (pending > 0) return;

  const total = await prisma.agentInstruction.count({ where: { operationId } });
  if (total >= agentCount * stepCount) {
    await prisma.operation.update({
      where: { id: operationId },
      data: { state: "FINISHED", finishedAt: new Date() },
    });
  }
}

/**
 * Handle a completed operation step: run its capture rules against the decoded
 * output and merge any facts into the operation store. Returns the operation id
 * so the caller can advance it, or null if the instruction is not part of one.
 */
export async function onInstructionComplete(
  prisma: PrismaClient,
  instructionId: string,
  decodedOutput: string
): Promise<string | null> {
  const instruction = await prisma.agentInstruction.findUnique({
    where: { id: instructionId },
  });
  if (!instruction?.operationId || instruction.stepOrder === null) return null;

  const op = await prisma.operation.findUnique({ where: { id: instruction.operationId } });
  if (!op) return null;

  const plan = asPlan(op.plan);
  const step = plan[instruction.stepOrder];
  const rules = step?.captures ?? [];
  if (rules.length > 0) {
    const captured = applyCaptures(decodedOutput, rules);
    if (Object.keys(captured).length > 0) {
      const merged = { ...asFactStore(op.facts), ...captured };
      await prisma.operation.update({
        where: { id: op.id },
        data: { facts: merged as Prisma.InputJsonValue },
      });
    }
  }

  return op.id;
}

export { TERMINAL as TERMINAL_STATUSES };
