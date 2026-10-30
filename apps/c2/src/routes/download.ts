import type { IncomingMessage, ServerResponse } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { getAgentConfig } from "../agentConfig.js";
import { header, text } from "../http.js";

/**
 * Payload serving for agents.
 *
 * The agent fetches its own binary and any ability payloads from here; the path
 * is hardcoded in `gocat/contact/api.go`, so it must stay at /file/download.
 * Caldera compiles on demand when Go is present and otherwise serves prebuilt
 * binaries — we only serve prebuilt ones, which we build ourselves from vendored
 * sandcat source (see agent/).
 *
 * Accepts GET and POST: the install commands POST, `sandcat-elfload.py` GETs.
 */

const PLATFORMS = new Set(["linux", "windows", "darwin"]);
const DEFAULT_ARCH = "amd64";

export function isAgentBinaryRequest(file: string): boolean {
  return file === "sandcat.go" || file === "";
}

/**
 * Candidate file names for the agent binary, in preference order:
 * the arch-specific build, then the amd64 build, then the legacy
 * `sandcat.go-<platform>` name so a half-migrated payload directory works.
 * Returns [] for a platform we do not build for.
 */
export function agentBinaryCandidates(platform: string, architecture: string): string[] {
  if (!PLATFORMS.has(platform)) return [];
  const arch = architecture || DEFAULT_ARCH;
  return [
    `sandcat-${platform}-${arch}`,
    `sandcat-${platform}-${DEFAULT_ARCH}`,
    `sandcat.go-${platform}`,
  ];
}

/**
 * Resolve the file to serve. The agent binary is picked by platform/arch; any
 * other file name is an ability payload, served by basename.
 */
function resolvePayload(file: string, platform: string, architecture: string): string | null {
  if (isAgentBinaryRequest(file)) {
    for (const name of agentBinaryCandidates(platform, architecture)) {
      const candidate = path.join(config.C2_PAYLOAD_DIR, name);
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
  }

  // Any other payload is served by name, with traversal stripped.
  return path.join(config.C2_PAYLOAD_DIR, path.basename(file));
}

export async function handleDownload(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const file = header(req, "file").trim();
  const platform = header(req, "platform").trim().toLowerCase();
  const architecture = header(req, "architecture").trim().toLowerCase();

  const resolved = resolvePayload(file, platform, architecture);
  if (!resolved || !existsSync(resolved) || !statSync(resolved).isFile()) {
    text(res, 404, "File not found");
    return;
  }

  // The agent saves ability payloads under the FILENAME header. For its own
  // binary we hand back the configured implant name so it masquerades as that.
  const isAgentBinary = isAgentBinaryRequest(file);
  let filename = path.basename(resolved);
  if (isAgentBinary) {
    const agentConfig = await getAgentConfig();
    if (agentConfig.implantName) filename = agentConfig.implantName;
  }

  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": String(statSync(resolved).size),
    FILENAME: filename,
    "Cache-Control": "no-store",
  });
  createReadStream(resolved).pipe(res);
}
