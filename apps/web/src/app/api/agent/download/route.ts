import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "~/config/env";
import { DEPLOY_PLATFORMS } from "~/server/trpc/schemas/responses";

/**
 * Streams a compiled Sandcat binary from the defend (Caldera) API.
 *
 * This cannot be a tRPC procedure because the response is a binary stream.
 * Caldera registers `/file/download` as an unauthenticated route, so no API key
 * is forwarded here.
 */
const querySchema = z.object({
  platform: z.enum(DEPLOY_PLATFORMS),
  architecture: z.enum(["amd64", "arm64"]).optional(),
  extensions: z.string().optional(),
});

const defaultFilename = (platform: string) =>
  platform === "windows" ? "sandcat.exe" : `sandcat-${platform}`;

/** Pull `filename=` out of a Content-Disposition header, if the server sent one. */
const filenameFromDisposition = (disposition: string | null): string | null => {
  if (!disposition) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? match[1].trim() : null;
};

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    platform: request.nextUrl.searchParams.get("platform") ?? undefined,
    architecture:
      request.nextUrl.searchParams.get("architecture") ?? undefined,
    extensions: request.nextUrl.searchParams.get("extensions") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid download request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { platform, architecture, extensions } = parsed.data;

  const headers: Record<string, string> = {
    file: "sandcat.go",
    platform,
  };
  if (architecture) headers.architecture = architecture;
  if (extensions?.trim()) headers["gocat-extensions"] = extensions.trim();

  let upstream: Response;
  try {
    upstream = await fetch(new URL("/file/download", env.DEFEND_API_URL), {
      method: "POST",
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not reach the defend API",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Agent binary is not available",
        detail: detail.slice(0, 500),
      },
      { status: upstream.status === 200 ? 502 : upstream.status }
    );
  }

  const filename =
    filenameFromDisposition(upstream.headers.get("content-disposition")) ??
    defaultFilename(platform);

  const responseHeaders = new Headers({
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  });

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) responseHeaders.set("Content-Length", contentLength);

  return new NextResponse(upstream.body, { headers: responseHeaders });
}
