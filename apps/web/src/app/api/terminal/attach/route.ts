import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "~/lib/prisma";

/**
 * Terminal heartbeat. While `interactiveUntil` is in the future the beacon
 * endpoint returns sleep=1, which is what makes the terminal feel live. The
 * window is deliberately short so an abandoned tab drops the agent back to its
 * normal beacon interval on its own.
 */
const WINDOW_MS = 30_000;

const bodySchema = z.object({
  paw: z.string().min(1),
  /** Send false when leaving the session to release the agent immediately. */
  attached: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { paw, attached } = parsed.data;
  const agent = await prisma.agent.findUnique({ where: { paw } });
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const previousAttachedAt =
    agent.interactiveUntil === null
      ? null
      : new Date(agent.interactiveUntil.getTime() - WINDOW_MS);

  await prisma.agent.update({
    where: { paw },
    data: { interactiveUntil: attached ? new Date(Date.now() + WINDOW_MS) : null },
  });

  const staleAfterMs = Math.max(agent.sleepMax, 1) * 2000;

  /**
   * The agent only learns it should beacon every second on its *next* beacon,
   * so until it has checked in since we attached, commands still wait out the
   * sleep interval it is currently in. Report that honestly rather than showing
   * a connected terminal that takes a minute to answer.
   */
  const interactive =
    previousAttachedAt !== null && agent.lastSeen > previousAttachedAt;

  return NextResponse.json({
    alive: Date.now() - agent.lastSeen.getTime() <= staleAfterMs,
    interactive,
    lastSeen: agent.lastSeen.toISOString(),
    sleepMax: agent.sleepMax,
  });
}
