import type { TooltipItem } from "chart.js";

/**
 * Shared light-theme Chart.js config so every chart (dashboard + fuzzing) uses
 * one palette, grid, tick and tooltip treatment.
 */

// ev-fuzzer light palette (…,0.85 for solid-but-soft fills).
export const CHART_COLORS = {
  blue: "rgba(37, 99, 235, 0.85)", // blue-600
  sky: "rgba(2, 132, 199, 0.85)", // sky-600
  green: "rgba(22, 163, 74, 0.85)", // green-600
  amber: "rgba(217, 119, 6, 0.85)", // amber-600
  rose: "rgba(220, 38, 38, 0.85)", // red-600
  purple: "rgba(147, 51, 234, 0.85)", // purple-600
  orange: "rgba(234, 88, 12, 0.85)", // orange-600
  cyan: "rgba(8, 145, 178, 0.85)", // cyan-600
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.sky,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.rose,
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.cyan,
];

export const CHART_GRID = "#e5e7eb"; // neutral-200
export const CHART_TICK = "#6b7280"; // neutral-500

const percentageTooltip = {
  backgroundColor: "rgba(31, 41, 55, 0.95)",
  titleColor: "#FFFFFF",
  bodyColor: "#D1D5DB",
  borderColor: "rgba(75, 85, 99, 0.5)",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 8,
  displayColors: true,
  titleFont: { size: 13, weight: "bold" as const },
  bodyFont: { size: 12 },
  callbacks: {
    label: (context: TooltipItem<"doughnut"> | TooltipItem<"bar">) => {
      const label = context.label || "";
      const value = typeof context.raw === "number" ? context.raw : 0;
      const data = context.dataset.data as Array<
        number | [number, number] | null | undefined
      >;
      const total = data.reduce<number>(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      );
      const percentage =
        total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
      return `${label}: ${value.toLocaleString()} (${percentage}%)`;
    },
  },
};

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    // Dashboard charts render their own HTML legend; off by default.
    legend: { display: false },
    tooltip: percentageTooltip,
  },
};

const axisScale = {
  grid: {
    display: true,
    color: CHART_GRID,
    lineWidth: 1,
    drawBorder: false,
  },
  ticks: {
    color: CHART_TICK,
    font: { size: 11, family: "inherit" },
    precision: 0,
  },
  beginAtZero: true,
};

export const barChartOptions = {
  ...baseChartOptions,
  scales: {
    x: {
      ...axisScale,
      ticks: { ...axisScale.ticks, maxRotation: 45, minRotation: 0 },
      beginAtZero: undefined,
    },
    y: { ...axisScale, grid: { ...axisScale.grid, drawOnChartArea: true } },
  },
  plugins: baseChartOptions.plugins,
};

export const horizontalBarOptions = {
  ...barChartOptions,
  indexAxis: "y" as const,
  scales: {
    x: { ...barChartOptions.scales.y },
    y: { ...barChartOptions.scales.x, grid: { display: false } },
  },
};

/** Turn a built options object into one with a visible bottom legend. */
export function withLegend<T extends { plugins?: Record<string, unknown> }>(
  options: T,
) {
  return {
    ...options,
    plugins: {
      ...options.plugins,
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: CHART_TICK,
          font: { size: 11 },
          usePointStyle: true,
          boxWidth: 8,
          padding: 12,
        },
      },
    },
  };
}
