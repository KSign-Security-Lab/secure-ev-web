import { z } from "zod";

export const integrationModeSchema = z.enum(["API", "AGENT"]);
export const integrationCategorySchema = z.enum([
  "SOAR",
  "EDR",
  "NDR",
  "INTEL",
  "OS",
  "C2",
]);
export const integrationStatusSchema = z.enum([
  "PENDING",
  "CONNECTED",
  "ERROR",
  "DISABLED",
]);

/**
 * One row of the Integrations table: the adapter's static description merged
 * with the configured instance, if one exists.
 */
export const integrationSchema = z.object({
  adapterKey: z.string(),
  name: z.string(),
  vendor: z.string(),
  category: integrationCategorySchema,
  /** The route in use, or the only available one when not configured yet. */
  mode: integrationModeSchema,
  /** Routes this product supports; longer than one means the operator picks. */
  supportedModes: z.array(integrationModeSchema),
  status: integrationStatusSchema,
  configured: z.boolean(),
  requiresBaseUrl: z.boolean(),
  requiresSecret: z.boolean(),
  baseUrlExample: z.string().nullable(),
  baseUrl: z.string().nullable(),
  /** Masked; the stored secret never leaves the server. */
  secretMasked: z.string().nullable(),
  /** Accept a self-signed TLS cert (e.g. Wazuh's default API cert). */
  insecureTls: z.boolean(),
  lastSyncAt: z.string().nullable(),
  lastError: z.string().nullable(),
  collectedCount: z.number(),
});

export const integrationsListResponseSchema = z.array(integrationSchema);

export const adapterKeyInputSchema = z.object({
  adapterKey: z.string().min(1),
});

export const upsertIntegrationInputSchema = z.object({
  adapterKey: z.string().min(1),
  mode: integrationModeSchema,
  baseUrl: z.string().trim().min(1).nullable().optional(),
  /** Omit to keep the stored secret untouched. */
  secret: z.string().trim().min(1).nullable().optional(),
  insecureTls: z.boolean().optional(),
});

export const collectedLogSchema = z.object({
  id: z.string(),
  source: z.string(),
  severity: z.string().nullable(),
  message: z.string(),
  /** When it happened on the source; null when the record did not say. */
  occurredAt: z.string().nullable(),
  /** When the platform received it. */
  collectedAt: z.string(),
  /** The record exactly as delivered (EventID, Channel, ProviderName, ...). */
  raw: z.unknown(),
});

export const collectedLogsResponseSchema = z.array(collectedLogSchema);

export const testConnectionResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
});

export const syncResponseSchema = z.object({
  ok: z.boolean(),
  collected: z.number(),
  message: z.string(),
});

export const installStepSchema = z.object({
  title: z.string(),
  body: z.string(),
  code: z.string(),
});

export const installScriptResponseSchema = z.object({
  steps: z.array(installStepSchema),
  ingestUrl: z.string(),
  /** Returned once at generation time; only the hash is stored. */
  token: z.string(),
});
