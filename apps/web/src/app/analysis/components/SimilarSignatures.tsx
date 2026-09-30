"use client";

import React from "react";
import { AnalysisResult, mockSimilarSignatures } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { Search } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";

interface SimilarSignaturesProps {
  result: AnalysisResult;
}

export default function SimilarSignatures({ result }: SimilarSignaturesProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {t("analysis.similar.title")}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            {t("analysis.similar.foundCount", {
              count: mockSimilarSignatures.length,
            })}
          </p>
        </div>
        <Badge variant="blue">
          {t("analysis.similar.target", { name: result.functionName })}
        </Badge>
      </div>

      <div className="space-y-4">
        {mockSimilarSignatures.map((sim, idx) => (
          <div
            key={sim.id}
            className="border border-neutral-200 bg-white rounded-lg p-5 hover:border-neutral-300 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-mono">
                    {t("analysis.similar.rank", { rank: idx + 1 })}
                  </span>
                  <h4 className="font-semibold text-neutral-900">{sim.functionName}</h4>
                </div>
                <p className="text-sm text-neutral-500 font-mono">{sim.filePath}</p>
              </div>
              <button
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                onClick={() => alert(t("analysis.similar.compareRunsPlaceholder"))}
              >
                {t("analysis.similar.compareRuns")}
              </button>
            </div>

            <div className="bg-neutral-50 rounded p-3 mb-4">
              <p className="text-sm text-neutral-500">
                <span className="text-blue-700 font-medium mr-2">
                  {t("analysis.similar.whySimilar")}
                </span>
                {sim.whySimilar}
              </p>
            </div>

            <div>
              <h5 className="text-xs uppercase text-neutral-500 font-semibold mb-2">
                {t("analysis.similar.breakdown")}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-neutral-50 rounded p-2 text-center">
                  <div className="text-lg font-mono text-green-700">{sim.scores.embedding}%</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {t("analysis.similar.embedding")}
                  </div>
                </div>
                <div className="bg-neutral-50 rounded p-2 text-center">
                  <div className="text-lg font-mono text-blue-700">{sim.scores.tag}%</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {t("analysis.similar.tag")}
                  </div>
                </div>
                <div className="bg-neutral-50 rounded p-2 text-center">
                  <div className="text-lg font-mono text-purple-700">{sim.scores.df}%</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {t("analysis.similar.dfFlow")}
                  </div>
                </div>
                <div className="bg-neutral-50 rounded p-2 text-center">
                  <div className="text-lg font-mono text-amber-700">{sim.scores.core}%</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {t("analysis.similar.coreLogic")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {mockSimilarSignatures.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-neutral-500 border border-neutral-200 border-dashed rounded-lg bg-neutral-50">
            <Search className="w-12 h-12 mb-4 text-neutral-400" />
            <p>{t("analysis.similar.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
