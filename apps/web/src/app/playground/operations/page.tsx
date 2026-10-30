"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Crosshair, Plus } from "lucide-react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { OperationBuilder } from "~/components/page/operations/OperationBuilder";
import { OperationDetail } from "~/components/page/operations/OperationDetail";

type OperationSummary = RouterOutputs["operations"]["list"][number];

const STATE_STYLE: Record<string, string> = {
  RUNNING: "bg-blue-100 text-blue-700",
  PAUSED: "bg-amber-100 text-amber-700",
  FINISHED: "bg-neutral-100 text-neutral-600",
};

function OperationsInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Opened from the Abilities page "Run" button: ?ability=<id>&name=&platform=
  const abilityParam = params.get("ability");

  const [operations, setOperations] = useState<OperationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(() => Boolean(abilityParam));
  const [initialAbility, setInitialAbility] = useState<
    { abilityId: string; abilityName: string; platform: string } | null
  >(() =>
    abilityParam
      ? {
          abilityId: abilityParam,
          abilityName: params.get("name") ?? abilityParam,
          platform: params.get("platform") ?? "",
        }
      : null
  );

  const refresh = useCallback(async () => {
    try {
      setOperations(await trpc.operations.list.query());
    } catch {
      setOperations([]);
    }
  }, []);

  // Initial load (async, so no synchronous setState inside the effect).
  useEffect(() => {
    let active = true;
    trpc.operations.list
      .query()
      .then((res) => active && setOperations(res))
      .catch(() => active && setOperations([]));
    return () => {
      active = false;
    };
  }, []);

  // Drop the query string once consumed, so a refresh doesn't reopen the builder.
  useEffect(() => {
    if (abilityParam) router.replace("/playground/operations");
  }, [abilityParam, router]);

  const openBlankBuilder = () => {
    setInitialAbility(null);
    setBuilderOpen(true);
  };

  if (selectedId) {
    return (
      <div className="w-full">
        <OperationDetail
          operationId={selectedId}
          onBack={() => {
            setSelectedId(null);
            void refresh();
          }}
          onDeleted={() => {
            setSelectedId(null);
            void refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="Operations"
        subtitle="Run ordered sequences of abilities across your agents."
        badge="Playground"
        actions={
          <button
            onClick={openBlankBuilder}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Operation
          </button>
        }
      />

      {operations.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-lg p-10 text-center text-neutral-400">
          <Crosshair className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No operations yet. Launch one to task abilities to your agents.</p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-2 font-semibold text-neutral-600">Name</th>
                <th className="px-4 py-2 font-semibold text-neutral-600">State</th>
                <th className="px-4 py-2 font-semibold text-neutral-600">Agents</th>
                <th className="px-4 py-2 font-semibold text-neutral-600">Steps</th>
                <th className="px-4 py-2 font-semibold text-neutral-600">Progress</th>
                <th className="px-4 py-2 font-semibold text-neutral-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {operations.map((op) => (
                <tr
                  key={op.id}
                  onClick={() => setSelectedId(op.id)}
                  className="cursor-pointer hover:bg-blue-50/50"
                >
                  <td className="px-4 py-2 font-medium text-blue-700">{op.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded ${
                        STATE_STYLE[op.state] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {op.state}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{op.agentCount}</td>
                  <td className="px-4 py-2 text-neutral-600">{op.stepCount}</td>
                  <td className="px-4 py-2 text-neutral-600">
                    {op.total > 0 ? `${op.completed}/${op.total}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-neutral-500 text-xs">
                    {new Date(op.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OperationBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        initialAbility={initialAbility}
        onCreated={(id) => {
          setBuilderOpen(false);
          void refresh();
          setSelectedId(id);
        }}
      />
    </div>
  );
}

export default function OperationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-400 p-4">Loading…</p>}>
      <OperationsInner />
    </Suspense>
  );
}
