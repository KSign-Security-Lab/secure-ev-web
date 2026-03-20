"use client";

import React from "react";
import { Tag, TAG_COLOR_MAP } from "~/components/common/Tag/Tag";
import type { FuzzingJobWithReport } from "~/types/fuzzing";
import { Globe, Server, Activity, Clock } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";

interface JobSummaryProps {
  job: FuzzingJobWithReport;
}

const getStatusColor = (status: string): keyof typeof TAG_COLOR_MAP => {
  switch (status) {
    case "COMPLETED":
      return "green";
    case "RUNNING":
      return "blue";
    case "FAILED":
      return "red";
    case "PENDING":
      return "yellow";
    case "DRAFT":
      return "gray";
    default:
      return "gray";
  }
};

const formatDate = (dateString: string, locale: "en" | "ko"): string => {
  const date = new Date(dateString);
  return date.toLocaleString(locale === "ko" ? "ko-KR" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function JobSummary({ job }: JobSummaryProps) {
  const { locale, t } = useI18n();
  const copy =
    locale === "ko"
      ? {
          title: "작업 개요",
          status: "현재 상태",
          target: "대상",
          environment: "환경",
          created: "생성됨",
          updated: "업데이트됨",
        }
      : {
          title: "Job Overview",
          status: "Current Status",
          target: "Target",
          environment: "Environment",
          created: "Created",
          updated: "Updated",
        };

  const getTargetTypeLabel = (targetType: string): string => {
    switch (targetType) {
      case "ISO15118":
        return t("fuzzing.target.iso15118Charger");
      case "OCPP_CHARGER":
        return t("fuzzing.target.ocppCharger");
      case "OCPP_SERVER":
        return t("fuzzing.target.ocppServer");
      default:
        return targetType;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "RUNNING":
        return t("status.running");
      case "COMPLETED":
        return t("status.completed");
      case "FAILED":
        return t("status.failed");
      case "PENDING":
        return t("status.pending");
      case "DRAFT":
        return t("status.draft");
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Activity size={20} />
        </div>
        <h2 className="text-xl font-bold text-white">{copy.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-5">
        
        {/* Status Section */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between group hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Activity size={18} />
                </div>
                <div>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                      {copy.status}
                    </span>
                    <div className="mt-1">
                        <Tag
                          label={getStatusLabel(job.status)}
                          color={getStatusColor(job.status)}
                          size="sm"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Target Info */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between group hover:border-slate-600 transition-colors">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Server size={18} />
                </div>
                <div>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                      {copy.target}
                    </span>
                    <p className="text-white font-medium mt-0.5 truncate">
                      {getTargetTypeLabel(job.targetType)}
                    </p>
                </div>
            </div>
        </div>

        {/* Environment */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between group hover:border-slate-600 transition-colors">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Globe size={18} />
                </div>
                <div>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                      {copy.environment}
                    </span>
                    <p className="text-white font-medium mt-0.5 capitalize truncate">{job.environment}</p>
                </div>
            </div>
        </div>

        {/* Timestamps */}
         <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-3 group hover:border-slate-600 transition-colors">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Clock size={18} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2 mb-2">
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                          {copy.created}
                        </span>
                        <span className="text-white font-mono text-xs">
                          {formatDate(job.createdAt, locale)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                          {copy.updated}
                        </span>
                        <span className="text-white font-mono text-xs">
                          {formatDate(job.updatedAt, locale)}
                        </span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
