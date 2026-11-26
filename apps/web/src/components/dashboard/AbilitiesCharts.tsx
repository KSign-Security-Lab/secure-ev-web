"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import type { RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { tacticLabel, UNKNOWN_PLATFORM } from "~/lib/format";
import {
  CHART_COLORS,
  CHART_PALETTE,
  baseChartOptions,
  barChartOptions,
  horizontalBarOptions,
} from "./chartTheme";

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement);

const OTHER_COLOR = "rgba(163, 163, 163, 0.85)"; // neutral-400

type AbilitiesStatistics = RouterOutputs["abilities"]["statistics"];

interface ChartProps {
  data: AbilitiesStatistics;
}

function SectionTitle({ label, n, accent }: { label: string; n: number; accent: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
      <div className="flex items-center gap-2">
        <div className={`h-5 w-1 rounded-full ${accent}`} />
        <h3 className="text-sm font-semibold text-neutral-700">{label}</h3>
      </div>
      <div className="text-xs tabular-nums text-neutral-500">n = {n.toLocaleString()}</div>
    </div>
  );
}

/** Tactic doughnut with a legend entry for every slice. */
export function TacticChart({ data }: ChartProps) {
  const { t } = useI18n();
  const translate = (key: string) => t(key as Parameters<typeof t>[0]);
  const labels = data.byTactic.map((item) => tacticLabel(item.name, translate));
  const sliceTotal = data.byTactic.reduce((sum, item) => sum + item.value, 0);
  // "Other" is a remainder bucket, not a category — keep it neutral grey so it
  // doesn't read as one more tactic next to similar palette hues.
  const colors = data.byTactic.map((item, index) =>
    item.name === "other" ? OTHER_COLOR : CHART_PALETTE[index % CHART_PALETTE.length]
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: data.byTactic.map((item) => item.value),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: "#FFFFFF",
      },
    ],
  };

  return (
    <div className="space-y-4">
      <SectionTitle label={t("dashboard.chart.byTactic")} n={sliceTotal} accent="bg-blue-600" />
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,240px)_1fr]">
        <div className="relative mx-auto h-[240px] w-full max-w-[240px]">
          <Doughnut data={chartData} options={baseChartOptions} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-semibold tabular-nums text-neutral-950">
                {sliceTotal.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500">{t("dashboard.chart.abilities")}</div>
            </div>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-1.5 text-sm">
          {data.byTactic.map((item, index) => (
            <li
              key={item.name}
              className="flex items-center gap-2 rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colors[index] }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-neutral-700" title={labels[index]}>
                {labels[index]}
              </span>
              <span className="tabular-nums text-neutral-500">{item.value.toLocaleString()}</span>
              <span className="w-12 text-right text-xs tabular-nums text-neutral-400">
                {sliceTotal ? `${((item.value / sliceTotal) * 100).toFixed(1)}%` : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PlatformChart({ data }: ChartProps) {
  const { t } = useI18n();
  const chartData = {
    labels: data.byPlatform.map((item) =>
      item.name === UNKNOWN_PLATFORM ? t("tactic.unknown") : item.name
    ),
    datasets: [
      {
        data: data.byPlatform.map((item) => item.value),
        backgroundColor: CHART_COLORS.blue,
        borderColor: CHART_COLORS.blue,
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 60,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        label={t("dashboard.chart.byPlatform")}
        n={data.byPlatform.reduce((sum, item) => sum + item.value, 0)}
        accent="bg-sky-600"
      />
      <div className="h-[260px] w-full">
        <Bar data={chartData} options={barChartOptions} />
      </div>
      <p className="text-xs text-neutral-500">{t("dashboard.chart.platformNote")}</p>
    </div>
  );
}

export function TypeChart({ data }: ChartProps) {
  const { t } = useI18n();
  const chartData = {
    labels: data.byType.map((item) => (item.name === "unknown" ? t("tactic.unknown") : item.name)),
    datasets: [
      {
        data: data.byType.map((item) => item.value),
        backgroundColor: CHART_COLORS.sky,
        borderColor: CHART_COLORS.sky,
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 50,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        label={t("dashboard.chart.byType")}
        n={data.byType.reduce((sum, item) => sum + item.value, 0)}
        accent="bg-sky-600"
      />
      <div className="h-[260px] w-full">
        <Bar data={chartData} options={horizontalBarOptions} />
      </div>
    </div>
  );
}
