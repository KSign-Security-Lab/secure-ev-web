import { NextRequest, NextResponse } from "next/server";
import { env } from "~/config/env";
import { getAgentConfig } from "~/server/c2/agentConfig";

/**
 * Agent binary download for the Deploy modal.
 *
 * The binaries live on the C2 server (`/file/download`), not on the console, so
 * the browser cannot fetch them from its own origin. This route asks the C2 for
 * the build and streams it back, keeping the C2's file name. It uses the same
 * C2 address as the install commands (the agent config), so the button and the
 * commands always hand out the same binary.
 */
const PLATFORMS = new Set(["linux", "windows", "darwin"]);
const ARCHITECTURES = new Set(["amd64", "386", "arm64", "arm"]);

export async function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get("platform") ?? "";
  const architecture = request.nextUrl.searchParams.get("architecture") ?? "amd64";

  if (!PLATFORMS.has(platform) || !ARCHITECTURES.has(architecture)) {
    return NextResponse.json({ error: "Invalid platform or architecture" }, { status: 400 });
  }

  const { c2Url } = await getAgentConfig();
  const base = (c2Url || env.C2_PUBLIC_URL).replace(/\/+$/, "");
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/file/download`, {
      method: "POST",
      headers: { file: "sandcat.go", platform, architecture },
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "C2 server unreachable" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: upstream.status === 404 ? "Agent binary not found" : "C2 download failed" },
      { status: upstream.status === 404 ? 404 : 502 }
    );
  }

  const headers = new Headers({
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-store",
  });
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new NextResponse(upstream.body, { status: 200, headers });
}
