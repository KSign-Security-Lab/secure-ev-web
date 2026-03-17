import { NextRequest, NextResponse } from "next/server";
import prisma from "~/lib/prisma";
import { validateToken } from "~/server/trpc/utils/fuzzing";

/**
 * Mock runner binary download endpoint
 * In production, this would serve the actual binary file
 * For now, returns a placeholder response with download instructions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const token = searchParams.get("token");

    if (!jobId || !token) {
      return NextResponse.json(
        { error: "Missing jobId or token parameter" },
        { status: 400 }
      );
    }

    // Validate job exists and token is correct
    const job = await prisma.fuzzingJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!validateToken(token, job.authTokenHash)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // In production, this would return the actual binary file
    // For now, return a JSON response with download information
    // TODO: Replace with actual binary file serving
    return NextResponse.json(
      {
        message: "Runner binary download (mock)",
        jobId,
        downloadUrl: `/api/fuzzing/runner?jobId=${jobId}&token=${token}`,
        note: "This is a mock endpoint. Replace with actual binary file serving in production.",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
