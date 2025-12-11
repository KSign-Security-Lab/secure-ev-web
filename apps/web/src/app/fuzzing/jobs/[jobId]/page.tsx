"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JobSummary } from "~/components/page/fuzzing/JobSummary";
import { ConfigDownload } from "~/components/page/fuzzing/ConfigDownload";
import { ReportUpload } from "~/components/page/fuzzing/ReportUpload";
import { VulnerabilityCharts } from "~/components/page/fuzzing/VulnerabilityCharts";
import { FindingsList } from "~/components/page/fuzzing/FindingsList";
import Loading from "~/components/common/Loading/Loading";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import type { FuzzingJobWithReport } from "~/types/fuzzing";
import { ArrowLeft, Hash, FileText } from "lucide-react";
import { JobDetailsSkeleton } from "~/components/page/fuzzing/FuzzingSkeletons";
import { FuzzingInterpretation } from "~/components/page/fuzzing/FuzzingInterpretation";

type JobDetail = RouterOutputs["fuzzing"]["getById"];

export default function FuzzingJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const jobData = await trpc.fuzzing.getById.query({ jobId });
      setJob(jobData);
    } catch (error) {
      console.error("Failed to fetch job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleUploadSuccess = () => {
    // Refresh job data after successful upload
    fetchJob();
  };

  if (isLoading) {
    return (
       <JobDetailsSkeleton />
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-slate-950 p-8 items-center justify-center">
        <div className="text-center text-slate-400 py-8">
          Job not found or failed to load
        </div>
        <button
            onClick={() => router.push("/fuzzing/jobs")}
             className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
        >
            Back to Jobs
        </button>
      </div>
    );
  }

  const jobWithReport = job as FuzzingJobWithReport;
  const hasReport = !!job.report;

  const showDownloadSection =
    (job.status === "PENDING" || job.status === "RUNNING");
  const showUploadSection = !hasReport;

  return (

    <div className="h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col h-full">
         {/* Header */}
        <div className="flex-none px-6 pt-6 pb-6 md:px-12 md:pt-8 md:pb-6 border-b border-slate-800/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white tracking-tight truncate max-w-2xl">
                        {job.name}
                    </h1>
                    <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs flex items-center gap-1">
                        <Hash size={12} />
                        {jobId.slice(0, 8)}
                    </div>
                </div>
                <p className="text-slate-400">
                    Detailed analysis and security testing results for this session.
                </p>
            </div>
            <button
                onClick={() => router.push("/fuzzing/jobs")}
                className="group flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all duration-300"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Jobs
            </button>
            </div>
        </div>

        {/* Main Content Dashboard Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 lg:gap-8 w-full px-6 py-6 md:px-12">
          
          {/* Left Column: Summary & Actions */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-w-0 overflow-y-auto pr-2">
             <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm overflow-hidden flex-none">
                <JobSummary job={jobWithReport} />
             </div>
            
            {showDownloadSection && (
               <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm flex-none">
                  <ConfigDownload job={jobWithReport} />
               </div>
            )}

            {showUploadSection && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm flex-none">
                  <ReportUpload jobId={jobId} onUploadSuccess={handleUploadSuccess} />
               </div>
            )}
          </div>

          {/* Right Column: Console & Results */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
            
            {hasReport && job.report ? (
              <div className="flex-1 min-h-0 p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm flex flex-col gap-6 overflow-y-auto">
                <div className="flex-none space-y-6">
                    <FuzzingInterpretation report={job.report} />
                    
                    <div>
                        <VulnerabilityCharts report={job.report} />
                    </div>
                </div>
                <div className="pt-2">
                    <FindingsList findings={job.report.findings} />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm flex flex-col items-center justify-center h-64 text-slate-500">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <FileText size={32} className="opacity-50" />
                </div>
                <p className="text-xl font-medium mb-2 text-slate-300">No Report Available</p>
                <p className="text-sm opacity-70 max-w-sm text-center">
                  Once the job completes, upload the generated report to view detailed vulnerability analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
