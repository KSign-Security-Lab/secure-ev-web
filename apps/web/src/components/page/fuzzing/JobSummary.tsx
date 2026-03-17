"use client";

import React from "react";
import { Tag, TAG_COLOR_MAP } from "~/components/common/Tag/Tag";
import type { FuzzingJobWithReport } from "~/types/fuzzing";
import { Globe, Server, Activity, Clock } from "lucide-react";

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

const getTargetTypeLabel = (targetType: string): string => {
  switch (targetType) {
    case "ISO15118":
      return "ISO 15118 Charger";
    case "OCPP_CHARGER":
      return "Charger via OCPP";
    case "OCPP_SERVER":
      return "OCPP Server";
    default:
      return targetType;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function JobSummary({ job }: JobSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Activity size={20} />
        </div>
        <h2 className="text-xl font-bold text-white">Job Overview</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-5">
        
        {/* Status Section */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between group hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Activity size={18} />
                </div>
                <div>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Current Status</span>
                    <div className="mt-1">
                        <Tag label={job.status} color={getStatusColor(job.status)} size="sm" />
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
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Target</span>
                    <p className="text-white font-medium mt-0.5 truncate">{getTargetTypeLabel(job.targetType)}</p>
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
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Environment</span>
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
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Created</span>
                        <span className="text-white font-mono text-xs">{formatDate(job.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Updated</span>
                        <span className="text-white font-mono text-xs">{formatDate(job.updatedAt)}</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
