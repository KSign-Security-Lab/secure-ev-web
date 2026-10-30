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
  /**
   * Public address agents call back to, used as the default for the C2 address
   * in the agent configuration. Editable afterwards from the deploy modal.
   */
  C2_PUBLIC_URL: z
    .string()
    .trim()
    .min(1)
    .default("http://0.0.0.0:4204")
    .refine((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "C2_PUBLIC_URL must be a valid URL (e.g. \"http://10.0.0.5:4204\")"),
});

/**
 * Validated and typed environment variables
 *
 * This will throw an error at module load time if any required
 * environment variable is missing or invalid.
 */
export const env = envSchema.parse({
  C2_PUBLIC_URL: process.env.C2_PUBLIC_URL,
});

/**
 * Type-safe environment variable access
 *
 * Usage:
 *   import { env } from "~/config/env";
 *   const c2Url = env.C2_PUBLIC_URL; // Fully typed!
 */
export type Env = z.infer<typeof envSchema>;
