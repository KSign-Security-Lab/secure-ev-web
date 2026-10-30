import { test } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@secure-ev-web/prisma";
import { advanceOperation, onInstructionComplete, buildStep, abilityPayloads } from "./operations";

/**
 * A tiny in-memory stand-in for the slice of PrismaClient the engine touches.
 * Enough to drive the operation state machine without a database.
 */
type Row = Record<string, unknown>;

function fakePrisma(seed: { operations: Row[]; abilities: Row[]; agents: Row[] }) {
  const operations = seed.operations;
  const abilities = seed.abilities;
  const agents = seed.agents;
  const instructions: Row[] = [];
  let nextId = 1;

  const matchIn = (value: unknown, where: Row): boolean =>
    Object.entries(where).every(([key, cond]) => {
      if (cond && typeof cond === "object" && "in" in (cond as Row)) {
        return ((cond as Row).in as unknown[]).includes((value as Row)[key]);
      }
      return (value as Row)[key] === cond;
    });

  const client = {
    operation: {
      findUnique: async ({ where }: { where: Row }) =>
        operations.find((op) => op.id === where.id) ?? null,
      update: async ({ where, data }: { where: Row; data: Row }) => {
        const op = operations.find((item) => item.id === where.id)!;
        Object.assign(op, data);
        return op;
      },
    },
    ability: {
      findMany: async ({ where }: { where: Row }) =>
        abilities.filter((ability) =>
          ((where.ability_id as Row).in as unknown[]).includes(ability.ability_id)
        ),
    },
    agent: {
      findUnique: async ({ where }: { where: Row }) =>
        agents.find((agent) => agent.paw === where.paw) ?? null,
    },
    agentInstruction: {
      findMany: async ({ where }: { where: Row }) =>
        instructions
          .filter((item) => matchIn(item, where))
          .sort((a, b) => Number(a.stepOrder ?? 0) - Number(b.stepOrder ?? 0)),
      create: async ({ data }: { data: Row }) => {
        const row = { id: `i${nextId++}`, status: "QUEUED", ...data };
        instructions.push(row);
        return row;
      },
      count: async ({ where }: { where: Row }) =>
        instructions.filter((item) => matchIn(item, where)).length,
      findUnique: async ({ where }: { where: Row }) =>
        instructions.find((item) => item.id === where.id) ?? null,
    },
    __instructions: instructions,
  };
  return client as unknown as PrismaClient & { __instructions: Row[] };
}

const linuxAgent = {
  paw: "p1",
  server: "http://c2:4204",
  group: "red",
  location: "/tmp",
  host: "h1",
  platform: "linux",
  executors: ["sh"],
};

const abEcho = {
  ability_id: "echo",
  ability_name: "Echo a fact",
  command: "echo FACT=abc123",
  shell_type: "sh",
  payload: "",
};
const abUse = {
  ability_id: "use",
  ability_name: "Use the fact",
  command: "echo got #{demo.v}",
  shell_type: "sh",
  payload: "",
};
const abWin = {
  ability_id: "win",
  ability_name: "Windows only",
  command: "whoami",
  shell_type: "psh",
  payload: "",
};

test("buildStep resolves executor, facts and payloads", () => {
  const built = buildStep(
    { command: "cat #{paw}", shell_type: "sh", payload: "a.sh, b.exe" },
    linuxAgent,
    ["sh"],
    {}
  );
  assert.ok(built.ok);
  if (built.ok) {
    assert.equal(Buffer.from(built.command).toString(), "cat p1");
    assert.equal(built.executor, "sh");
    assert.deepEqual(built.payloads, ["a.sh", "b.exe"]);
  }
});

test("buildStep fails on incompatible executor and on unresolved facts", () => {
  const noExec = buildStep({ command: "whoami", shell_type: "psh", payload: "" }, linuxAgent, ["sh"], {});
  assert.equal(noExec.ok, false);
  const noFact = buildStep({ command: "echo #{x.y}", shell_type: "sh", payload: "" }, linuxAgent, ["sh"], {});
  assert.equal(noFact.ok, false);
});

test("abilityPayloads splits and trims", () => {
  assert.deepEqual(abilityPayloads({ payload: " a , b ,," }), ["a", "b"]);
  assert.deepEqual(abilityPayloads({ payload: "" }), []);
});

test("advanceOperation queues one step at a time and finishes", async () => {
  const op: Row = {
    id: "op1",
    state: "RUNNING",
    targetPaws: ["p1"],
    facts: {},
    stopOnError: false,
    plan: [
      { abilityId: "echo", abilityName: "Echo a fact", captures: [{ fact: "demo.v", regex: "FACT=(\\w+)" }] },
      { abilityId: "use", abilityName: "Use the fact", captures: [] },
    ],
  };
  const prisma = fakePrisma({ operations: [op], abilities: [abEcho, abUse], agents: [linuxAgent] });

  // Step 0 queued.
  await advanceOperation(prisma, "op1");
  assert.equal(prisma.__instructions.length, 1);
  assert.equal(prisma.__instructions[0].stepOrder, 0);
  assert.equal(prisma.__instructions[0].status, "QUEUED");

  // While it is still pending, nothing new is queued.
  await advanceOperation(prisma, "op1");
  assert.equal(prisma.__instructions.length, 1);

  // Complete step 0 with output; its capture seeds demo.v for step 1.
  prisma.__instructions[0].status = "COMPLETE";
  const opId = await onInstructionComplete(prisma, prisma.__instructions[0].id as string, "FACT=abc123");
  assert.equal(opId, "op1");
  assert.equal((op.facts as Record<string, string>)["demo.v"], "abc123");

  // Step 1 now queues, using the captured fact.
  await advanceOperation(prisma, "op1");
  assert.equal(prisma.__instructions.length, 2);
  const step1 = prisma.__instructions[1];
  assert.equal(step1.stepOrder, 1);
  assert.equal(Buffer.from(step1.command as string, "base64").toString(), "echo got abc123");

  // Complete step 1 → operation finishes.
  step1.status = "COMPLETE";
  await advanceOperation(prisma, "op1");
  assert.equal(op.state, "FINISHED");
});

test("advanceOperation skips a step with no compatible executor", async () => {
  const op: Row = {
    id: "op2",
    state: "RUNNING",
    targetPaws: ["p1"],
    facts: {},
    stopOnError: false,
    plan: [{ abilityId: "win", abilityName: "Windows only", captures: [] }],
  };
  const prisma = fakePrisma({ operations: [op], abilities: [abWin], agents: [linuxAgent] });
  await advanceOperation(prisma, "op2");
  assert.equal(prisma.__instructions.length, 1);
  assert.equal(prisma.__instructions[0].status, "SKIPPED");
  assert.equal(op.state, "FINISHED");
});
