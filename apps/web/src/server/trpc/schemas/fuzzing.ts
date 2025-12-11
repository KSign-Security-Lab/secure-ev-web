import { z } from "zod";

/**
 * Zod schemas for EV Charger Fuzzing feature
 */

// Enums
export const fuzzingTargetTypeSchema = z.enum([
  "ISO15118",
  "OCPP_CHARGER",
  "OCPP_SERVER",
]);

export const fuzzingTargetDeviceSchema = z.enum(["CHARGER", "CSMS"]);

export const fuzzingJobStatusSchema = z.enum([
  "DRAFT",
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
]);

export const findingCategorySchema = z.enum([
  "protocol_violation",
  "crash",
  "performance",
  "security_misconfig",
  "other",
]);

export const findingSeveritySchema = z.enum([
  "info",
  "low",
  "medium",
  "high",
  "critical",
]);

// Connection Config Schemas
export const iso15118ConnectionConfigSchema = z.object({
  chargerIp: z.string().min(1, "Charger IP/hostname is required"),
  port: z.number().int().positive().max(65535),
  tlsEnabled: z.boolean(),
  certificatePath: z.string().optional(),
  keyPath: z.string().optional(),
});

export const ocppChargerConnectionConfigSchema = z.object({
  listenIp: z.string().min(1, "Listen IP is required"),
  port: z.number().int().positive().max(65535),
  ocppVersion: z.enum(["1.6J", "2.0.1"]),
  websocketPath: z.string().min(1, "WebSocket path is required"),
});

export const ocppServerConnectionConfigSchema = z.object({
  serverUrl: z.string().url("Server URL must be a valid URL"),
  chargePointIdentity: z.string().min(1, "Charge point identity is required"),
  ocppVersion: z.enum(["1.6J", "2.0.1"]),
});

// Discriminated union for connection config
export const connectionConfigSchema = z.discriminatedUnion("targetType", [
  z.object({ targetType: z.literal("ISO15118") }).merge(
    iso15118ConnectionConfigSchema
  ),
  z.object({ targetType: z.literal("OCPP_CHARGER") }).merge(
    ocppChargerConnectionConfigSchema
  ),
  z.object({ targetType: z.literal("OCPP_SERVER") }).merge(
    ocppServerConnectionConfigSchema
  ),
]);

// Fuzzing Parameters Schema
export const fuzzingParametersSchema = z.object({
  duration: z.number().int().positive().optional(),
  maxTestCases: z.number().int().positive().optional(),
  aggressivenessLevel: z.enum(["low", "medium", "high"]).optional(),
  mutatePayloadFields: z.boolean().optional(),
  timingJitter: z.boolean().optional(),
});

// Finding Schema
export const fuzzingFindingSchema = z.object({
  id: z.string(),
  category: findingCategorySchema,
  severity: findingSeveritySchema,
  title: z.string().min(1),
  description: z.string(),
  evidence: z.string().optional(),
  affectedMessages: z.array(z.string()).optional(),
  recommendation: z.string().optional(),
});

// Report Statistics Schema
export const fuzzingReportStatisticsSchema = z.object({
  totalCases: z.number().int().nonnegative(),
  crashes: z.number().int().nonnegative(),
  timeouts: z.number().int().nonnegative(),
  uniqueFindings: z.number().int().nonnegative(),
});

// Complete Fuzzing Report Schema
export const fuzzingReportSchema = z.object({
  jobId: z.string().uuid(),
  targetType: fuzzingTargetTypeSchema,
  startedAt: z.string(), // ISO datetime string
  finishedAt: z.string(), // ISO datetime string
  fuzzingParameters: fuzzingParametersSchema,
  statistics: fuzzingReportStatisticsSchema,
  findings: z.array(fuzzingFindingSchema),
  rawLogLocation: z.string().optional(),
});

// Job Creation Input Schema
export const createFuzzingJobInputSchema = z.object({
  name: z.string().min(1, "Job name is required"),
  targetType: fuzzingTargetTypeSchema,
  targetDevice: fuzzingTargetDeviceSchema.optional(),
  environment: z.string().min(1, "Environment is required"),
  connectionConfig: z.union([
    iso15118ConnectionConfigSchema,
    ocppChargerConnectionConfigSchema,
    ocppServerConnectionConfigSchema,
  ]),
  targetVectors: z.array(z.string()).optional(), // Making optional as we move to scope
  scope: z.array(z.string()).min(1, "Scope must be a non-empty array"),
  fuzzingParameters: fuzzingParametersSchema.optional(),
});

// Job Update Input Schema
export const updateFuzzingJobInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Job name is required").optional(),
  targetType: fuzzingTargetTypeSchema.optional(),
  targetDevice: fuzzingTargetDeviceSchema.optional(),
  environment: z.string().min(1, "Environment is required").optional(),
  connectionConfig: z.union([
    iso15118ConnectionConfigSchema,
    ocppChargerConnectionConfigSchema,
    ocppServerConnectionConfigSchema,
  ]).optional(),
  scope: z.array(z.string()).min(1, "Scope must be a non-empty array").optional(),
  fuzzingParameters: fuzzingParametersSchema.optional(),
});

// Job Delete Input Schema
export const deleteFuzzingJobInputSchema = z.object({
  id: z.string().uuid(),
});

// Job List Input Schema (with filters)
export const listFuzzingJobsInputSchema = z
  .object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(10),
    status: fuzzingJobStatusSchema.optional(),
    targetType: fuzzingTargetTypeSchema.optional(),
  })
  .optional();

// Job Schema (from database)
export const fuzzingJobSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  targetType: fuzzingTargetTypeSchema,
  targetDevice: fuzzingTargetDeviceSchema.nullable().optional(),
  environment: z.string(),
  connectionConfig: z.unknown(), // JSON from database
  fuzzingParameters: z.unknown(), // JSON from database
  targetVectors: z.unknown(), // JSON from database
  scope: z.unknown().optional(), // JSON from database
  status: fuzzingJobStatusSchema,
  authTokenHash: z.string(),
  createdAt: z.string(), // ISO datetime string
  updatedAt: z.string(), // ISO datetime string
});

export const fuzzingJobListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  targetType: fuzzingTargetTypeSchema,
  status: fuzzingJobStatusSchema,
  environment: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});


// Job with Report Schema
export const fuzzingJobWithReportSchema = fuzzingJobSchema.extend({
  report: fuzzingReportSchema.optional(),
});

// Job List Response Schema
export const paginatedFuzzingJobsResponseSchema = z.object({
  jobs: z.array(fuzzingJobListItemSchema),
  count: z.number().int().nonnegative(),
});

// Online Report Submission Schema (from runner)
export const onlineReportSubmissionSchema = z.object({
  jobId: z.string().uuid(),
  token: z.string().min(1, "Token is required"),
  report: fuzzingReportSchema,
});

// Get Job By ID Input Schema
export const getFuzzingJobByIdInputSchema = z.object({
  jobId: z.string().uuid(),
});

// Type exports for use in TypeScript
export type FuzzingTargetDevice = z.infer<typeof fuzzingTargetDeviceSchema>;
export type FuzzingTargetType = z.infer<typeof fuzzingTargetTypeSchema>;
export type FuzzingJobStatus = z.infer<typeof fuzzingJobStatusSchema>;
export type FindingCategory = z.infer<typeof findingCategorySchema>;
export type FindingSeverity = z.infer<typeof findingSeveritySchema>;
export type ISO15118ConnectionConfig = z.infer<
  typeof iso15118ConnectionConfigSchema
>;
export type OCPPChargerConnectionConfig = z.infer<
  typeof ocppChargerConnectionConfigSchema
>;
export type OCPPServerConnectionConfig = z.infer<
  typeof ocppServerConnectionConfigSchema
>;
export type ConnectionConfig = z.infer<typeof connectionConfigSchema>;
export type FuzzingParameters = z.infer<typeof fuzzingParametersSchema>;
export type FuzzingFinding = z.infer<typeof fuzzingFindingSchema>;
export type FuzzingReportStatistics = z.infer<
  typeof fuzzingReportStatisticsSchema
>;
export type FuzzingReport = z.infer<typeof fuzzingReportSchema>;
export type CreateFuzzingJobInput = z.infer<
  typeof createFuzzingJobInputSchema
>;
export type UpdateFuzzingJobInput = z.infer<typeof updateFuzzingJobInputSchema>;
export type DeleteFuzzingJobInput = z.infer<typeof deleteFuzzingJobInputSchema>;
export type ListFuzzingJobsInput = z.infer<typeof listFuzzingJobsInputSchema>;
export type FuzzingJob = z.infer<typeof fuzzingJobSchema>;
export type FuzzingJobWithReport = z.infer<typeof fuzzingJobWithReportSchema>;
export type PaginatedFuzzingJobsResponse = z.infer<
  typeof paginatedFuzzingJobsResponseSchema
>;
export type FuzzingJobListItem = z.infer<typeof fuzzingJobListItemSchema>;
export type OnlineReportSubmission = z.infer<
  typeof onlineReportSubmissionSchema
>;

