import { z } from "zod";

/**
 * The sandcat HTTP contact protocol.
 *
 * Verified against the agent source (MITRE Caldera, Apache-2.0):
 *   - `gocat/contact/api.go`      — base64 envelope both directions
 *   - `gocat/agent/agent.go`      — the profile it sends, the results it returns
 *   - `gocat/core/core.go`        — the type assertions it makes on instructions
 *   - `gocat/execute/execute.go`  — command is base64; output/stderr are []byte
 *
 * Deviating from any of this breaks agents silently, so the details matter.
 */

/** Numbers arrive as numbers or numeric strings depending on platform. */
const looseInt = z.union([z.number(), z.string()]).nullish().transform((value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
});

const looseString = z.unknown().transform((value) =>
  value === null || value === undefined ? "" : String(value)
);

const looseStringArray = z.unknown().transform((value) =>
  Array.isArray(value) ? value.map((entry) => String(entry)) : []
);

/** A result for a previously issued instruction, carried on the next beacon. */
export const agentResultSchema = z.object({
  id: z.string(),
  output: z.string().optional().default(""),
  stderr: z.string().optional().default(""),
  exit_code: looseString.optional(),
  status: looseString.optional(),
  pid: looseString.optional(),
  agent_reported_time: looseString.optional(),
});

/** What the agent POSTs to /beacon (`agent.go:GetFullProfile`). */
export const beaconProfileSchema = z.object({
  paw: z.string().nullish(),
  server: looseString.optional(),
  group: looseString.optional(),
  host: looseString.optional(),
  contact: looseString.optional(),
  username: looseString.optional(),
  architecture: looseString.optional(),
  platform: looseString.optional(),
  location: looseString.optional(),
  pid: looseInt,
  ppid: looseInt,
  executors: looseStringArray.optional(),
  privilege: looseString.optional(),
  exe_name: looseString.optional(),
  proxy_receivers: z.unknown().optional(),
  proxy_chain: z.unknown().optional(),
  origin_link_id: looseString.optional(),
  deadman_enabled: z.boolean().optional().default(false),
  available_contacts: looseStringArray.optional(),
  host_ip_addrs: looseStringArray.optional(),
  upstream_dest: looseString.optional(),
  results: z.array(agentResultSchema).optional().default([]),
});

export type BeaconProfile = z.infer<typeof beaconProfileSchema>;

/** Agent columns a beacon can set, as written to the Agent row. */
export interface AgentProfileFields {
  group?: string;
  architecture?: string;
  platform?: string;
  server?: string;
  upstreamDest?: string;
  username?: string;
  location?: string;
  pid?: number | null;
  ppid?: number | null;
  executors?: string[];
  privilege?: string;
  exeName?: string;
  host?: string;
  contact?: string;
  proxyReceivers?: object;
  proxyChain?: object;
  originLinkId?: string;
  deadmanEnabled?: boolean;
  availableContacts?: string[];
  hostIpAddrs?: string[];
}

/**
 * The profile fields to write for one beacon, limited to the keys the agent
 * actually sent.
 *
 * The agent does not always send its full profile. When it reports a result it
 * sends a trimmed one (`agent.go:GetTrimmedProfile` — paw, server, platform,
 * host, contact, upstream_dest only). Treating absent keys as empty would wipe
 * the stored executors, group, username, pid, ... until the next full beacon,
 * and the operation engine — which runs right after a result lands — would then
 * see an agent with no executors and skip every later step. So a key the agent
 * left out leaves the stored value alone.
 */
export function profileFieldsFromBeacon(raw: unknown, profile: BeaconProfile): AgentProfileFields {
  const sent = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(sent, key);
  const fields: AgentProfileFields = {};

  if (has("group")) fields.group = profile.group || "red";
  if (has("architecture")) fields.architecture = profile.architecture ?? "";
  if (has("platform")) fields.platform = profile.platform ?? "";
  if (has("server")) fields.server = profile.server ?? "";
  if (has("upstream_dest")) fields.upstreamDest = profile.upstream_dest ?? "";
  if (has("username")) fields.username = profile.username ?? "";
  if (has("location")) fields.location = profile.location ?? "";
  if (has("pid")) fields.pid = profile.pid;
  if (has("ppid")) fields.ppid = profile.ppid;
  if (has("executors")) fields.executors = profile.executors ?? [];
  if (has("privilege")) fields.privilege = profile.privilege ?? "";
  if (has("exe_name")) fields.exeName = profile.exe_name ?? "";
  if (has("host")) fields.host = profile.host ?? "";
  if (has("contact")) fields.contact = profile.contact || "HTTP";
  if (has("proxy_receivers")) fields.proxyReceivers = (profile.proxy_receivers ?? {}) as object;
  if (has("proxy_chain")) fields.proxyChain = (profile.proxy_chain ?? []) as object;
  if (has("origin_link_id")) fields.originLinkId = profile.origin_link_id ?? "";
  if (has("deadman_enabled")) fields.deadmanEnabled = profile.deadman_enabled;
  if (has("available_contacts")) fields.availableContacts = profile.available_contacts ?? [];
  if (has("host_ip_addrs")) fields.hostIpAddrs = profile.host_ip_addrs ?? [];

  return fields;
}

/**
 * One instruction. Every field is mandatory: the agent uses Go type assertions
 * (`instruction["deadman"].(bool)`, `["sleep"].(float64)`, `["timeout"].(float64)`,
 * `["executor"].(string)`) which panic rather than error on a missing key.
 */
export interface Instruction {
  id: string;
  /** base64 — the agent decodes it before executing. */
  command: string;
  executor: string;
  payloads: string[];
  uploads: string[];
  sleep: number;
  timeout: number;
  deadman: boolean;
}

export const decodeBeaconBody = (raw: string): unknown =>
  JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));

/**
 * Build the beacon response.
 *
 * `instructions` is DOUBLE encoded — a JSON string containing an array of JSON
 * strings (`contact_http.py:29`) — and the whole envelope is then base64'd.
 */
export const encodeBeaconResponse = (response: {
  paw: string;
  sleep: number;
  watchdog: number;
  instructions: Instruction[];
}): string => {
  const envelope = {
    paw: response.paw,
    sleep: response.sleep,
    watchdog: response.watchdog,
    instructions: JSON.stringify(
      response.instructions.map((instruction) => JSON.stringify(instruction))
    ),
  };
  return Buffer.from(JSON.stringify(envelope), "utf-8").toString("base64");
};

/** The agent sends output/stderr as Go []byte, which marshals to base64. */
export const decodeAgentOutput = (value: string): string => {
  if (!value) return "";
  const decoded = Buffer.from(value, "base64").toString("utf-8");
  // Guard against a non-base64 payload round-tripping into mojibake.
  return Buffer.from(decoded, "utf-8").toString("base64") === value ? decoded : value;
};

/** Caldera generates a 6-character lowercase alphanumeric paw. */
export const generatePaw = (): string => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let paw = "";
  for (let i = 0; i < 6; i += 1) {
    paw += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return paw;
};

/** Default executor for a platform, used when tasking from the terminal. */
export const defaultExecutor = (platform: string, executors: string[]): string => {
  const preferred = platform === "windows" ? ["psh", "cmd"] : ["sh", "bash"];
  return preferred.find((name) => executors.includes(name)) ?? executors[0] ?? "sh";
};
