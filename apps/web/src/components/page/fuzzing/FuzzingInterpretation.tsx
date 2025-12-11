"use client";

import React, { useMemo } from "react";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";
import type { FuzzingReport } from "~/types/fuzzing";

interface FuzzingInterpretationProps {
  report: FuzzingReport;
}

export function FuzzingInterpretation({ report }: FuzzingInterpretationProps) {
  const analysis = useMemo(() => {
    const findings = report.findings || [];
    const criticals = findings.filter((f) => f.severity === "critical").length;
    const highs = findings.filter((f) => f.severity === "high").length;
    const mediums = findings.filter((f) => f.severity === "medium").length;
    const lows = findings.filter((f) => f.severity === "low").length;
    const infos = findings.filter((f) => f.severity === "info").length;

    let status: "critical" | "warning" | "safe" = "safe";
    if (criticals > 0 || highs > 0) status = "critical";
    else if (mediums > 0 || lows > 0) status = "warning";

    // Most affected area
    const locationCounts: Record<string, number> = {};
    findings.forEach((f) => {
      // Try to determine location from affectedMessages or title
      const loc = f.affectedMessages?.[0] || "General";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return { criticals, highs, mediums, lows, infos, status, topLocation };
  }, [report]);

  const { criticals, highs, status, topLocation } = analysis;
  const totalIssues = report.statistics.uniqueFindings;

  // Dynamic Content Generation
  const getContent = () => {
    switch (status) {
      case "critical":
        return {
          title: "Critical Security Risks Detected",
          color: "red",
          icon: ShieldAlert,
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          text: "text-red-200",
          titleText: "text-red-100",
          summary: `The fuzzing session identified ${criticals > 0 ? `${criticals} critical` : ""} ${highs > 0 ? `and ${highs} high-severity` : ""} vulnerabilities. These issues pose a significant threat to system stability and security, potentially allowing attackers to compromise the charger or cause denial of service.`,
          action: `Immediate remediation is required for the ${topLocation ? `${topLocation} logic` : "identified vulnerabilities"}.`,
        };
      case "warning":
        return {
          title: "Moderate Security Concerns",
          color: "yellow",
          icon: AlertTriangle,
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20",
          text: "text-yellow-200",
          titleText: "text-yellow-100",
          summary: `The scan detected ${analysis.mediums} medium and ${analysis.lows} low severity issues. While no critical failures occurred, these defects could lead to unexpected behavior or minor protocol deviations under stress.`,
          action: "Review these findings in the next development cycle to improve robustness.",
        };
      case "safe":
      default:
        return {
          title: "System Appears Secure",
          color: "green",
          icon: ShieldCheck,
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          text: "text-green-200",
          titleText: "text-green-100",
          summary: `No significant security vulnerabilities were found across ${report.statistics.totalCases} test cases. The target demonstrated strong resilience against fuzzing attacks.`,
          action: "Continue monitoring and perform regular regression testing.",
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className={`p-6 rounded-3xl ${content.bg} border ${content.border} backdrop-blur-sm relative overflow-hidden group`}> 
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
            
            <div className={`flex items-start gap-2 text-sm ${content.text} font-medium bg-black/20 p-3 rounded-lg border ${content.border}`}>
                <CheckCircle size={16} className="mt-0.5 flex-none opacity-70" />
                <span>{content.action}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
