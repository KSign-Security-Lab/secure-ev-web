"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  TooltipItem,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import type { RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement);

type AgentsStatistics = RouterOutputs["agents"]["statistics"];

interface AgentsChartsProps {
  data: AgentsStatistics;
}

const SCIENTIFIC_COLORS = {
  trusted: "rgba(76, 175, 80, 0.85)",
  untrusted: "rgba(255, 92, 91, 0.85)",
  primary: "rgba(66, 140, 244, 0.8)",
  secondary: "rgba(0, 159, 227, 0.8)",
  accent: "rgba(76, 175, 80, 0.8)",
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(31, 41, 55, 0.95)",
      titleColor: "#FFFFFF",
      bodyColor: "#D1D5DB",
      borderColor: "rgba(75, 85, 99, 0.5)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        size: 13,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 12,
      },
      callbacks: {
        label: (context: TooltipItem<"doughnut" | "bar">) => {
          const label = context.label || "";
          const value = typeof context.raw === "number" ? context.raw : 0;
          const total = context.dataset.data.reduce(
            (a: number, b: number | [number, number] | null | undefined) => {
                if (typeof b === 'number') return a + b;
                return a;
            },
            0
          );
          const percentage =
            total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
          return `${label}: ${value.toLocaleString()} (${percentage}%)`;
        },
      },
    },
  },
};

const barChartOptions = {
  ...chartOptions,
  scales: {
    x: {
      grid: {
        display: true,
        color: "rgba(75, 85, 99, 0.2)",
        lineWidth: 1,
        drawBorder: false,
      },
      ticks: {
        color: "#9CA3AF",
        font: {
          size: 11,
          family: "inherit",
        },
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      grid: {
        display: true,
        color: "rgba(75, 85, 99, 0.2)",
        lineWidth: 1,
        drawBorder: false,
        drawOnChartArea: true,
      },
      ticks: {
        color: "#9CA3AF",
        font: {
          size: 11,
          family: "inherit",
        },
        precision: 0,
      },
      beginAtZero: true,
    },
  },
  plugins: chartOptions.plugins,
};

export function AgentsCharts({ data }: AgentsChartsProps) {
  const { t } = useI18n();
  const trustPercentage =
    data.totalCount > 0
      ? ((data.trustedCount / data.totalCount) * 100).toFixed(1)
      : "0.0";

  const trustChartData = {
    labels: [t("dashboard.chart.trusted"), t("dashboard.chart.untrusted")],
    datasets: [
      {
        data: [data.trustedCount, data.untrustedCount],
        backgroundColor: [
          SCIENTIFIC_COLORS.trusted,
          SCIENTIFIC_COLORS.untrusted,
        ],
        borderColor: "rgba(31, 41, 55, 0.8)",
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: "#FFFFFF",
      },
    ],
  };

  const platformChartData = {
    labels: data.byPlatform.map((item) => item.name),
    datasets: [
      {
        data: data.byPlatform.map((item) => item.value),
        backgroundColor: SCIENTIFIC_COLORS.primary,
        borderColor: SCIENTIFIC_COLORS.primary,
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 60,
      },
    ],
  };

  const groupChartData = {
    labels: data.byGroup.map((item) => item.name),
    datasets: [
      {
        data: data.byGroup.map((item) => item.value),
        backgroundColor: SCIENTIFIC_COLORS.secondary,
        borderColor: SCIENTIFIC_COLORS.secondary,
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 60,
      },
    ],
  };

  const privilegeChartData = {
    labels: data.byPrivilege.map((item) => item.name),
    datasets: [
      {
        data: data.byPrivilege.map((item) => item.value),
        backgroundColor: SCIENTIFIC_COLORS.accent,
        borderColor: SCIENTIFIC_COLORS.accent,
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 50,
      },
    ],
  };

  const horizontalBarOptions = {
    ...barChartOptions,
    indexAxis: "y" as const,
    scales: {
      x: {
        ...barChartOptions.scales.y,
        grid: {
          ...barChartOptions.scales.y.grid,
        },
      },
      y: {
        ...barChartOptions.scales.x,
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Trust Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-base-700/50 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-green-400 rounded-full" />
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              {t("dashboard.chart.trustStatus")}
            </h3>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            n = {data.totalCount}
          </div>
        </div>
        <div className="h-[300px] w-full relative">
          <Doughnut data={trustChartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">
                {trustPercentage}%
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wide">
                {t("dashboard.chart.trusted")}
              </div>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 p-1.5 rounded bg-base-800/50 border border-base-700/30">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: SCIENTIFIC_COLORS.trusted }}
            />
            <span className="text-neutral-300 flex-1 text-xs">
              {t("dashboard.chart.trusted")}
            </span>
            <span className="text-neutral-400 font-mono text-xs">
              {data.trustedCount}
            </span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-base-800/50 border border-base-700/30">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: SCIENTIFIC_COLORS.untrusted }}
            />
            <span className="text-neutral-300 flex-1 text-xs">
              {t("dashboard.chart.untrusted")}
            </span>
            <span className="text-neutral-400 font-mono text-xs">
              {data.untrustedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-base-700/50 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary-400 rounded-full" />
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              {t("dashboard.chart.byPlatform")}
            </h3>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            n = {data.byPlatform.reduce((sum, item) => sum + item.value, 0)}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <Bar data={platformChartData} options={barChartOptions} />
        </div>
        {/* Summary Stats */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-base-700/30">
          <span className="text-neutral-400">{t("dashboard.chart.platforms")}</span>
          <span className="text-neutral-300 font-mono">
            {t("dashboard.chart.unique", { count: data.byPlatform.length })}
          </span>
        </div>
      </div>

      {/* Group Distribution */}
      {data.byGroup.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-base-700/50 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-accent-400 rounded-full" />
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                {t("dashboard.chart.byGroup")}
              </h3>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              n = {data.byGroup.reduce((sum, item) => sum + item.value, 0)}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <Bar data={groupChartData} options={barChartOptions} />
          </div>
          {/* Summary Stats */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-base-700/30">
            <span className="text-neutral-400">{t("dashboard.chart.groups")}</span>
            <span className="text-neutral-300 font-mono">
              {t("dashboard.chart.unique", { count: data.byGroup.length })}
            </span>
          </div>
        </div>
      )}

      {/* Privilege Distribution */}
      {data.byPrivilege.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-base-700/50 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-400 rounded-full" />
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                {t("dashboard.chart.byPrivilege")}
              </h3>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              n = {data.byPrivilege.reduce((sum, item) => sum + item.value, 0)}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <Bar data={privilegeChartData} options={horizontalBarOptions} />
          </div>
          {/* Summary Stats */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-base-700/30">
            <span className="text-neutral-400">
              {t("dashboard.chart.privilegeLevels")}
            </span>
            <span className="text-neutral-300 font-mono">
              {t("dashboard.chart.unique", { count: data.byPrivilege.length })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
