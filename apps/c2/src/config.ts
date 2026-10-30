import path from "node:path";
import { z } from "zod";

/**
 * Environment for the standalone C2 service.
 *
 * This process serves only the three agent-facing endpoints (/beacon,
 * /file/download, /file/upload). It is unauthenticated by design — stock
 * sandcat sends no credentials — so it belongs on an isolated lab network and
 * is kept on its own port, apart from the operator UI.
 */
const envSchema = z.object({
  /** TCP port the agent-facing HTTP server listens on. */
  C2_PORT: z.coerce.number().int().positive().default(4204),

  /** Address the server binds to. 0.0.0.0 so agents on the lab net can reach it. */
  C2_HOST: z.string().trim().min(1).default("0.0.0.0"),

  /** Directory holding the sandcat binaries and ability payloads served by /file/download. */
  C2_PAYLOAD_DIR: z
    .string()
    .trim()
    .min(1)
    .default(path.join(process.cwd(), "payloads")),

  /** Directory where agent uploads land. */
  C2_EXFIL_DIR: z
    .string()
    .trim()
    .min(1)
    .default(path.join(process.cwd(), "exfil")),

  /** Hard cap on a single uploaded file, in megabytes. */
  C2_MAX_UPLOAD_MB: z.coerce.number().positive().default(100),
});

export const config = envSchema.parse(process.env);

export type C2Config = z.infer<typeof envSchema>;
