import { createHash, randomBytes } from "crypto";
import type { FuzzingReport } from "~/types/fuzzing";
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



