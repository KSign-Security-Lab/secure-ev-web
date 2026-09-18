import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "~/lib/prisma";
import { defaultExecutor } from "~/server/c2/protocol";

/**
 * Queue a command for an agent. It is picked up on the agent's next beacon —
 * which is ~1s while the terminal is attached (see /api/terminal/attach).
 */
const bodySchema = z.object({
  paw: z.string().min(1),
  command: z.string().min(1),
  timeout: z.number().int().positive().max(600).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { paw, command, timeout } = parsed.data;
  const agent = await prisma.agent.findUnique({ where: { paw } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const executors = Array.isArray(agent.executors)
    ? agent.executors.map((entry) => String(entry))
    : [];

  const instruction = await prisma.agentInstruction.create({
    data: {
      paw,
      command: Buffer.from(command, "utf-8").toString("base64"),
      executor: defaultExecutor(agent.platform, executors),
      timeout: timeout ?? 60,
    },
  });

  return NextResponse.json({ instructionId: instruction.id });
}
