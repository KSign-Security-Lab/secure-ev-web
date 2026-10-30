"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, Square, Trash2, RefreshCw } from "lucide-react";
import trpc, { type RouterOutputs } from "~/lib/trpc";

type OperationDetailData = RouterOutputs["operations"]["get"];
type Cell = OperationDetailData["cells"][number];

interface OperationDetailProps {
  operationId: string;
  onBack: () => void;
  onDeleted: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  QUEUED: "bg-neutral-100 text-neutral-500",
  SENT: "bg-blue-100 text-blue-700 animate-pulse",
  COMPLETE: "bg-green-100 text-green-700",
  TIMEOUT: "bg-amber-100 text-amber-700",
  SKIPPED: "bg-neutral-100 text-neutral-400 line-through",
};

export const OperationDetail: React.FC<OperationDetailProps> = ({
  operationId,
  onBack,
  onDeleted,
}) => {
  const [data, setData] = useState<OperationDetailData | null>(null);
  const [selected, setSelected] = useState<Cell | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await trpc.operations.get.query({ id: operationId });
      setData(res);
      return res.operation.state;
    } catch {
      return "FINISHED";
    }
  }, [operationId]);

  // Poll while the operation is still running.
  useEffect(() => {
    let active = true;
    const tick = async () => {
      const state = await load();
      if (!active) return;
      if (state === "RUNNING") timer.current = setTimeout(tick, 2500);
    };
    void tick();
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  const setState = async (state: "RUNNING" | "PAUSED" | "FINISHED") => {
    await trpc.operations.setState.mutate({ id: operationId, state });
    await load();
  };

  const remove = async () => {
    if (!confirm("Delete this operation and its results?")) return;
    await trpc.operations.delete.mutate({ id: operationId });
    onDeleted();
  };

  if (!data) {
    return <p className="text-sm text-neutral-400 p-4">Loading…</p>;
  }

  const { operation, plan, facts, cells } = data;
  const cellFor = (paw: string, step: number) =>
    cells.find((c) => c.paw === paw && c.stepOrder === step);

  const factEntries = Object.entries(facts);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-neutral-500 hover:text-neutral-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold">{operation.name}</h2>
          <p className="text-xs text-neutral-500">
            {operation.targetPaws.length} agent{operation.targetPaws.length === 1 ? "" : "s"} ·{" "}
            {plan.length} step{plan.length === 1 ? "" : "s"}
          </p>
        </div>
        <span
          className={`ml-2 text-[11px] uppercase tracking-wider px-2 py-0.5 rounded ${
            operation.state === "RUNNING"
              ? "bg-blue-100 text-blue-700"
              : operation.state === "PAUSED"
                ? "bg-amber-100 text-amber-700"
                : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {operation.state}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => void load()} className="p-2 text-neutral-500 hover:text-neutral-800" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          {operation.state === "RUNNING" && (
            <button
              onClick={() => void setState("PAUSED")}
              className="flex items-center gap-1 text-sm px-2 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          {operation.state === "PAUSED" && (
            <button
              onClick={() => void setState("RUNNING")}
              className="flex items-center gap-1 text-sm px-2 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
          )}
          {operation.state !== "FINISHED" && (
            <button
              onClick={() => void setState("FINISHED")}
              className="flex items-center gap-1 text-sm px-2 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
          <button
            onClick={() => void remove()}
            className="flex items-center gap-1 text-sm px-2 py-1.5 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Step × agent grid */}
      <div className="overflow-x-auto border border-neutral-200 rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left">
              <th className="px-3 py-2 font-semibold text-neutral-600">Agent</th>
              {plan.map((step, idx) => (
                <th key={idx} className="px-3 py-2 font-medium text-neutral-600 whitespace-nowrap">
                  <span className="text-neutral-400 font-mono mr-1">{idx + 1}.</span>
                  {step.abilityName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {operation.targetPaws.map((paw) => (
              <tr key={paw}>
                <td className="px-3 py-2 font-mono text-xs text-neutral-700 whitespace-nowrap">{paw}</td>
                {plan.map((_, idx) => {
                  const cell = cellFor(paw, idx);
                  const status = cell?.status ?? "QUEUED";
                  return (
                    <td key={idx} className="px-3 py-2">
                      <button
                        disabled={!cell}
                        onClick={() => cell && setSelected(cell)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          STATUS_STYLE[status] ?? "bg-neutral-100 text-neutral-500"
                        } ${cell ? "hover:ring-1 hover:ring-blue-300" : "opacity-50"}`}
                      >
                        {status}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fact store */}
      {factEntries.length > 0 && (
        <div className="border border-neutral-200 rounded p-3">
          <h3 className="text-xs font-semibold text-neutral-600 mb-2">Fact store</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {factEntries.map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs">
                <span className="font-mono text-neutral-500">{key}</span>
                <span className="font-mono text-neutral-800 truncate">= {value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output viewer */}
      {selected && (
        <div className="border border-neutral-200 rounded">
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-b border-neutral-200">
            <span className="text-sm">
              <span className="font-mono text-xs text-neutral-500">{selected.paw}</span>{" "}
              · {selected.abilityName}{" "}
              <span className="text-neutral-400">({selected.executor || "—"})</span>
            </span>
            <span className="text-xs text-neutral-500">
              exit {selected.exitCode || "—"} · {selected.status}
            </span>
          </div>
          <pre className="p-3 text-xs font-mono whitespace-pre-wrap max-h-80 overflow-auto bg-neutral-900 text-neutral-100 rounded-b">
            {selected.output || selected.stderr || "(no output)"}
          </pre>
        </div>
      )}
    </div>
  );
};
