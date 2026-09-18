import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { env } from "~/config/env";
import type { ReadableStream as WebReadableStream } from "stream/web";

/**
 * Payload serving for agents.
 *
 * The agent fetches its own binary and any ability payloads from here; the path
 * is hardcoded in `gocat/contact/api.go`, so it must stay at /file/download.
 * Caldera compiles on demand when Go is present and otherwise serves prebuilt
 * binaries — we only do the latter, which covers the platforms we support.
 *
 * Accepts GET and POST: the install commands POST, `sandcat-elfload.py` GETs.
 */

const PAYLOAD_DIR = env.C2_PAYLOAD_DIR || path.join(process.cwd(), "payloads");

const PLATFORM_BINARIES: Record<string, string> = {
  linux: "sandcat.go-linux",
  windows: "sandcat.go-windows",
  darwin: "sandcat.go-darwin",
};

function resolvePayload(file: string, platform: string): string | null {
  // The agent binary is requested as "sandcat.go" plus a platform header.
  if (file === "sandcat.go" || file === "") {
    const name = PLATFORM_BINARIES[platform];
    return name ? path.join(PAYLOAD_DIR, name) : null;
  }

  // Any other payload is served by name, with traversal stripped.
  const safe = path.basename(file);
  return path.join(PAYLOAD_DIR, safe);
}

async function serve(request: NextRequest) {
  const file = (request.headers.get("file") ?? "").trim();
  const platform = (request.headers.get("platform") ?? "").trim().toLowerCase();

  const resolved = resolvePayload(file, platform);
  if (!resolved || !existsSync(resolved) || !statSync(resolved).isFile()) {
    return new NextResponse("File not found", { status: 404 });
  }

  const filename = path.basename(resolved);
  const stream = Readable.toWeb(
    createReadStream(resolved)
  ) as WebReadableStream<Uint8Array>;

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(statSync(resolved).size),
      FILENAME: filename,
      "Cache-Control": "no-store",
    },
  });
}

export const GET = serve;
export const POST = serve;
