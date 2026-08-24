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
         <Loader2 className="animate-spin text-primary-500 mr-2" size={24} />
         {t("fuzzing.jobDetail.loading")}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p>{t("fuzzing.jobDetail.notFound")}</p>
        <Link href="/fuzzing/jobs" className="text-primary-400 hover:underline mt-2">
          {t("fuzzing.jobDetail.returnToJobs")}
        </Link>
      </div>
    );
  }
  
  const hasReport = !!job.report;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex-none p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/30 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/fuzzing/jobs"
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{job.name}</h1>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">{job.id}</p>
          </div>
        </div>

        {hasReport && (
            <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm border border-slate-700 transition-colors">
                    <Download size={14} />
                    {t("fuzzing.jobDetail.exportReport")}
                 </button>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-[440px] w-full flex-none p-4 border-r border-white/5 bg-slate-900/20 overflow-y-auto">
          <JobSummary job={job as FuzzingJobWithReport} />
          
          {!hasReport && (
            <div className="mt-8 border-t border-slate-800 pt-6 space-y-6">
                <div>
                   <h3 className="text-sm font-medium text-slate-400 mb-3">
                     {t("fuzzing.jobDetail.fuzzerSetup")}
                   </h3>
                   <ConfigDownload />
                </div>
               

            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
            {!hasReport && !job.report ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
                    <FileText size={40} className="text-slate-600" />
                 </div>
                 <h3 className="text-xl font-medium text-white mb-2">
                   {t("fuzzing.jobDetail.noReportTitle")}
                 </h3>
                 <p className="text-slate-400 max-w-md">
                   {job.status === "COMPLETED" 
                     ? t("fuzzing.jobDetail.noReportCompleted")
                     : t("fuzzing.jobDetail.noReportPending")}
                 </p>
                 <div className="mt-8 w-full max-w-sm bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <ReportUpload jobId={job.id} onUploadSuccess={() => refetch()} />
                 </div>
              </div>
            ) : (
             <>
               {/* Tabs Header */}
               <div className="flex-none px-6 pt-4 pb-2 border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-10">
                   <div className="flex gap-6">
                       <button
                          onClick={() => setActiveTab("overview")}
                          className={clsx(
                              "pb-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors",
                              activeTab === "overview" 
                                ? "text-primary-400 border-primary-500" 
                                : "text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700"
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
                                ? "text-primary-400 border-primary-500" 
                                : "text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700"
                          )}
                       >
                           <List size={16} />
                           {t("fuzzing.jobDetail.tab.logs")}
                       </button>
                   </div>
               </div>

               {/* Tab Content */}
               <div className="flex-1 overflow-hidden relative bg-slate-950">
                  {activeTab === "overview" && job.report && (
                      <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
