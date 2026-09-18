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
    .default("http://0.0.0.0:4200")
    .refine((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "C2_PUBLIC_URL must be a valid URL (e.g. \"http://10.0.0.5:4200\")"),

  /** Directory holding the sandcat binaries served by /file/download. */
  C2_PAYLOAD_DIR: z.string().trim().optional(),

  /** Directory where agent uploads land. */
  C2_EXFIL_DIR: z.string().trim().optional(),
});

/**
 * Validated and typed environment variables
 *
 * This will throw an error at module load time if any required
 * environment variable is missing or invalid.
 */
export const env = envSchema.parse({
  C2_PUBLIC_URL: process.env.C2_PUBLIC_URL,
  C2_PAYLOAD_DIR: process.env.C2_PAYLOAD_DIR,
  C2_EXFIL_DIR: process.env.C2_EXFIL_DIR,
});

/**
 * Type-safe environment variable access
 *
 * Usage:
 *   import { env } from "~/config/env";
 *   const c2Url = env.C2_PUBLIC_URL; // Fully typed!
 */
export type Env = z.infer<typeof envSchema>;
