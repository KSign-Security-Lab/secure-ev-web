"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { RouterOutputs } from "~/lib/trpc";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type AbilitiesStatistics = RouterOutputs["abilities"]["statistics"];

interface MitreCoverageChartsProps {
  data: AbilitiesStatistics["mitreCoverage"];
}

const SCIENTIFIC_COLORS = {
  primary: "rgba(66, 140, 244, 0.8)",
  success: "rgba(76, 175, 80, 0.8)",
  warning: "rgba(249, 200, 81, 0.8)",
  background: "rgba(31, 41, 55, 0.5)",
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y" as const,
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
      displayColors: false,
      titleFont: {
        size: 13,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 12,
      },
      callbacks: {
        label: (context: TooltipItem<"bar">) => {
          // Access underlying data to show covered/total
          // But here we are likely charting percentage.
          // context.raw is the value.
          return `${context.raw}% Coverage`;
        },
      },
    },
  },
  scales: {
    x: {
      min: 0,
      max: 100,
      grid: {
        display: true,
        color: "rgba(75, 85, 99, 0.2)",
        lineWidth: 1,
        drawBorder: false,
      },
      ticks: {
        color: "#9CA3AF",
        callback: function (tickValue: number | string) {
          return tickValue + "%";
        },
      },
    },
    y: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#D1D5DB",
        font: {
          weight: "bold" as const,
        },
      },
    },
  },
};

export function MitreCoverageCharts({ data }: MitreCoverageChartsProps) {
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
                Covered
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-3">
              <div className="text-2xl font-bold text-white">
                {data.coveredTechniques}
              </div>
              <div className="text-xs text-neutral-400">Covered Techniques</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-neutral-300">
                {data.totalTechniques}
              </div>
              <div className="text-xs text-neutral-400">Total Techniques</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
