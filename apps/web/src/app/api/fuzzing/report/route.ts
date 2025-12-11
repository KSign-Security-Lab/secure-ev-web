import { NextRequest, NextResponse } from "next/server";
import prisma from "~/lib/prisma";
import { validateToken } from "~/server/trpc/utils/fuzzing";
import { fuzzingReportSchema } from "~/server/trpc/schemas/fuzzing";

/**
 * Online report submission endpoint
 * Accepts JSON report from runner and stores it in the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { jobId, token, report } = body;

    if (!jobId || !token || !report) {
      return NextResponse.json(
        { error: "Missing required fields: jobId, token, or report" },
        { status: 400 }
      );
    }

    // Validate job exists
    const job = await prisma.fuzzingJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Validate token
    if (!validateToken(token, job.authTokenHash)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Validate report schema
    const validationResult = fuzzingReportSchema.safeParse(report);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return NextResponse.json(
        { error: `Invalid report format: ${errors}` },
        { status: 400 }
      );
    }

    const validatedReport = validationResult.data;

    // Ensure report jobId matches
    if (validatedReport.jobId !== jobId) {
      return NextResponse.json(
        { error: "Report jobId does not match request jobId" },
        { status: 400 }
      );
    }

    // Store report in database (upsert to handle re-submissions)
    await prisma.$transaction([
      prisma.fuzzingReport.upsert({
        where: { jobId },
        create: {
          jobId,
          payload: validatedReport as any,
        },
        update: {
          payload: validatedReport as any,
        },
      }),
      prisma.fuzzingJob.update({
        where: { id: jobId },
        data: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json(
      { message: "Report submitted successfully", jobId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in report submission endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

