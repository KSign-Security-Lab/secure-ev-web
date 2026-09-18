import { router, publicProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { defendFetch } from "../utils/defendApi";
import {
  agentsListResponseSchema,
  agentStatisticsSchema,
  agentConfigSchema,
  agentConfigUpdateSchema,
  deployCommandsResponseSchema,
  sandcatDeployResponseSchema,
  DEPLOY_PLATFORMS,
} from "../schemas/responses";

/** The agent we ship deployment instructions for. */
const SANDCAT = "Sandcat";

/**
 * `app_config` values arrive as strings, numbers or string arrays. Commands only
 * ever interpolate them as text, so flatten everything to a string.
 */
const stringifyConfigValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join(",");
  if (value === null || value === undefined) return "";
  return String(value);
};

export const agentsRouter = router({
  list: publicProcedure.output(agentsListResponseSchema).query(async () => {
    const data = await defendFetch("/api/v2/agents");
    return agentsListResponseSchema.parse(data);
  }),

  statistics: publicProcedure.output(agentStatisticsSchema).query(async () => {
    const data = await defendFetch("/api/v2/agents");
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

  /**
   * Sandcat install commands for linux / windows / darwin.
   *
   * Commands keep their `#{...}` placeholders: substitution happens on the client
   * so the operator can edit the values and watch every command update live.
   */
  deployCommands: publicProcedure
    .output(sandcatDeployResponseSchema)
    .query(async () => {
      const data = await defendFetch("/api/v2/deploy_commands");
      const { abilities, app_config } = deployCommandsResponseSchema.parse(data);

      const deployments = DEPLOY_PLATFORMS.flatMap((platform) => {
        const ability = abilities.find(
          (item) => item.name === SANDCAT && item.platform === platform
        );
        if (!ability) return [];
        return [
          {
            platform,
            executor: ability.executor,
            description: ability.description,
            command: ability.command,
            variations: ability.variations,
          },
        ];
      });

      const appConfig = Object.fromEntries(
        Object.entries(app_config).map(([key, value]) => [
          key,
          stringifyConfigValue(value),
        ])
      );

      return { deployments, appConfig };
    }),

  /** Global agent configuration (beacon timers, implant name, ...). */
  config: publicProcedure.output(agentConfigSchema).query(async () => {
    const data = await defendFetch("/api/v2/config/agents");
    return agentConfigSchema.parse(data);
  }),

  updateConfig: publicProcedure
    .input(agentConfigUpdateSchema)
    .output(agentConfigSchema)
    .mutation(async ({ input }) => {
      await defendFetch("/api/v2/config/agents", {
        method: "PATCH",
        body: input,
      });

      // Caldera's PATCH response omits some fields, so read the config back.
      const data = await defendFetch("/api/v2/config/agents");
      const config = agentConfigSchema.parse(data);

      if (config.implant_name !== input.implant_name) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Agent configuration did not persist as requested",
        });
      }

      return config;
    }),
});
