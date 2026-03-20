"use client";

import { AlertTriangle, ShieldCheck, ShieldQuestion, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { AnalysisResult, DfInfo } from "./mockData";
import { useI18n } from "~/i18n/I18nProvider";
import type { TranslationKey } from "~/i18n/messages";

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

const determineRisk = (dfInfo: DfInfo, t: (key: TranslationKey) => string) => {
  const unbounded = dfInfo.validation?.upper_vs_capacity === "Unbounded" || dfInfo.validation?.upper === "None";
  const critical = dfInfo.diagnostics?.overflow_risk === "Critical";

  if (unbounded || critical) {
    return {
      tone: "danger",
      label: t("analysis.explainability.potentiallyDangerous"),
      Icon: AlertTriangle,
    } as const;
  }
  if (dfInfo.diagnostics?.overflow_risk === "None") {
    return {
      tone: "safe",
      label: t("analysis.explainability.consideredSafe"),
      Icon: ShieldCheck,
    } as const;
  }
  return {
    tone: "warning",
    label: t("analysis.explainability.needsReview"),
    Icon: ShieldQuestion,
  } as const;
};

export default function ExplainabilityPanels({ result }: ExplainabilityPanelsProps) {
  const { t } = useI18n();
  const { dfInfo, functionName } = result;
  const { tone, label, Icon } = determineRisk(dfInfo, t);
  const fallbackValue = t("analysis.explainability.na");

  const formatValue = (value?: string) => value || fallbackValue;

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
            {dfInfo.diagnostics?.notes || t("analysis.explainability.summaryUnavailable")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label={t("analysis.explainability.risk")} value={formatValue(dfInfo.diagnostics?.overflow_risk)} />
            <InfoRow label={t("analysis.explainability.rootCause")} value={formatValue(dfInfo.root_cause?.kind)} />
            <InfoRow label={t("analysis.explainability.capacity")} value={formatValue(dfInfo.capacity?.value)} />
            <InfoRow label={t("analysis.explainability.request")} value={formatValue(dfInfo.request?.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#0d1117] border-[#30363d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#79c0ff]">
              {t("analysis.explainability.destinationAndCapacity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label={t("analysis.explainability.destination")} value={formatValue(dfInfo.destination?.expr)} />
            <InfoRow label={t("analysis.explainability.region")} value={formatValue(dfInfo.destination?.region)} />
            <InfoRow label={t("analysis.explainability.capacityExpr")} value={formatValue(dfInfo.capacity?.expr)} />
            <InfoRow label={t("analysis.explainability.lengthBasis")} value={formatValue(dfInfo.capacity?.length_basis)} />
          </CardContent>
        </Card>

        <Card className="bg-[#0d1117] border-[#30363d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#bc8cff]">
              {t("analysis.explainability.requestAndValidation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label={t("analysis.explainability.request")} value={formatValue(dfInfo.request?.token)} />
            <InfoRow label={t("analysis.explainability.bytes")} value={formatValue(dfInfo.request?.bytes?.expr)} />
            <InfoRow label={t("analysis.explainability.upperBound")} value={formatValue(dfInfo.validation?.upper)} />
            <InfoRow label={t("analysis.explainability.upperVsCapacity")} value={formatValue(dfInfo.validation?.upper_vs_capacity)} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-[#d29922]">
            {t("analysis.explainability.rootCauseChain")}
          </CardTitle>
          <GitBranch size={16} className="text-[#8b949e]" />
        </CardHeader>
        <CardContent>
          <InfoRow label={t("analysis.explainability.classFamily")} value={formatValue(dfInfo.root_cause?.class_family)} />
          <InfoRow label={t("analysis.explainability.origin")} value={formatValue(dfInfo.validation?.index_origin_chain)} />
        </CardContent>
      </Card>
    </div>
  );
}
