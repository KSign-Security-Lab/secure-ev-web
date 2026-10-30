import type { CaptureRule, FactStore } from "./types";

/**
 * Fact handling for the operation engine — the server-side mirror of the
 * client helpers in `apps/web/src/utils/deployCommand.ts`. Abilities carry
 * `#{fact}` placeholders (Caldera's convention); the fact store fills them.
 */

const PLACEHOLDER_PATTERN = /#\{(.*?)\}/g;

/** Every distinct `#{...}` key in a command, in first-seen order. */
export function extractPlaceholders(command: string): string[] {
  const seen = new Set<string>();
  for (const match of command.matchAll(PLACEHOLDER_PATTERN)) {
    seen.add(match[1]);
  }
  return [...seen];
}

/** Replace every `#{key}` with its value; unknown keys are left untouched. */
export function substitute(command: string, values: FactStore): string {
  return command.replace(PLACEHOLDER_PATTERN, (original, key: string) =>
    key in values ? values[key] : original
  );
}

/** `#{...}` keys in the command that the given fact store cannot resolve. */
export function unresolvedPlaceholders(command: string, values: FactStore): string[] {
  return extractPlaceholders(command).filter((key) => !(key in values));
}

/** A minimal view of an agent — the fields facts are derived from. */
export interface AgentFactSource {
  paw: string;
  server: string;
  group: string;
  location: string;
  host: string;
  platform: string;
}

/**
 * Facts that come from the agent itself, so the operator never types them.
 * Mirrors the agent-scoped facts Caldera injects per link.
 */
export function agentDerivedFacts(agent: AgentFactSource): FactStore {
  return {
    paw: agent.paw,
    server: agent.server,
    group: agent.group,
    location: agent.location,
    host: agent.host,
    platform: agent.platform,
    // The agent's callback URL doubles as the app contact address.
    "app.contact.http": agent.server,
  };
}

/** The fact names `agentDerivedFacts` provides, for "already covered" checks. */
export const AGENT_DERIVED_FACT_KEYS = [
  "paw",
  "server",
  "group",
  "location",
  "host",
  "platform",
  "app.contact.http",
] as const;

/**
 * Run capture rules against a step's output and return the facts extracted.
 * The first capturing group is the value; with no group, the whole match.
 * A malformed regex captures nothing rather than throwing.
 */
export function applyCaptures(output: string, rules: CaptureRule[]): FactStore {
  const captured: FactStore = {};
  for (const rule of rules) {
    if (!rule.fact || !rule.regex) continue;
    let pattern: RegExp;
    try {
      pattern = new RegExp(rule.regex);
    } catch {
      continue;
    }
    const match = output.match(pattern);
    if (!match) continue;
    const value = match[1] ?? match[0];
    if (value !== undefined) captured[rule.fact] = value;
  }
  return captured;
}
