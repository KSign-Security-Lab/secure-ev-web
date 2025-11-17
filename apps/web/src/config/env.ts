import { z } from "zod";

/**
 * Environment variable schema validation
 *
 * This validates all environment variables at startup and provides
 * type-safe access to them throughout the application.
 *
 * If any required environment variable is missing or invalid,
 * the application will fail to start with a clear error message.
 */
const envSchema = z.object({
  // Defend API Configuration
  DEFEND_API_URL: z
    .string()
    .min(1, "DEFEND_API_URL is required")
    .transform((val) => {
      const trimmed = val.trim();
      // Check if it already has a scheme
      const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
      const candidateBase = hasScheme ? trimmed : `https://${trimmed}`;

      // Validate it's a proper URL
      try {
        new URL("/", candidateBase);
        return candidateBase;
      } catch {
        throw new Error(
          `DEFEND_API_URL is invalid: "${val}". Must be a valid URL (e.g., "api.example.com" or "https://api.example.com")`
        );
      }
    }),

  DEFEND_API_KEY: z.string().min(1, "DEFEND_API_KEY is required"),

  // Manx Sessions API Configuration
  MANX_SESSIONS_URL: z
    .string()
    .min(1, "MANX_SESSIONS_URL is required")
    .url("MANX_SESSIONS_URL must be a valid URL"),
});

/**
 * Validated and typed environment variables
 *
 * This will throw an error at module load time if any required
 * environment variable is missing or invalid.
 */
export const env = envSchema.parse({
  DEFEND_API_URL: process.env.DEFEND_API_URL,
  DEFEND_API_KEY: process.env.DEFEND_API_KEY,
  MANX_SESSIONS_URL: process.env.MANX_SESSIONS_URL,
});

/**
 * Type-safe environment variable access
 *
 * Usage:
 *   import { env } from "~/config/env";
 *   const apiUrl = env.DEFEND_API_URL; // Fully typed!
 */
export type Env = z.infer<typeof envSchema>;
