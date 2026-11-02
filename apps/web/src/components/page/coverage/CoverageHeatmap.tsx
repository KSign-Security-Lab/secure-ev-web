"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { RouterOutputs } from "~/lib/trpc";

type Coverage = RouterOutputs["abilities"]["coverage"];
type Technique = Coverage["matrix"][number]["techniques"][number];
type Filter = "all" | "covered" | "gaps";

/**
 * Full Enterprise MITRE ATT&CK matrix, Navigator-style.
 *
 * Every tactic column lists every technique under it. Covered cells use a
 * single blue ramp shaded by ability count (sequential encoding); techniques
 * with no ability are neutral grey, so gaps read in place next to coverage.
 * Each technique expands to its sub-techniques, shaded the same way.
 */

/** Discrete steps of one blue ramp — light (few abilities) to dark (many). */
function bucket(count: number): { bg: string; text: string } {
  if (count === 0) return { bg: "bg-neutral-100", text: "text-neutral-400" };
  if (count >= 11) return { bg: "bg-blue-800", text: "text-white" };
  if (count >= 7) return { bg: "bg-blue-600", text: "text-white" };
  if (count >= 4) return { bg: "bg-blue-500", text: "text-white" };
  if (count >= 2) return { bg: "bg-blue-300", text: "text-blue-950" };
  return { bg: "bg-blue-100", text: "text-blue-900" };
}

const LEGEND_STEPS = [
  { label: "0 (gap)", bg: "bg-neutral-100 border border-neutral-200" },
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

interface HoverState {
  id: string;
  name: string;
  count: number;
  detail: string;
  x: number;
  y: number;
}

export const CoverageHeatmap: React.FC<{ data: Coverage }> = ({ data }) => {
  const { summary, matrix } = data;
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<HoverState | null>(null);

  const allIds = useMemo(
    () => matrix.flatMap((col) => col.techniques.filter((t) => t.subs.length > 0).map((t) => t.id)),
    [matrix]
  );
  const allExpanded = allIds.length > 0 && allIds.every((id) => expanded.has(id));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visible = (t: Technique) =>
    filter === "all" || (filter === "covered" ? t.count > 0 : t.count === 0 || t.subsCovered < t.subs.length);

  const track =
    (h: Omit<HoverState, "x" | "y">) =>
    (e: React.MouseEvent) =>
      setHover({ ...h, x: e.clientX, y: e.clientY });

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Technique coverage"
          value={`${summary.techniques.percentage}%`}
          hint={`${summary.techniques.covered} / ${summary.techniques.total} techniques`}
          accent
        />
        <StatTile
          label="Sub-technique coverage"
          value={`${summary.subtechniques.percentage}%`}
          hint={`${summary.subtechniques.covered} / ${summary.subtechniques.total} sub-techniques`}
          accent
        />
        <StatTile
          label="Abilities on matrix"
          value={summary.enterpriseAbilities.toLocaleString()}
          hint={`of ${summary.totalAbilities.toLocaleString()} · ${summary.otherAbilities} untagged/ICS/other`}
        />
        <StatTile
          label="Tactics covered"
          value={`${summary.tactics.covered} / ${summary.tactics.total}`}
          hint="Enterprise tactics"
        />
      </div>

      {/* Controls + legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span className="font-semibold">Abilities per technique:</span>
          {LEGEND_STEPS.map((step) => (
            <div key={step.label} className="flex items-center gap-1">
              <span className={`inline-block h-3.5 w-5 rounded-sm ${step.bg}`} />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex overflow-hidden rounded-md border border-neutral-200">
            {(
              [
                ["all", "All"],
                ["covered", "Covered"],
                ["gaps", "Gaps"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 ${
                  filter === value ? "bg-blue-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setExpanded(allExpanded ? new Set() : new Set(allIds))}
            className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-neutral-600 hover:bg-neutral-50"
          >
            {allExpanded ? "Collapse sub-techniques" : "Expand sub-techniques"}
          </button>
        </div>
      </div>

      {/* Matrix: tactic columns × technique cells */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2" style={{ minWidth: "min-content" }}>
          {matrix.map((col) => (
            <div key={col.key} className="flex w-40 shrink-0 flex-col">
              <div className="mb-1 border-b-2 border-neutral-200 pb-1">
                <div className="truncate text-xs font-semibold text-neutral-700" title={col.label}>
                  {col.label}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {col.covered} / {col.techniques.length} techniques
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {col.techniques.filter(visible).map((t) => {
                  const b = bucket(t.count);
                  const open = expanded.has(t.id);
                  const hasSubs = t.subs.length > 0;
                  return (
                    <div key={t.id} className="flex flex-col gap-0.5">
                      <div
                        onMouseEnter={track({
                          id: t.id,
                          name: t.name,
                          count: t.count,
                          detail: hasSubs
                            ? `${t.direct} on technique · ${t.subsCovered}/${t.subs.length} sub-techniques covered`
                            : "no sub-techniques",
                        })}
                        onMouseMove={track({
                          id: t.id,
                          name: t.name,
                          count: t.count,
                          detail: hasSubs
                            ? `${t.direct} on technique · ${t.subsCovered}/${t.subs.length} sub-techniques covered`
                            : "no sub-techniques",
                        })}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => hasSubs && toggle(t.id)}
                        className={`${b.bg} ${b.text} ${
                          hasSubs ? "cursor-pointer" : ""
                        } rounded px-1.5 py-1 text-[10px] font-medium leading-tight transition hover:ring-2 hover:ring-blue-400`}
                      >
                        <span className="line-clamp-2" title={t.name}>
                          {t.name}
                        </span>
                        <span className="mt-0.5 flex items-center justify-between font-mono opacity-80">
                          <span className="flex items-center">
                            {hasSubs &&
                              (open ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              ))}
                            {t.id}
                          </span>
                          <span>
                            {hasSubs && `${t.subsCovered}/${t.subs.length} · `}×{t.count}
                          </span>
                        </span>
                      </div>
                      {open &&
                        t.subs.map((sub) => {
                          const sb = bucket(sub.count);
                          return (
                            <div
                              key={sub.id}
                              onMouseEnter={track({
                                id: sub.id,
                                name: `${t.name}: ${sub.name}`,
                                count: sub.count,
                                detail: "sub-technique",
                              })}
                              onMouseMove={track({
                                id: sub.id,
                                name: `${t.name}: ${sub.name}`,
                                count: sub.count,
                                detail: "sub-technique",
                              })}
                              onMouseLeave={() => setHover(null)}
                              className={`${sb.bg} ${sb.text} ml-2 rounded px-1.5 py-0.5 text-[10px] leading-tight`}
                            >
                              <span className="line-clamp-2" title={sub.name}>
                                {sub.name}
                              </span>
                              <span className="flex justify-between font-mono opacity-80">
                                <span>{sub.id}</span>
                                <span>×{sub.count}</span>
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {hover && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-md bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
        >
          <div className="font-mono text-blue-300">{hover.id}</div>
          <div className="font-semibold">{hover.name}</div>
          <div className="mt-1 text-neutral-300">
            {hover.count === 0 ? "No abilities (gap)" : `${hover.count} abilit${hover.count === 1 ? "y" : "ies"}`}
            {" · "}
            {hover.detail}
          </div>
        </div>
      )}
    </div>
  );
};
