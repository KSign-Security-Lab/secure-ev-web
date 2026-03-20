import { NextRequest, NextResponse } from "next/server";
import prisma from "~/lib/prisma";
import { parseReportFile } from "~/server/trpc/utils/fuzzing";

/**
 * Offline report file upload endpoint
 * Accepts multipart/form-data with a JSON report file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobId = formData.get("jobId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (should be JSON)
    if (!file.type.includes("json") && !file.name.endsWith(".json")) {
      return NextResponse.json(
        { error: "File must be a JSON file" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse and validate report
    let parsedReport;
    try {
      parsedReport = parseReportFile(fileContent, jobId || undefined);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to parse report",
        },
        { status: 400 }
      );
    }

    // If jobId provided, validate it exists
    const reportJobId = parsedReport.jobId;
    if (jobId && jobId !== reportJobId) {
      return NextResponse.json(
        { error: "Job ID mismatch between form and report" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.fuzzingJob.findUnique({
      where: { id: reportJobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: `Job with ID ${reportJobId} not found` },
        { status: 404 }
      );
    }

    // Store report in database (upsert to handle re-uploads)
    await prisma.$transaction([
      prisma.fuzzingReport.upsert({
        where: { jobId: reportJobId },
        create: {
          jobId: reportJobId,
          payload: parsedReport as any,
        },
        update: {
          payload: parsedReport as any,
        },
      }),
      prisma.fuzzingJob.update({
        where: { id: reportJobId },
        data: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Report uploaded successfully",
        jobId: reportJobId,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
