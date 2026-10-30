import type { IncomingMessage, ServerResponse } from "node:http";
import { advanceOperation, onInstructionComplete } from "@secure-ev-web/c2-core";
import prisma from "../prisma.js";
import { getAgentConfig } from "../agentConfig.js";
import { readBody, text } from "../http.js";
import {
  beaconProfileSchema,
  decodeAgentOutput,
  decodeBeaconBody,
  encodeBeaconResponse,
  generatePaw,
  type Instruction,
} from "../protocol.js";

/**
 * The C2 beacon endpoint.
 *
 * Agents POST here on their sleep interval. The path is hardcoded in the agent
 * (`gocat/contact/api.go`), so it must stay at exactly /beacon. It is
 * unauthenticated by design — stock sandcat sends no credentials — so this
 * service belongs on an isolated lab network.
 */

/** Sleep returned while an operator has the terminal attached. */
const INTERACTIVE_SLEEP_SECONDS = 1;

/** Bodies larger than this are not valid beacons; reject early. */
const MAX_BEACON_BYTES = 16 * 1024 * 1024;

const randomSleep = (min: number, max: number) =>
  min >= max ? min : min + Math.floor(Math.random() * (max - min + 1));

export async function handleBeacon(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let profile;
  try {
    const raw = (await readBody(req, MAX_BEACON_BYTES)).toString("utf-8");
    profile = beaconProfileSchema.parse(decodeBeaconBody(raw));
  } catch (error) {
    console.error("[c2] malformed beacon:", error);
    text(res, 400, "malformed beacon");
    return;
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
  const affectedOperations = new Set<string>();
  for (const result of profile.results) {
    const instruction = await prisma.agentInstruction.findUnique({
      where: { id: result.id },
    });
    if (!instruction) continue;

    const output = decodeAgentOutput(result.output);
    await prisma.$transaction([
      prisma.agentResult.upsert({
        where: { instructionId: instruction.id },
        create: {
          instructionId: instruction.id,
          output,
          stderr: decodeAgentOutput(result.stderr),
          exitCode: result.exit_code ?? "",
          status: result.status ?? "",
          pid: result.pid ?? "",
          agentReportedTime: result.agent_reported_time ?? "",
        },
        update: {
          output,
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

    // If this instruction was an operation step, apply its fact captures.
    const opId = await onInstructionComplete(prisma, instruction.id, output);
    if (opId) affectedOperations.add(opId);
  }

  // Queue the next step of any operation a result just advanced, before we claim
  // queued work below — so a freshly-queued step goes out in this same beacon.
  for (const operationId of affectedOperations) {
    await advanceOperation(prisma, operationId);
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
    payloads: Array.isArray(item.payloads) ? item.payloads.map(String) : [],
    uploads: [],
    sleep: 0,
    timeout: item.timeout,
    deadman: false,
  }));

  const isInteractive =
    agent.interactiveUntil !== null && agent.interactiveUntil > now;

  text(
    res,
    200,
    encodeBeaconResponse({
      paw,
      sleep: isInteractive
        ? INTERACTIVE_SLEEP_SECONDS
        : randomSleep(agent.sleepMin, agent.sleepMax),
      watchdog: agent.watchdog,
      instructions,
    })
  );
}
