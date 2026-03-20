"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import type { RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type AbilitiesStatistics = RouterOutputs["abilities"]["statistics"];

interface MitreCoverageChartsProps {
  data: AbilitiesStatistics["mitreCoverage"];
}



export function MitreCoverageCharts({ data }: MitreCoverageChartsProps) {
  const { t } = useI18n();
  return (
    <div className="h-full">
      {/* Overall Stats */}
      <div className="space-y-6 h-full">
        <div className="p-6 flex flex-col items-center justify-center text-center h-full">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            {/* Circular Progress (CSS based) */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-base-700 stroke-current"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              <circle
                className="text-primary-500 progress-ring__circle stroke-current"
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${data.coveragePercentage * 2.51} 251.2`}
                transform="rotate(-90 50 50)"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {data.coveragePercentage}%
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                {t("dashboard.chart.covered")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-3">
              <div className="text-2xl font-bold text-white">
                {data.coveredTechniques}
              </div>
              <div className="text-xs text-neutral-400">
                {t("dashboard.chart.coveredTechniques")}
              </div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-neutral-300">
                {data.totalTechniques}
              </div>
              <div className="text-xs text-neutral-400">
                {t("dashboard.chart.totalTechniques")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
