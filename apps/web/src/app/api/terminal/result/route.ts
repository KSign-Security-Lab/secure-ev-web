import { NextRequest, NextResponse } from "next/server";
import prisma from "~/lib/prisma";

/**
 * Poll for a queued command's result.
 *
 * On completion this returns the same frame shape the terminal already parses
 * (`components/page/playground/Terminal/utils.ts`), so the display layer did not
 * need to change when the transport moved off the manx WebSocket.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const instruction = await prisma.agentInstruction.findUnique({
    where: { id },
    include: { result: true },
  });

  if (!instruction) {
    return NextResponse.json({ error: "Unknown instruction" }, { status: 404 });
  }

  if (instruction.status !== "COMPLETE" || !instruction.result) {
    return NextResponse.json({ state: instruction.status });
  }

  const { result } = instruction;
  const body = [result.output, result.stderr].filter(Boolean).join("\n");
  const elapsedMs = instruction.completedAt
    ? instruction.completedAt.getTime() - instruction.queuedAt.getTime()
    : null;

  return NextResponse.json({
    state: "COMPLETE",
    response: body,
    status: result.exitCode || result.status || "0",
    response_time: elapsedMs === null ? undefined : `${(elapsedMs / 1000).toFixed(1)}s`,
  });
}
