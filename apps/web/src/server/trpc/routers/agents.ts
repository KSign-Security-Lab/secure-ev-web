import { router, publicProcedure } from "../init";
import prisma from "~/lib/prisma";
import { getAgentConfig } from "~/server/c2/agentConfig";
import { DEPLOY_TEMPLATES } from "~/server/c2/deployTemplates";
import { defaultExecutor } from "~/server/c2/protocol";
import type { Agent } from "@secure-ev-web/prisma";
import {
  agentsListResponseSchema,
  agentStatisticsSchema,
  agentConfigSchema,
  agentConfigUpdateSchema,
  agentPawInputSchema,
  agentKillResponseSchema,
  agentRemoveResponseSchema,
  sandcatDeployResponseSchema,
} from "../schemas/responses";

/**
 * A command that makes the agent kill its own process on its next beacon.
 *
 * Sandcat reports its own PID in the beacon profile (`Agent.pid`), so we target
 * that directly. Stock sandcat has no persistence, so killing the process stops
 * the implant for good — it will not re-register. Returns null when the PID is
 * unknown (nothing to target), in which case the caller skips queueing.
 */
function selfKillCommand(platform: string, pid: number | null): string | null {
  if (pid == null) return null;
  return platform === "windows"
    ? `Stop-Process -Id ${pid} -Force`
    : `kill -9 ${pid}`;
}

/** Arrays are stored as Json because MySQL has no scalar list support. */
const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((entry) => String(entry)) : [];

/**
 * Present a stored agent in the shape the UI expects. `trusted`, `display_name`
 * and `created` are derived here rather than persisted.
 */
function presentAgent(agent: Agent, untrustedTimer: number) {
  const staleAfterMs = Math.max(untrustedTimer, 1) * 1000;
  const trusted = Date.now() - agent.lastSeen.getTime() <= staleAfterMs;

  return {
    paw: agent.paw,
    sleep_min: agent.sleepMin,
    sleep_max: agent.sleepMax,
    watchdog: agent.watchdog,
    group: agent.group,
    architecture: agent.architecture,
    platform: agent.platform,
    server: agent.server,
    upstream_dest: agent.upstreamDest,
    username: agent.username,
    location: agent.location,
    pid: agent.pid,
    ppid: agent.ppid,
    trusted,
    executors: toStringArray(agent.executors),
    privilege: agent.privilege,
    exe_name: agent.exeName,
    host: agent.host,
    contact: agent.contact,
    proxy_receivers: (agent.proxyReceivers ?? {}) as Record<string, unknown>,
    proxy_chain: Array.isArray(agent.proxyChain) ? agent.proxyChain : [],
    origin_link_id: agent.originLinkId,
    deadman_enabled: agent.deadmanEnabled,
    available_contacts: toStringArray(agent.availableContacts),
    host_ip_addrs: toStringArray(agent.hostIpAddrs),
    display_name: agent.username ? `${agent.host}$${agent.username}` : agent.host,
    created: agent.firstSeen.toISOString(),
    last_seen: agent.lastSeen.toISOString(),
    links: [],
    ...(agent.pendingContact ? { pending_contact: agent.pendingContact } : {}),
  };
}

async function listAgents() {
  const [config, agents] = await Promise.all([
    getAgentConfig(),
    prisma.agent.findMany({ orderBy: { lastSeen: "desc" } }),
  ]);
  return agents.map((agent) => presentAgent(agent, config.untrustedTimer));
}

export const agentsRouter = router({
  list: publicProcedure.output(agentsListResponseSchema).query(async () => {
    return agentsListResponseSchema.parse(await listAgents());
  }),

  statistics: publicProcedure.output(agentStatisticsSchema).query(async () => {
    const agents = await listAgents();

    const totalCount = agents.length;
    const trustedCount = agents.filter((agent) => agent.trusted).length;
    const untrustedCount = totalCount - trustedCount;

    const countBy = (pick: (agent: (typeof agents)[number]) => string) => {
      const counts: Record<string, number> = {};
      agents.forEach((agent) => {
        const key = pick(agent);
        counts[key] = (counts[key] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    };

    return {
      totalCount,
      trustedCount,
      untrustedCount,
      byPlatform: countBy((agent) => agent.platform || "Unknown"),
      byGroup: countBy((agent) => agent.group || "Ungrouped").slice(0, 8),
      byPrivilege: countBy((agent) => agent.privilege || "Unknown"),
    };
  }),

  /**
   * Sandcat install commands for linux / windows / darwin. Commands keep their
   * `#{...}` placeholders; substitution happens client-side so the operator can
   * edit the values and watch every command update live.
   */
  deployCommands: publicProcedure
    .output(sandcatDeployResponseSchema)
    .query(async () => {
      const config = await getAgentConfig();

      return {
        deployments: DEPLOY_TEMPLATES,
        appConfig: {
          "app.contact.http": config.c2Url,
          "agents.implant_name": config.implantName,
        },
      };
    }),

  config: publicProcedure.output(agentConfigSchema).query(async () => {
    const config = await getAgentConfig();
    return {
      implant_name: config.implantName,
      sleep_min: config.sleepMin,
      sleep_max: config.sleepMax,
      watchdog: config.watchdog,
      untrusted_timer: config.untrustedTimer,
      c2_url: config.c2Url,
      bootstrap_abilities: [],
      deployments: [],
    };
  }),

  updateConfig: publicProcedure
    .input(agentConfigUpdateSchema)
    .output(agentConfigSchema)
    .mutation(async ({ input }) => {
      await getAgentConfig();
      const config = await prisma.agentConfig.update({
        where: { id: 1 },
        data: {
          implantName: input.implant_name,
          sleepMin: input.sleep_min,
          sleepMax: input.sleep_max,
          watchdog: input.watchdog,
          untrustedTimer: input.untrusted_timer,
          ...(input.c2_url ? { c2Url: input.c2_url } : {}),
        },
      });

      // Existing agents pick up the new timers on their next beacon.
      await prisma.agent.updateMany({
        data: {
          sleepMin: config.sleepMin,
          sleepMax: config.sleepMax,
          watchdog: config.watchdog,
        },
      });

      return {
        implant_name: config.implantName,
        sleep_min: config.sleepMin,
        sleep_max: config.sleepMax,
        watchdog: config.watchdog,
        untrusted_timer: config.untrustedTimer,
        c2_url: config.c2Url,
        bootstrap_abilities: [],
        deployments: [],
      };
    }),

  /**
   * Stop a live implant. Queues a one-off instruction that kills the agent's own
   * process; the agent runs it on its next beacon and exits. This does NOT delete
   * the row — the agent must stay registered long enough to receive the kill. Once
   * it stops beaconing it goes untrusted and can be cleared with `remove`.
   */
  kill: publicProcedure
    .input(agentPawInputSchema)
    .output(agentKillResponseSchema)
    .mutation(async ({ input }) => {
      const agent = await prisma.agent.findUnique({ where: { paw: input.paw } });
      if (!agent) return { paw: input.paw, queued: false, instructionId: null };

      const command = selfKillCommand(agent.platform, agent.pid);
      if (!command) return { paw: input.paw, queued: false, instructionId: null };

      const instruction = await prisma.agentInstruction.create({
        data: {
          paw: input.paw,
          command: Buffer.from(command, "utf-8").toString("base64"),
          executor: defaultExecutor(agent.platform, toStringArray(agent.executors)),
          timeout: 60,
        },
      });

      return { paw: input.paw, queued: true, instructionId: instruction.id };
    }),

  /**
   * Remove an agent from the console. Deletes the row; the `onDelete: Cascade` on
   * AgentInstruction (and AgentResult) clears its tasking history with it.
   * Idempotent via deleteMany. Note: this does not stop a running implant — if the
   * process is still alive it will beacon again and re-register. Use `kill` first.
   */
  remove: publicProcedure
    .input(agentPawInputSchema)
    .output(agentRemoveResponseSchema)
    .mutation(async ({ input }) => {
      const { count } = await prisma.agent.deleteMany({
        where: { paw: input.paw },
      });
      return { paw: input.paw, removed: count > 0 };
    }),
});
