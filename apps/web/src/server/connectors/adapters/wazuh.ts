import {
  ConnectorError,
  connectorFetch,
  type ConnectorAdapter,
  type ConnectorContext,
  type FetchedLog,
} from "../types";

/**
 * Wazuh exchanges basic auth for a short-lived JWT before any other call.
 * `secret` holds "user:password".
 */
async function authenticate(ctx: ConnectorContext): Promise<string> {
  if (!ctx.baseUrl || !ctx.secret) {
    throw new ConnectorError("Wazuh requires both an endpoint and credentials");
  }

  const endpoint = new URL("/security/user/authenticate", ctx.baseUrl);
  const response = await connectorFetch(endpoint.toString(), {
    method: "POST",
    insecure: ctx.insecureTls,
    headers: {
      Authorization: `Basic ${Buffer.from(ctx.secret).toString("base64")}`,
    },
  });

  if (!response.ok) {
    throw new ConnectorError(
      `Authentication failed: ${response.status} ${response.statusText}`
    );
  }

  const body = await response.json();
  const token = body?.data?.token;
  if (typeof token !== "string") {
    throw new ConnectorError("Authentication response did not contain a token");
  }
  return token;
}

async function get(ctx: ConnectorContext, path: string, token: string) {
  const endpoint = new URL(path, ctx.baseUrl!);
  const response = await connectorFetch(endpoint.toString(), {
    insecure: ctx.insecureTls,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new ConnectorError(
      `${path} returned ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

export const wazuhAdapter: ConnectorAdapter = {
  key: "wazuh",
  name: "Wazuh",
  vendor: "Wazuh Inc.",
  category: "EDR",
  supportedModes: ["API"],
  requiresBaseUrl: true,
  requiresSecret: true,
  baseUrlExample: "https://wazuh.local:55000",

  async healthCheck(ctx) {
    const token = await authenticate(ctx);
    await get(ctx, "/agents?limit=1", token);
  },

  async fetchLogs(ctx) {
    const token = await authenticate(ctx);
    const body = await get(ctx, "/agents?limit=50", token);
    const agents = body?.data?.affected_items;

    if (!Array.isArray(agents)) {
      return [];
    }

    return agents.map<FetchedLog>((agent) => ({
      source: "wazuh/agents",
      severity: agent?.status === "active" ? "info" : "warning",
      message: `Agent ${agent?.name ?? "unknown"} (${agent?.id ?? "?"}) is ${agent?.status ?? "unknown"}`,
      raw: agent,
    }));
  },
};
