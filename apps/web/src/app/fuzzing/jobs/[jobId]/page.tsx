"use client";

import React, { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, FileText, Download, LayoutDashboard, List, Loader2 } from "lucide-react";
import Link from "next/link";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { JobStatusBadge } from "~/components/page/fuzzing/JobStatusBadge";
import { JobSummary } from "~/components/page/fuzzing/JobSummary";
import { FuzzingInterpretation } from "~/components/page/fuzzing/FuzzingInterpretation";
import { VulnerabilityCharts } from "~/components/page/fuzzing/VulnerabilityCharts";
import { InteractionLogTable } from "~/components/page/fuzzing/InteractionLogTable";
import { ReportUpload } from "~/components/page/fuzzing/ReportUpload";
import { ConfigDownload } from "~/components/page/fuzzing/ConfigDownload";
import clsx from "clsx";
import type { FuzzingJobWithReport } from "~/types/fuzzing";
import { useI18n } from "~/i18n/I18nProvider";
type JobDetail = RouterOutputs["fuzzing"]["getById"];

export default function FuzzingJobDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const jobId = params?.jobId as string;
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;

    try {
      const data = await trpc.fuzzing.getById.query({ jobId: jobId });
      setJob(data);
    } catch {
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    if (jobId) void fetchJob();
  }, [fetchJob, jobId]);

  // Polling for status updates
  React.useEffect(() => {
    if (!job || !["RUNNING", "PENDING"].includes(job.status)) return;

    const interval = setInterval(() => {
      void fetchJob();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchJob, job]);
  
  const refetch = fetchJob;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-neutral-400">
         <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
         {t("fuzzing.jobDetail.loading")}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500">
        <p>{t("fuzzing.jobDetail.notFound")}</p>
        <Link href="/fuzzing/jobs" className="text-blue-700 hover:text-blue-900 hover:underline mt-2">
          {t("fuzzing.jobDetail.returnToJobs")}
        </Link>
      </div>
    );
  }
  
  const hasReport = !!job.report;

  return (
    <div className="flex flex-col h-full bg-neutral-100">
      {/* Header */}
      <div className="flex-none p-4 border-b border-neutral-200 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/fuzzing/jobs"
            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-neutral-900">{job.name}</h1>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="text-sm text-neutral-500 mt-1 font-mono">{job.id}</p>
          </div>
        </div>

        {hasReport && (
            <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-lg text-sm border border-neutral-200 transition-colors">
                    <Download size={14} />
                    {t("fuzzing.jobDetail.exportReport")}
                 </button>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-[440px] w-full flex-none p-4 border-r border-neutral-200 bg-white overflow-y-auto">
          <JobSummary job={job as FuzzingJobWithReport} />
          
          {!hasReport && (
            <div className="mt-8 border-t border-neutral-200 pt-6 space-y-6">
                <div>
                   <h3 className="text-sm font-medium text-neutral-500 mb-3">
                     {t("fuzzing.jobDetail.fuzzerSetup")}
                   </h3>
                   <ConfigDownload />
                </div>
               

            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-100 relative">
            {!hasReport && !job.report ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-20 h-20 rounded-lg bg-white border border-neutral-200 flex items-center justify-center mb-6">
                    <FileText size={40} className="text-neutral-400" />
                 </div>
                 <h3 className="text-xl font-medium text-neutral-900 mb-2">
                   {t("fuzzing.jobDetail.noReportTitle")}
                 </h3>
                 <p className="text-neutral-500 max-w-md">
                   {job.status === "COMPLETED" 
                     ? t("fuzzing.jobDetail.noReportCompleted")
                     : t("fuzzing.jobDetail.noReportPending")}
                 </p>
                 <div className="mt-8 w-full max-w-sm bg-white p-6 rounded-lg border border-neutral-200">
                    <ReportUpload jobId={job.id} onUploadSuccess={() => refetch()} />
                 </div>
              </div>
            ) : (
             <>
               {/* Tabs Header */}
               <div className="flex-none px-6 pt-4 pb-2 border-b border-neutral-200 bg-neutral-100 sticky top-0 z-10">
                   <div className="flex gap-6">
                       <button
                          onClick={() => setActiveTab("overview")}
                          className={clsx(
                              "pb-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors",
                              activeTab === "overview" 
                                ? "text-blue-700 border-blue-600" 
                                : "text-neutral-500 border-transparent hover:text-neutral-900 hover:border-neutral-300"
                          )}
                       >
                           <LayoutDashboard size={16} />
                           {t("fuzzing.jobDetail.tab.overview")}
                       </button>
                       <button
                          onClick={() => setActiveTab("logs")}
                          className={clsx(
                              "pb-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors",
                              activeTab === "logs" 
                                ? "text-blue-700 border-blue-600" 
                                : "text-neutral-500 border-transparent hover:text-neutral-900 hover:border-neutral-300"
                          )}
                       >
                           <List size={16} />
                           {t("fuzzing.jobDetail.tab.logs")}
                       </button>
                   </div>
               </div>

               {/* Tab Content */}
               <div className="flex-1 overflow-hidden relative bg-neutral-100">
                  {activeTab === "overview" && job.report && (
                      <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                          <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-300">
                             <FuzzingInterpretation report={job.report} />
                             <VulnerabilityCharts report={job.report} />
                          </div>
                      </div>
                  )}
                  
                  {activeTab === "logs" && job.report && (
                      <div className="h-full w-full p-4 flex flex-col min-h-0">
                          <div className="max-w-6xl mx-auto w-full h-full animate-in slide-in-from-bottom-2 duration-300">
                              <InteractionLogTable runs={job.report.runs} />
                          </div>
                      </div>
                  )}
               </div>
             </>
            )}
        </div>
      </div>
    </div>
  );
}
