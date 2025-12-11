import { createHash, randomBytes } from "crypto";
import type { FuzzingReport, FuzzingFinding } from "~/types/fuzzing";
import { fuzzingReportSchema } from "../schemas/fuzzing";

/**
 * Business logic utilities for EV Charger Fuzzing feature
 */

/**
 * Generate a cryptographically secure one-time token for job authentication
 * @returns A secure random token string (32 bytes, hex encoded = 64 chars)
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a token using SHA-256 for secure storage
 * @param token - The plain text token
 * @returns The hashed token (hex encoded)
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Validate a token against a stored hash
 * @param token - The plain text token to validate
 * @param hash - The stored hash to compare against
 * @returns True if the token matches the hash
 */
export function validateToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  // Use constant-time comparison to prevent timing attacks
  return tokenHash === hash;
}

/**
 * Calculate a deterministic risk score from fuzzing findings
 * Formula: Weighted sum of findings by severity, normalized to 0-100
 * Weights: critical=10, high=7, medium=4, low=2, info=1
 * Multipliers: crashes and timeouts add to the score
 *
 * @param report - The fuzzing report containing findings and statistics
 * @returns Risk score from 0-100
 */
export function calculateRiskScore(report: FuzzingReport): number {
  const severityWeights: Record<FuzzingFinding["severity"], number> = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 2,
    info: 1,
  };

  // Calculate weighted sum of findings
  let weightedSum = 0;
  for (const finding of report.findings) {
    weightedSum += severityWeights[finding.severity];
  }

  // Add multipliers for crashes and timeouts
  const crashMultiplier = Math.min(report.statistics.crashes * 0.5, 20); // Max 20 points
  const timeoutMultiplier = Math.min(
    report.statistics.timeouts * 0.3,
    15
  ); // Max 15 points

  const totalScore = weightedSum + crashMultiplier + timeoutMultiplier;

  // Normalize to 0-100 scale
  // Assuming max possible score is around 200 (20 critical findings + multipliers)
  // This can be adjusted based on actual usage patterns
  const maxPossibleScore = 200;
  const normalizedScore = Math.min((totalScore / maxPossibleScore) * 100, 100);

  return Math.round(normalizedScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Parse and validate an uploaded JSON report file
 * @param fileContent - The raw file content as string
 * @param expectedJobId - Optional jobId to validate against
 * @returns Parsed and validated FuzzingReport
 * @throws Error if parsing or validation fails
 */
export function parseReportFile(
  fileContent: string,
  expectedJobId?: string
): FuzzingReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(
      `Invalid JSON format: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Validate against Zod schema
  const validationResult = fuzzingReportSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Report validation failed: ${errors}`);
  }

  const report = validationResult.data;

  // Validate jobId if provided
  if (expectedJobId && report.jobId !== expectedJobId) {
    throw new Error(
      `Job ID mismatch: expected ${expectedJobId}, got ${report.jobId}`
    );
  }

  return report;
}

/**
 * Get severity color for UI display (Tag component color key)
 * @param severity - The finding severity
 * @returns Tag color key
 */
export function getSeverityColor(
  severity: FuzzingFinding["severity"]
): "red" | "orange" | "yellow" | "blue" | "gray" {
  const colors: Record<FuzzingFinding["severity"], "red" | "orange" | "yellow" | "blue" | "gray"> = {
    critical: "red",
    high: "orange",
    medium: "yellow",
    low: "blue",
    info: "gray",
  };
  return colors[severity];
}

/**
 * Get severity label for UI display
 * @param severity - The finding severity
 * @returns Human-readable label
 */
export function getSeverityLabel(
  severity: FuzzingFinding["severity"]
): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

/**
 * Get category label for UI display
 * @param category - The finding category
 * @returns Human-readable label
 */
export function getCategoryLabel(
  category: FuzzingFinding["category"]
): string {
  const labels: Record<FuzzingFinding["category"], string> = {
    protocol_violation: "Protocol Violation",
    crash: "Crash",
    performance: "Performance",
    security_misconfig: "Security Misconfiguration",
    other: "Other",
  };
  return labels[category];
}

