"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronsLeftRight } from "lucide-react";
import type { RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { tacticLabel } from "~/lib/format";
import { cn } from "~/lib/utils";

type Coverage = RouterOutputs["abilities"]["coverage"];
type Technique = Coverage["matrix"][number]["techniques"][number];

/**
 * MITRE ATT&CK coverage heatmap.
 *
 * Sequential (magnitude) encoding: a single blue hue, light → dark, shaded by
 * the number of ability variants that exercise each technique. Gaps (Enterprise
 * techniques with no ability) are shown separately in neutral grey.
 */

/** Discrete steps of one blue ramp — light (few variants) to dark (many). */
function bucket(count: number): { bg: string; text: string; label: string } {
  if (count >= 11) return { bg: "bg-blue-800", text: "text-white", label: "11+" };
  if (count >= 7) return { bg: "bg-blue-600", text: "text-white", label: "7–10" };
  if (count >= 4) return { bg: "bg-blue-500", text: "text-white", label: "4–6" };
  if (count >= 2) return { bg: "bg-blue-300", text: "text-blue-950", label: "2–3" };
  return { bg: "bg-blue-100", text: "text-blue-900", label: "1" };
}

const LEGEND_STEPS = [
  { label: "1", bg: "bg-blue-100" },
  { label: "2–3", bg: "bg-blue-300" },
  { label: "4–6", bg: "bg-blue-500" },
  { label: "7–10", bg: "bg-blue-600" },
  { label: "11+", bg: "bg-blue-800" },
];

interface StatTileProps {
  label: string;
  value: string;
  hint?: React.ReactNode;
  accent?: boolean;
}
const StatTile: React.FC<StatTileProps> = ({ label, value, hint, accent }) => (
  <div
    className={`rounded-lg border p-4 ${ accent ? "border-blue-200 bg-blue-50" : "border-neutral-200 bg-white" }`}
  >
    <div className="text-xs font-semibold text-neutral-500">{label}</div>
    <div className={`mt-1 text-3xl font-semibold tabular-nums ${accent ? "text-blue-700" : "text-neutral-800"}`}>
      {value}
    </div>
    {hint && <div className="mt-0.5 text-xs text-neutral-500">{hint}</div>}
  </div>
);

/** "1 technique" / "2 techniques" — the KO string has no plural form. */
const countKey = (n: number) =>
  n === 1 ? "coverage.column.countOne" : "coverage.column.count";

/** Tracks whether a horizontal scroller has hidden content on either side. */
function useScrollEdges() {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [update]);
  return { ref, edges, update };
}

export const CoverageHeatmap: React.FC<{ data: Coverage }> = ({ data }) => {
  const { t: tr } = useI18n();
  const translate = (key: string) => tr(key as Parameters<typeof tr>[0]);
  const { summary, matrix, uncovered } = data;
  const { ref: scrollRef, edges, update: updateEdges } = useScrollEdges();
  const overflowing = edges.left || edges.right;
  const [hover, setHover] = useState<{ t: Technique; tactic: string; x: number; y: number } | null>(
    null
  );
  const [showGaps, setShowGaps] = useState(false);
  const gapsRef = useRef<HTMLDivElement>(null);
  const standardCols = matrix.filter((col) => col.standard);
  const otherCols = matrix.filter((col) => !col.standard);
  const gapCount = summary.totalTechniques - summary.coveredTechniques;

  const openGaps = () => {
    setShowGaps(true);
    requestAnimationFrame(() =>
      gapsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const renderColumn = (col: Coverage["matrix"][number]) => {
    const colLabel = tacticLabel(col.key, translate);
    return (
      <div key={col.key} className="flex w-36 shrink-0 flex-col">
        <div className="mb-1 border-b-2 border-neutral-200 pb-1">
          <div className="truncate text-xs font-semibold text-neutral-700" title={colLabel}>
            {colLabel}
          </div>
          <div className="text-xs text-neutral-500">
            {tr(countKey(col.techniques.length), { count: col.techniques.length })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {col.techniques.map((t) => {
            const b = bucket(t.count);
            return (
              <Link
                key={t.id}
                href={`/playground/abilities?q=${encodeURIComponent(t.id)}`}
                aria-label={`${t.id} ${t.name} — ${tr("coverage.tooltip.count", { tactic: colLabel, count: t.count })}`}
                onMouseEnter={(e) => setHover({ t, tactic: colLabel, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => setHover({ t, tactic: colLabel, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHover(null)}
                className={`${b.bg} ${b.text} block rounded px-1.5 py-1 text-left text-xs font-medium leading-tight transition hover:ring-2 hover:ring-blue-400 focus-visible:outline-2 focus-visible:outline-blue-500`}
              >
                <span className="block font-mono">{t.id}</span>
                <span className="block truncate opacity-90">{t.name}</span>
                <span className="block text-right font-mono opacity-80">×{t.count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label={tr("coverage.stat.coverage")}
          value={`${summary.coveragePercentage}%`}
          hint={tr("coverage.stat.coverageHint")}
          accent
        />
        <StatTile
          label={tr("coverage.stat.covered")}
          value={`${summary.coveredTechniques} / ${summary.totalTechniques}`}
          hint={
            gapCount > 0 ? (
              <button
                type="button"
                onClick={openGaps}
                className="font-medium text-blue-700 underline-offset-2 hover:underline"
              >
                {tr("coverage.stat.coveredHint", { count: gapCount })}
              </button>
            ) : undefined
          }
        />
        <StatTile label={tr("coverage.stat.abilities")} value={summary.totalAbilities.toLocaleString()} />
        <StatTile
          label={tr("coverage.stat.tactics")}
          value={`${summary.tacticsCovered} / 14`}
          hint={tr("coverage.stat.tacticsHint")}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span className="font-semibold">{tr("coverage.legend.title")}</span>
        <div className="flex items-center gap-1">
          {LEGEND_STEPS.map((step) => (
            <div key={step.label} className="flex items-center gap-1">
              <span className={`inline-block h-3.5 w-5 rounded-sm ${step.bg}`} />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3.5 w-5 rounded-sm border border-neutral-200 bg-neutral-100" />
          <span>{tr("coverage.legend.gap")}</span>
        </div>
        {overflowing && (
          <span className="ml-auto inline-flex items-center gap-1 text-neutral-500">
            <ChevronsLeftRight className="h-3.5 w-3.5" aria-hidden />
            {tr("common.scrollHint")}
          </span>
        )}
      </div>

      {/* Heatmap: tactic columns × technique cells */}
      <div className="relative">
      <div
        ref={scrollRef}
        onScroll={updateEdges}
        role="region"
        aria-label={tr("coverage.matrix.label")}
        tabIndex={0}
        className="scroll-x-visible overflow-x-auto pb-3 focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        <div className="flex gap-2" style={{ minWidth: "min-content" }}>
          {standardCols.map(renderColumn)}
        </div>
      </div>
        {/* Edge fades signal that the matrix continues off-screen. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-neutral-100 to-transparent transition-opacity",
            edges.left ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-neutral-100 to-transparent transition-opacity",
            edges.right ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Buckets outside the Enterprise matrix (multi-tactic rows, ICS, plugin groups) */}
      {otherCols.length > 0 && (
        <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">{tr("coverage.other.title")}</h3>
            <p className="text-xs text-neutral-500">{tr("coverage.other.desc")}</p>
          </div>
          <div className="flex flex-wrap gap-2">{otherCols.map(renderColumn)}</div>
        </section>
      )}

      {/* Gaps */}
      {uncovered.length > 0 && (
        <div ref={gapsRef} className="scroll-mt-24 rounded-lg border border-neutral-200 bg-white p-4">
          <button
            type="button"
            aria-expanded={showGaps}
            onClick={() => setShowGaps((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-neutral-700">
              {tr("coverage.gaps.title", { count: uncovered.length })}
            </span>
            <span className="text-xs text-blue-600">
              {showGaps ? tr("coverage.gaps.hide") : tr("coverage.gaps.show")}
            </span>
          </button>
          {showGaps && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {uncovered.map((tech) => (
                <span
                  key={tech.id}
                  title={tech.name}
                  className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                >
                  <span className="font-mono">{tech.id}</span> {tech.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hover tooltip */}
      {hover && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-md bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
        >
          <div className="font-mono text-blue-300">{hover.t.id}</div>
          <div className="font-semibold">{hover.t.name}</div>
          <div className="mt-1 text-neutral-300">
            {tr("coverage.tooltip.count", { tactic: hover.tactic, count: hover.t.count })}
          </div>
        </div>
      )}
    </div>
  );
};
