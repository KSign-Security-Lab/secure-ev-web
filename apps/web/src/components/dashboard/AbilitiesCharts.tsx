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

type AbilitiesStatistics = RouterOutputs["abilities"]["statistics"];

interface AbilitiesChartsProps {
  data: AbilitiesStatistics;
}

const SCIENTIFIC_COLORS = {
  primary: "rgba(37, 99, 235, 0.85)",
  secondary: "rgba(2, 132, 199, 0.85)",
  palette: [
    "rgba(37, 99, 235, 0.85)",
    "rgba(2, 132, 199, 0.85)",
    "rgba(22, 163, 74, 0.85)",
    "rgba(217, 119, 6, 0.85)",
    "rgba(220, 38, 38, 0.85)",
    "rgba(147, 51, 234, 0.85)",
    "rgba(234, 88, 12, 0.85)",
    "rgba(8, 145, 178, 0.85)",
  ],
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
        color: "#e5e7eb",
        lineWidth: 1,
        drawBorder: false,
      },
      ticks: {
        color: "#6b7280",
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
        color: "#e5e7eb",
        lineWidth: 1,
        drawBorder: false,
        drawOnChartArea: true,
      },
      ticks: {
        color: "#6b7280",
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

export function AbilitiesCharts({ data }: AbilitiesChartsProps) {
  const { t } = useI18n();
  const tacticChartData = {
    labels: data.byTactic.map((item) => item.name),
    datasets: [
      {
        data: data.byTactic.map((item) => item.value),
        backgroundColor: SCIENTIFIC_COLORS.palette,
        borderColor: "#ffffff",
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

  const typeChartData = {
    labels: data.byType.map((item) => item.name),
    datasets: [
      {
        data: data.byType.map((item) => item.value),
        backgroundColor: SCIENTIFIC_COLORS.secondary,
        borderColor: SCIENTIFIC_COLORS.secondary,
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
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      {/* Tactic Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-600 rounded-full" />
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              {t("dashboard.chart.byTactic")}
            </h3>
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            n = {data.totalCount}
          </div>
        </div>
        <div className="h-[300px] w-full relative">
          <Doughnut data={tacticChartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-xl font-bold text-neutral-950 mb-1">
                {data.totalCount.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide">
                {t("dashboard.chart.total")}
              </div>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-1.5 text-xs">
          {data.byTactic.slice(0, 4).map((item, index) => (
            <div
              key={item.name}
              className="flex items-center gap-2 p-1.5 rounded bg-neutral-50 border border-neutral-200"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: SCIENTIFIC_COLORS.palette[index] || "#666",
                }}
              />
              <span className="text-neutral-700 truncate flex-1 text-xs">
                {item.name}
              </span>
              <span className="text-neutral-500 font-mono text-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-sky-600 rounded-full" />
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              {t("dashboard.chart.byPlatform")}
            </h3>
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            n = {data.byPlatform.reduce((sum, item) => sum + item.value, 0)}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <Bar data={platformChartData} options={barChartOptions} />
        </div>
        {/* Summary Stats */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200">
          <span className="text-neutral-500">{t("dashboard.chart.platforms")}</span>
          <span className="text-neutral-700 font-mono">
            {t("dashboard.chart.unique", { count: data.byPlatform.length })}
          </span>
        </div>
      </div>

      {/* Type Distribution */}
      {data.byType.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-sky-600 rounded-full" />
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                {t("dashboard.chart.byType")}
              </h3>
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              n = {data.byType.reduce((sum, item) => sum + item.value, 0)}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <Bar data={typeChartData} options={horizontalBarOptions} />
          </div>
          {/* Summary Stats */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200">
            <span className="text-neutral-500">{t("dashboard.chart.types")}</span>
            <span className="text-neutral-700 font-mono">
              {t("dashboard.chart.unique", { count: data.byType.length })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
