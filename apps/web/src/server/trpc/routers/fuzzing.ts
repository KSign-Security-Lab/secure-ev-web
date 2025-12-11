import { router, publicProcedure } from "../init";
import { paginationSchema } from "../schemas/common";
import {
  createFuzzingJobInputSchema,
  updateFuzzingJobInputSchema,
  deleteFuzzingJobInputSchema,
  listFuzzingJobsInputSchema,
  getFuzzingJobByIdInputSchema,
  paginatedFuzzingJobsResponseSchema,
  fuzzingJobWithReportSchema,
  fuzzingJobSchema,
  fuzzingReportSchema,
  fuzzingJobListItemSchema,
} from "../schemas/fuzzing";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "~/lib/prisma";
import {
  generateSecureToken,
  hashToken,
  calculateRiskScore,
} from "../utils/fuzzing";
import type { FuzzingReport } from "~/types/fuzzing";

export const fuzzingRouter = router({
  /**
   * Create a new fuzzing job
   * Generates a secure token and returns job details with download URLs
   * NOTE: Token is returned only once here - in production, consider storing it securely
   */
  create: publicProcedure
    .input(createFuzzingJobInputSchema)
    .output(
      fuzzingJobSchema.extend({
        token: z.string(), // Return token for runner download (one-time use)
      })
    )
    .mutation(async ({ input }) => {
      // Generate secure token for this job
      const token = generateSecureToken();
      const tokenHash = hashToken(token);

      // Create job in database
      const job = await prisma.fuzzingJob.create({
        data: {
          name: input.name,
          targetType: input.targetType,
          targetDevice: input.targetDevice,
          environment: input.environment,
          connectionConfig: input.connectionConfig as any,
          fuzzingParameters: (input.fuzzingParameters || {}) as any,
          scope: (input.scope || []) as any,
          status: "PENDING",
          authTokenHash: tokenHash,
        },
      });

      // Return job with serialized dates and token
      // NOTE: In production, consider returning token via secure channel or storing in session
      return {
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        connectionConfig: job.connectionConfig as unknown,
        fuzzingParameters: job.fuzzingParameters as unknown,
        targetVectors: job.scope as unknown, // Map scope to targetVectors for backward compatibility or just use scope
        scope: job.scope as unknown,
        token, // Return plain token for immediate use
      };
    }),

  /**
   * Update an existing fuzzing job
   */
  update: publicProcedure
    .input(updateFuzzingJobInputSchema)
    .output(fuzzingJobSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const job = await prisma.fuzzingJob.findUnique({
        where: { id },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Fuzzing job with ID ${id} not found`,
        });
      }

      // Only allow updating if status is DRAFT or PENDING (or maybe allow config updates even if running? No, that's risky)
      // For now, let's assume we can update if not COMPLETED/FAILED/RUNNING if we want to be strict,
      // but user might want to fix params and restart. Rethinking: usually restart = new job.
      // But user asked for "Edit". Let's allow update regardless of status for now,
      // but practically it usually implies re-running.
      // Since we don't have a "restart" mutation yet, let's just update the config.

      const updatedJob = await prisma.fuzzingJob.update({
        where: { id },
        data: {
          ...data,
          connectionConfig: data.connectionConfig as any,
          fuzzingParameters: (data.fuzzingParameters || {}) as any,
          scope: (data.scope || []) as any,
        },
      });

      return {
        ...updatedJob,
        createdAt: updatedJob.createdAt.toISOString(),
        updatedAt: updatedJob.updatedAt.toISOString(),
        connectionConfig: updatedJob.connectionConfig as unknown,
        fuzzingParameters: updatedJob.fuzzingParameters as unknown,
        targetVectors: updatedJob.scope as unknown,
        scope: updatedJob.scope as unknown,
      };
    }),

  /**
   * Delete a fuzzing job
   */
  delete: publicProcedure
    .input(deleteFuzzingJobInputSchema)
    .output(z.object({ success: z.boolean(), id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      try {
        await prisma.fuzzingJob.delete({
          where: { id },
        });
        return { success: true, id };
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Fuzzing job with ID ${id} not found or could not be deleted`,
        });
      }
    }),

  /**
   * List fuzzing jobs with pagination and optional filters
   */
  list: publicProcedure
    .input(listFuzzingJobsInputSchema)
    .output(paginatedFuzzingJobsResponseSchema)
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 10;
      const status = input?.status;
      const targetType = input?.targetType;

      // Build where clause
      const where: any = {};
      if (status) {
        where.status = { equals: status };
      }
      if (targetType) {
        // @ts-ignore - Prisma enum filtering issue
        where.targetType = { equals: targetType as any };
      }

      const [jobs, count] = await prisma.$transaction([
        prisma.fuzzingJob.findMany({
          where: Object.keys(where).length > 0 ? where : undefined,
          select: {
            id: true,
            name: true,
            targetType: true,
            status: true,
            environment: true,
            createdAt: true,
            updatedAt: true,
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.fuzzingJob.count({
          where: Object.keys(where).length > 0 ? where : undefined,
        }),
      ]);

      // Transform jobs with serialized dates
      const transformedJobs = jobs.map((job) => ({
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      }));

      return {
        jobs: transformedJobs,
        count,
      };
    }),

  /**
   * Get a fuzzing job by ID with optional report
   */
  getById: publicProcedure
    .input(getFuzzingJobByIdInputSchema)
    .output(fuzzingJobWithReportSchema)
    .query(async ({ input }) => {
      const job = await prisma.fuzzingJob.findUnique({
        where: { id: input.jobId },
        include: { report: true },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Fuzzing job with ID ${input.jobId} not found`,
        });
      }

      // Transform job with serialized dates
      const transformedJob = {
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        connectionConfig: job.connectionConfig as unknown,
        fuzzingParameters: job.fuzzingParameters as unknown,
        scope: job.scope as unknown,
        targetVectors: job.scope as unknown, // Map scope to targetVectors
        report: job.report
          ? {
               ...(job.report.payload as unknown as FuzzingReport),
            }
          : undefined,
      };

      return transformedJob;
    }),

  /**
   * Get the report for a job (if available)
   * Includes calculated risk score
   */
  getReport: publicProcedure
    .input(getFuzzingJobByIdInputSchema)
    .query(async ({ input }) => {
      const job = await prisma.fuzzingJob.findUnique({
        where: { id: input.jobId },
        include: { report: true },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Fuzzing job with ID ${input.jobId} not found`,
        });
      }

      if (!job.report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No report found for job ${input.jobId}`,
        });
      }

      const report = job.report.payload as unknown as FuzzingReport;
      const riskScore = calculateRiskScore(report);

      return {
        ...report,
        riskScore,
      };
    }),

  /**
   * Upload a manual report for a job
   */
  uploadReport: publicProcedure
    .input(
      z.object({
        jobId: z.string().uuid(),
        report: fuzzingReportSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { jobId, report } = input;

      const job = await prisma.fuzzingJob.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Fuzzing job with ID ${jobId} not found`,
        });
      }

      // Determine status from report statistics/findings or default to COMPLETED
      // If there are crashes, maybe mark as FAILED? Or stick to COMPLETED as "Job Completed".
      // Usually COMPLETED means the fuzzing run finished.
      const status = "COMPLETED";

      // Save report
      await prisma.$transaction([
        prisma.fuzzingReport.upsert({
          where: { jobId },
          create: {
            jobId,
            payload: report as unknown as object, // Prisma expects Json
          },
          update: {
             payload: report as unknown as object,
          },
        }),
        prisma.fuzzingJob.update({
          where: { id: jobId },
          data: {
            status,
          },
        }),
      ]);

      return { success: true };
    }),
});

