/**
 * Shared shapes for the operation engine. These describe the JSON columns on
 * the `Operation` model, which Prisma types only as `JsonValue`.
 */

/** A rule that pulls a fact out of a step's output for later steps to use. */
export interface CaptureRule {
  /** Fact name to set, e.g. "host.user.name". Referenced later as #{host.user.name}. */
  fact: string;
  /**
   * JS regular expression source. The first capturing group (named or
   * positional) is the captured value; with no group, the whole match is used.
   */
  regex: string;
}

/** One ability in an operation plan (stored in `Operation.plan`). */
export interface PlanStep {
  abilityId: string;
  abilityName: string;
  /** Optional fact captures run against this step's output. */
  captures: CaptureRule[];
}

/** The shared fact store (stored in `Operation.facts`). */
export type FactStore = Record<string, string>;
