import { router, publicProcedure } from "../init";
import { env } from "~/config/env";
import { TRPCError } from "@trpc/server";
import {
  agentsListResponseSchema,
  agentStatisticsSchema,
} from "../schemas/responses";

export const agentsRouter = router({
  list: publicProcedure.output(agentsListResponseSchema).query(async () => {
    const endpoint = new URL("/api/v2/agents", env.DEFEND_API_URL);

    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        Key: env.DEFEND_API_KEY,
      },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch agents: ${response.status} ${text}`,
      });
    }
    const data = await response.json();
    // Validate and parse the response
    return agentsListResponseSchema.parse(data);
  }),

  statistics: publicProcedure
    .output(agentStatisticsSchema)
    .query(async () => {
      const endpoint = new URL("/api/v2/agents", env.DEFEND_API_URL);

      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Key: env.DEFEND_API_KEY,
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch agents: ${response.status} ${text}`,
        });
      }
      const data = await response.json();
      const agents = agentsListResponseSchema.parse(data);

      // Aggregate statistics
      const totalCount = agents.length;
      const trustedCount = agents.filter((agent) => agent.trusted).length;
      const untrustedCount = totalCount - trustedCount;

      // Group by platform
      const platformCounts: Record<string, number> = {};
      agents.forEach((agent) => {
        const platform = agent.platform || "Unknown";
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
      const byPlatform = Object.entries(platformCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Group by group
      const groupCounts: Record<string, number> = {};
      agents.forEach((agent) => {
        const group = agent.group || "Ungrouped";
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      });
      const byGroup = Object.entries(groupCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      // Group by privilege
      const privilegeCounts: Record<string, number> = {};
      agents.forEach((agent) => {
        const privilege = agent.privilege || "Unknown";
        privilegeCounts[privilege] = (privilegeCounts[privilege] || 0) + 1;
      });
      const byPrivilege = Object.entries(privilegeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      return {
        totalCount,
        trustedCount,
        untrustedCount,
        byPlatform,
        byGroup,
        byPrivilege,
      };
    }),
});
