"use client";

import React, { useState } from "react";
import type { RouterOutputs } from "~/lib/trpc";

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
  hint?: string;
  accent?: boolean;
}
const StatTile: React.FC<StatTileProps> = ({ label, value, hint, accent }) => (
  <div
    className={`rounded-lg border p-4 ${
      accent ? "border-blue-200 bg-blue-50" : "border-neutral-200 bg-white"
    }`}
  >
    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</div>
    <div className={`mt-1 text-3xl font-bold ${accent ? "text-blue-700" : "text-neutral-800"}`}>
      {value}
    </div>
    {hint && <div className="mt-0.5 text-xs text-neutral-400">{hint}</div>}
  </div>
);

export const CoverageHeatmap: React.FC<{ data: Coverage }> = ({ data }) => {
  const { summary, matrix, uncovered } = data;
  const [hover, setHover] = useState<{ t: Technique; tactic: string; x: number; y: number } | null>(
    null
  );
  const [showGaps, setShowGaps] = useState(false);

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="ATT&CK Coverage"
          value={`${summary.coveragePercentage}%`}
          hint="Enterprise techniques"
          accent
        />
        <StatTile
          label="Techniques covered"
          value={`${summary.coveredTechniques} / ${summary.totalTechniques}`}
          hint={`${summary.totalTechniques - summary.coveredTechniques} gaps`}
        />
        <StatTile label="Ability variants" value={summary.totalAbilities.toLocaleString()} />
        <StatTile label="Tactics covered" value={`${summary.tacticsCovered} / 14`} hint="Enterprise tactics" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span className="font-semibold">Ability variants per technique:</span>
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
          <span>no coverage (gap)</span>
        </div>
      </div>

      {/* Heatmap: tactic columns × technique cells */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2" style={{ minWidth: "min-content" }}>
          {matrix.map((col) => (
            <div key={col.key} className="flex w-36 shrink-0 flex-col">
              <div className="mb-1 border-b-2 border-neutral-200 pb-1">
                <div className="truncate text-xs font-semibold text-neutral-700" title={col.label}>
                  {col.label}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {col.techniques.length} technique{col.techniques.length === 1 ? "" : "s"}
                  {!col.standard && " · non-ATT&CK"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {col.techniques.map((t) => {
                  const b = bucket(t.count);
                  return (
                    <button
                      key={t.id}
                      onMouseEnter={(e) =>
                        setHover({ t, tactic: col.label, x: e.clientX, y: e.clientY })
                      }
                      onMouseMove={(e) =>
                        setHover({ t, tactic: col.label, x: e.clientX, y: e.clientY })
                      }
                      onMouseLeave={() => setHover(null)}
                      className={`${b.bg} ${b.text} rounded px-1.5 py-1 text-left text-[10px] font-medium leading-tight transition hover:ring-2 hover:ring-blue-400`}
                    >
                      <span className="block font-mono">{t.id}</span>
                      <span className="block truncate opacity-90" title={t.name}>
                        {t.name}
                      </span>
                      <span className="block text-right font-mono opacity-80">×{t.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gaps */}
      {uncovered.length > 0 && (
        <div className="rounded-lg border border-neutral-200 p-4">
          <button
            onClick={() => setShowGaps((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-neutral-700">
              Coverage gaps — {uncovered.length} Enterprise techniques with no ability
            </span>
            <span className="text-xs text-blue-600">{showGaps ? "Hide" : "Show"}</span>
          </button>
          {showGaps && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {uncovered.map((tech) => (
                <span
                  key={tech.id}
                  title={tech.name}
                  className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500"
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
            {hover.tactic} · {hover.t.count} ability variant{hover.t.count === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
};
