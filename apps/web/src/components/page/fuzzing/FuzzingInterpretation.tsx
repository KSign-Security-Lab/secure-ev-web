"use client";

import React, { useMemo } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";
import type { FuzzingReport } from "~/types/fuzzing";
import { analyzeRuns } from "~/utils/fuzzing.client";
import { useI18n } from "~/i18n/I18nProvider";

interface FuzzingInterpretationProps {
  report: FuzzingReport;
}

export function FuzzingInterpretation({ report }: FuzzingInterpretationProps) {
  const { t } = useI18n();
  const analysis = useMemo(() => {
    return analyzeRuns(report.runs);
  }, [report]);

  const { stats } = analysis;

  // Dynamic Content Generation
  const getContent = () => {
    if (stats.crashes > 0) {
      return {
          title: t("fuzzing.interpretation.criticalTitle"),
          color: "red",
          icon: ShieldAlert,
          bg: "bg-rose-50",
          border: "border-rose-200",
          text: "text-rose-700",
          titleText: "text-rose-800",
          summary: t("fuzzing.interpretation.criticalSummary", {
            count: stats.crashes,
          }),
          action: t("fuzzing.interpretation.criticalAction"),
      };
    } else if (stats.timeouts > 0) {
      return {
          title: t("fuzzing.interpretation.performanceTitle"),
          color: "yellow",
          icon: AlertTriangle,
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
          titleText: "text-amber-800",
          summary: t("fuzzing.interpretation.performanceSummary", {
            count: stats.timeouts,
          }),
          action: t("fuzzing.interpretation.performanceAction"),
      };
    } else {
      return {
          title: t("fuzzing.interpretation.secureTitle"),
          color: "green",
          icon: ShieldCheck,
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          titleText: "text-green-800",
          summary: t("fuzzing.interpretation.secureSummary", {
            count: stats.total,
          }),
          action: t("fuzzing.interpretation.secureAction"),
      };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className={`p-6 rounded-lg ${content.bg} border ${content.border} relative overflow-hidden group`}>
      {/* Decorative Background Icon */}
      <Icon className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-5 ${content.text} group-hover:scale-110 transition-transform duration-500`} />

      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <div className="flex-none">
           <div className={`w-12 h-12 rounded-xl ${content.bg} border ${content.border} flex items-center justify-center`}>
              <Icon className={content.text.replace("text-", "text-opacity-80 ")} size={24} />
           </div>
        </div>
        
        <div className="flex-1 space-y-3">
            <div>
                <h3 className={`text-xl font-bold ${content.titleText}`}>{content.title}</h3>
                <p className={`mt-2 ${content.text} leading-relaxed`}>
                    {content.summary}
                </p>
            </div>
            
            <div className={`flex items-start gap-2 text-sm ${content.text} font-medium bg-white p-3 rounded-lg border ${content.border}`}>
                <CheckCircle size={16} className="mt-0.5 flex-none opacity-70" />
                <span>{content.action}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
