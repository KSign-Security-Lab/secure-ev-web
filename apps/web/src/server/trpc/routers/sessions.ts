import { router, publicProcedure } from "../init";
import prisma from "~/lib/prisma";
import { sessionsListResponseSchema } from "../schemas/responses";

/**
 * Agents the terminal can attach to.
 *
 * This used to proxy Caldera's manx plugin; it now reads our own agent registry.
 * An agent counts as alive if it beaconed within twice its maximum sleep.
 */
export const sessionsRouter = router({
  list: publicProcedure.output(sessionsListResponseSchema).query(async () => {
    const agents = await prisma.agent.findMany({ orderBy: { lastSeen: "desc" } });
    const now = Date.now();

    return {
      sessions: agents.map((agent) => ({
        paw: agent.paw,
        info: agent.username ? `${agent.host} · ${agent.username}` : agent.host,
        platform: agent.platform,
        executors: Array.isArray(agent.executors)
          ? agent.executors.map((entry) => String(entry))
          : [],
        alive: now - agent.lastSeen.getTime() <= Math.max(agent.sleepMax, 1) * 2000,
        last_seen: agent.lastSeen.toISOString(),
      })),
    };
  }),
});
