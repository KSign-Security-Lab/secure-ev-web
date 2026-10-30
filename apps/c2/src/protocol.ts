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
