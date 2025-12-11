/**
 * TypeScript interfaces for EV Charger Fuzzing feature
 */

export type FuzzingTargetType = "ISO15118" | "OCPP_CHARGER" | "OCPP_SERVER";
export type FuzzingTargetDevice = "CHARGER" | "CSMS";
export type FuzzingJobStatus = "DRAFT" | "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type FindingCategory =
  | "protocol_violation"
  | "crash"
  | "performance"
  | "security_misconfig"
  | "other";
export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

/**
 * Target-specific connection configurations
 */
export interface ISO15118ConnectionConfig {
  chargerIp: string;
  port: number;
  tlsEnabled: boolean;
  certificatePath?: string;
  keyPath?: string;
}

export interface OCPPChargerConnectionConfig {
  listenIp: string;
  port: number;
  ocppVersion: "1.6J" | "2.0.1";
  websocketPath: string;
}

export interface OCPPServerConnectionConfig {
  serverUrl: string;
  chargePointIdentity: string;
  ocppVersion: "1.6J" | "2.0.1";
}

export type ConnectionConfig =
  | ISO15118ConnectionConfig
  | OCPPChargerConnectionConfig
  | OCPPServerConnectionConfig;

/**
 * Fuzzing parameters
 */
export interface FuzzingParameters {
  duration?: number; // Duration in seconds
  maxTestCases?: number;
  aggressivenessLevel?: "low" | "medium" | "high";
  mutatePayloadFields?: boolean;
  timingJitter?: boolean;
  [key: string]: unknown; // Allow extensibility
}

/**
 * Fuzzing Run/Interaction
 */
export interface FuzzingRun {
  type: string;
  input: string;
  output: string;
  result: "ok" | "error" | "timeout";
}

/**
 * Complete Fuzzing Report
 */
export interface FuzzingReport {
  jobId: string;
  targetType: FuzzingTargetType;
  startedAt: string;
  finishedAt: string;
  fuzzingParameters: FuzzingParameters;
  runs: FuzzingRun[];
  rawLogLocation?: string;
}

/**
 * Job with optional report
 */
export interface FuzzingJobWithReport {
  id: string;
  name: string;
  targetType: FuzzingTargetType;
  targetDevice?: FuzzingTargetDevice | null;
  environment: string;
  connectionConfig: ConnectionConfig;
  fuzzingParameters: FuzzingParameters;
  scope?: string[];
  status: FuzzingJobStatus;
  createdAt: string;
  updatedAt: string;
  report?: FuzzingReport;
}

