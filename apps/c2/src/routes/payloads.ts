import type { IncomingMessage, ServerResponse } from "node:http";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { json } from "../http.js";

/**
 * List the payload files present in the C2 payload directory.
 *
 * The operator console calls this to warn when an ability references a payload
 * file that has not been dropped into the directory (we serve only files that
 * are actually present — see routes/download.ts). Filenames only; read-only.
 */
export async function handlePayloadList(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  let files: string[] = [];
  try {
    const entries = await readdir(config.C2_PAYLOAD_DIR);
    const checked = await Promise.all(
      entries.map(async (name) => {
        try {
          const info = await stat(path.join(config.C2_PAYLOAD_DIR, name));
          return info.isFile() ? name : null;
        } catch {
          return null;
        }
      })
    );
    files = checked.filter((name): name is string => name !== null);
  } catch (error) {
    // A missing payload dir just means nothing is available yet.
    console.error("[c2] payload listing failed:", error);
  }

  json(res, 200, { files });
}
