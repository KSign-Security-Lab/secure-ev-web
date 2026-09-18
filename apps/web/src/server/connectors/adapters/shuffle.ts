import {
  ConnectorError,
  connectorFetch,
  type ConnectorAdapter,
  type ConnectorContext,
  type FetchedLog,
} from "../types";

async function get(ctx: ConnectorContext, path: string) {
  if (!ctx.baseUrl || !ctx.secret) {
    throw new ConnectorError("Shuffle requires both an endpoint and an API key");
  }

  const endpoint = new URL(path, ctx.baseUrl);
  const response = await connectorFetch(endpoint.toString(), {
    headers: { Authorization: `Bearer ${ctx.secret}` },
  });

  if (!response.ok) {
    throw new ConnectorError(
      `${path} returned ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

export const shuffleAdapter: ConnectorAdapter = {
  key: "shuffle",
  name: "Shuffle",
  vendor: "Shuffle AS",
  category: "SOAR",
  supportedModes: ["API"],
  requiresBaseUrl: true,
  requiresSecret: true,
  baseUrlExample: "https://shuffle.local:3443",

  async healthCheck(ctx) {
    await get(ctx, "/api/v1/workflows");
  },

  async fetchLogs(ctx) {
    const workflows = await get(ctx, "/api/v1/workflows");

    if (!Array.isArray(workflows)) {
      return [];
    }

    return workflows.slice(0, 50).map<FetchedLog>((workflow) => ({
      source: "shuffle/workflows",
      severity: "info",
      message: `Workflow ${workflow?.name ?? "unnamed"} (${workflow?.id ?? "?"})`,
      raw: workflow,
    }));
  },
};
