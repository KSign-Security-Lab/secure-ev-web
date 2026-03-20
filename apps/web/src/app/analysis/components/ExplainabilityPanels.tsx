"use client";

import { AlertTriangle, ShieldCheck, ShieldQuestion, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { AnalysisResult, DfInfo } from "./mockData";

interface ExplainabilityPanelsProps {
  result: AnalysisResult;
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-center justify-between text-sm text-[#8b949e] py-1">
    <span>{label}</span>
    <span className="font-mono text-[#c9d1d9] text-right wrap-break-word" title={value || "N/A"}>
      {value || "N/A"}
    </span>
  </div>
);

const determineRisk = (dfInfo: DfInfo) => {
  const unbounded = dfInfo.validation?.upper_vs_capacity === "Unbounded" || dfInfo.validation?.upper === "None";
  const critical = dfInfo.diagnostics?.overflow_risk === "Critical";

  if (unbounded || critical) return { tone: "danger", label: "Potentially Dangerous", Icon: AlertTriangle } as const;
  if (dfInfo.diagnostics?.overflow_risk === "None") return { tone: "safe", label: "Considered Safe", Icon: ShieldCheck } as const;
  return { tone: "warning", label: "Needs Review", Icon: ShieldQuestion } as const;
};

export default function ExplainabilityPanels({ result }: ExplainabilityPanelsProps) {
  const { dfInfo, functionName } = result;
  const { tone, label, Icon } = determineRisk(dfInfo);

  return (
    <div className="space-y-4">
      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="pb-2 border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-sm text-[#8b949e]">
            <Icon className={tone === "danger" ? "text-[#f85149]" : tone === "safe" ? "text-[#56d364]" : "text-[#d29922]"} size={16} />
            <span className="font-semibold text-[#c9d1d9]">{label}</span>
          </div>
          <CardTitle className="text-base text-[#c9d1d9] wrap-break-word">{functionName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          <p className="text-sm text-[#8b949e] leading-relaxed wrap-break-word">
            {dfInfo.diagnostics?.notes || "Data flow analysis summary not available."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Risk" value={dfInfo.diagnostics?.overflow_risk} />
            <InfoRow label="Root Cause" value={dfInfo.root_cause?.kind} />
            <InfoRow label="Capacity" value={dfInfo.capacity?.value} />
            <InfoRow label="Request" value={dfInfo.request?.value} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#0d1117] border-[#30363d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#79c0ff]">Destination & Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Destination" value={dfInfo.destination?.expr} />
            <InfoRow label="Region" value={dfInfo.destination?.region} />
            <InfoRow label="Capacity Expr" value={dfInfo.capacity?.expr} />
            <InfoRow label="Length Basis" value={dfInfo.capacity?.length_basis} />
          </CardContent>
        </Card>

        <Card className="bg-[#0d1117] border-[#30363d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#bc8cff]">Request & Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Request" value={dfInfo.request?.token} />
            <InfoRow label="Bytes" value={dfInfo.request?.bytes?.expr} />
            <InfoRow label="Upper Bound" value={dfInfo.validation?.upper} />
            <InfoRow label="Upper vs Capacity" value={dfInfo.validation?.upper_vs_capacity} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-[#d29922]">Root Cause Chain</CardTitle>
          <GitBranch size={16} className="text-[#8b949e]" />
        </CardHeader>
        <CardContent>
          <InfoRow label="Class Family" value={dfInfo.root_cause?.class_family} />
          <InfoRow label="Origin" value={dfInfo.validation?.index_origin_chain} />
        </CardContent>
      </Card>
    </div>
  );
}
