import { z } from "zod";

/** A fact-capture rule attached to a plan step (see c2-core CaptureRule). */
export const captureRuleSchema = z.object({
  fact: z.string().trim().min(1),
  regex: z.string().min(1),
});

/** One ability in the operation plan, as submitted by the builder. */
export const planStepInputSchema = z.object({
  abilityId: z.string().min(1),
  captures: z.array(captureRuleSchema).default([]),
});

export const createOperationInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  targetPaws: z.array(z.string().min(1)).min(1),
  targetGroup: z.string().optional(),
  steps: z.array(planStepInputSchema).min(1),
  /** Operator-provided fact values for #{...} placeholders. */
  facts: z.record(z.string(), z.string()).default({}),
  stopOnError: z.boolean().default(false),
});

export const previewFactsInputSchema = z.object({
  abilityIds: z.array(z.string().min(1)).min(1),
});

export const operationStateSchema = z.enum(["RUNNING", "PAUSED", "FINISHED"]);

export const setOperationStateInputSchema = z.object({
  id: z.string().min(1),
  state: operationStateSchema,
});

export const operationIdInputSchema = z.object({ id: z.string().min(1) });
