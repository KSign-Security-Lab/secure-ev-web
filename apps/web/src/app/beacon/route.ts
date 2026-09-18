import { NextRequest, NextResponse } from "next/server";
import prisma from "~/lib/prisma";
import { getAgentConfig } from "~/server/c2/agentConfig";
import {
  beaconProfileSchema,
  decodeAgentOutput,
  decodeBeaconBody,
  encodeBeaconResponse,
  generatePaw,
  type Instruction,
} from "~/server/c2/protocol";

/**
 * The C2 beacon endpoint.
 *
 * Agents POST here on their sleep interval. The path is hardcoded in the agent
 * (`gocat/contact/api.go`), so it must stay at exactly /beacon. It is
 * unauthenticated by design — stock sandcat sends no credentials — so this app
 * belongs on an isolated lab network.
 */

/** Sleep returned while an operator has the terminal attached. */
const INTERACTIVE_SLEEP_SECONDS = 1;

const randomSleep = (min: number, max: number) =>
  min >= max ? min : min + Math.floor(Math.random() * (max - min + 1));

export async function POST(request: NextRequest) {
  let profile;
  try {
    const raw = await request.text();
    profile = beaconProfileSchema.parse(decodeBeaconBody(raw));
  } catch (error) {
    // Mirror Caldera: log and reject rather than 500.
    // eslint-disable-next-line no-console
    console.error("[c2] malformed beacon:", error);
    return new NextResponse("malformed beacon", { status: 400 });
  }

  const config = await getAgentConfig();
  const paw = profile.paw?.trim() || generatePaw();
  const now = new Date();

  const agent = await prisma.agent.upsert({
    where: { paw },
    create: {
      paw,
      group: profile.group || "red",
      architecture: profile.architecture ?? "",
      platform: profile.platform ?? "",
      server: profile.server ?? "",
      upstreamDest: profile.upstream_dest ?? "",
      username: profile.username ?? "",
      location: profile.location ?? "",
      pid: profile.pid,
      ppid: profile.ppid,
      executors: profile.executors ?? [],
      privilege: profile.privilege ?? "",
      exeName: profile.exe_name ?? "",
      host: profile.host ?? "",
      contact: profile.contact || "HTTP",
      proxyReceivers: (profile.proxy_receivers ?? {}) as object,
      proxyChain: (profile.proxy_chain ?? []) as object,
      originLinkId: profile.origin_link_id ?? "",
      deadmanEnabled: profile.deadman_enabled,
      availableContacts: profile.available_contacts ?? [],
      hostIpAddrs: profile.host_ip_addrs ?? [],
      sleepMin: config.sleepMin,
      sleepMax: config.sleepMax,
      watchdog: config.watchdog,
      firstSeen: now,
      lastSeen: now,
    },
    update: {
      group: profile.group || "red",
      architecture: profile.architecture ?? "",
      platform: profile.platform ?? "",
      server: profile.server ?? "",
      upstreamDest: profile.upstream_dest ?? "",
      username: profile.username ?? "",
      location: profile.location ?? "",
      pid: profile.pid,
      ppid: profile.ppid,
      executors: profile.executors ?? [],
      privilege: profile.privilege ?? "",
      exeName: profile.exe_name ?? "",
      host: profile.host ?? "",
      contact: profile.contact || "HTTP",
      originLinkId: profile.origin_link_id ?? "",
      deadmanEnabled: profile.deadman_enabled,
      availableContacts: profile.available_contacts ?? [],
      hostIpAddrs: profile.host_ip_addrs ?? [],
      lastSeen: now,
    },
  });

  // Store results for instructions issued on an earlier beacon.
  for (const result of profile.results) {
    const instruction = await prisma.agentInstruction.findUnique({
      where: { id: result.id },
    });
    if (!instruction) continue;

    await prisma.$transaction([
      prisma.agentResult.upsert({
        where: { instructionId: instruction.id },
        create: {
          instructionId: instruction.id,
          output: decodeAgentOutput(result.output),
          stderr: decodeAgentOutput(result.stderr),
          exitCode: result.exit_code ?? "",
          status: result.status ?? "",
          pid: result.pid ?? "",
          agentReportedTime: result.agent_reported_time ?? "",
        },
        update: {
          output: decodeAgentOutput(result.output),
          stderr: decodeAgentOutput(result.stderr),
          exitCode: result.exit_code ?? "",
          status: result.status ?? "",
          pid: result.pid ?? "",
          agentReportedTime: result.agent_reported_time ?? "",
        },
      }),
      prisma.agentInstruction.update({
        where: { id: instruction.id },
        data: { status: "COMPLETE", completedAt: now },
      }),
    ]);
  }

  // Claim anything queued for this agent.
  const queued = await prisma.agentInstruction.findMany({
    where: { paw, status: "QUEUED" },
    orderBy: { queuedAt: "asc" },
  });

  if (queued.length > 0) {
    await prisma.agentInstruction.updateMany({
      where: { id: { in: queued.map((item) => item.id) } },
      data: { status: "SENT", sentAt: now },
    });
  }

  const instructions: Instruction[] = queued.map((item) => ({
    id: item.id,
    command: item.command,
    executor: item.executor,
    payloads: [],
    uploads: [],
    sleep: 0,
    timeout: item.timeout,
    deadman: false,
  }));

  const isInteractive =
    agent.interactiveUntil !== null && agent.interactiveUntil > now;

  return new NextResponse(
    encodeBeaconResponse({
      paw,
      sleep: isInteractive
        ? INTERACTIVE_SLEEP_SECONDS
        : randomSleep(agent.sleepMin, agent.sleepMax),
      watchdog: agent.watchdog,
      instructions,
    }),
    { headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } }
  );
}
