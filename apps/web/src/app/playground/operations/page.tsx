"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Crosshair, Plus } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { EmptyState } from "~/components/common/EmptyState/EmptyState";
import { formatDate } from "~/lib/format";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { OperationBuilder, type BuilderPreset } from "~/components/page/operations/OperationBuilder";
import { OperationDetail } from "~/components/page/operations/OperationDetail";

type OperationSummary = RouterOutputs["operations"]["list"][number];

const STATE_STYLE: Record<string, string> = {
  RUNNING: "bg-blue-100 text-blue-700",
  PAUSED: "bg-amber-100 text-amber-700",
  FINISHED: "bg-neutral-100 text-neutral-600",
};

function OperationsInner() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();

  // Opened from the Abilities page "Run" button: ?ability=<id>&name=&platform=
  const abilityParam = params.get("ability");
  // Opened from an assessment plan: ?assessment=<id>
  const assessmentParam = params.get("assessment");

  const [operations, setOperations] = useState<OperationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(() => Boolean(abilityParam));
  const [initialPlan, setInitialPlan] = useState<BuilderPreset | null>(() =>
    abilityParam
      ? {
          name: t("operations.builder.runName", { name: params.get("name") ?? abilityParam }),
          abilities: [
            {
              abilityId: abilityParam,
              abilityName: params.get("name") ?? abilityParam,
              platform: params.get("platform") ?? "",
            },
          ],
        }
      : null
  );
  // Assessment that seeded the builder; its lastRunAt is stamped on launch.
  const [sourceAssessment, setSourceAssessment] = useState<string | null>(null);

  // Load an assessment plan into the builder.
  useEffect(() => {
    if (!assessmentParam) return;
    let active = true;
    trpc.assessments.get
      .query({ id: assessmentParam })
      .then((plan) => {
        if (!active) return;
        setInitialPlan({
          name: plan.name,
          abilities: plan.abilities.flatMap(({ ability }) =>
            ability
              ? [{ abilityId: ability.ability_id, abilityName: ability.ability_name, platform: ability.platform }]
              : []
          ),
          paws: plan.agentPaws,
        });
        setSourceAssessment(plan.id);
        setBuilderOpen(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [assessmentParam]);

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
    if (abilityParam || assessmentParam) router.replace("/playground/operations");
  }, [abilityParam, assessmentParam, router]);

  const openBlankBuilder = () => {
    setInitialPlan(null);
    setSourceAssessment(null);
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
        title={t("operations.page.title")}
        subtitle={t("operations.page.subtitle")}
        badge={t("common.badge.playground")}
        actions={
          <button
            onClick={openBlankBuilder}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("operations.page.new")}
          </button>
        }
      />

      {operations.length === 0 ? (
        <EmptyState
          icon={Crosshair}
          title={t("operations.empty.title")}
          description={t("operations.empty.description")}
          action={
            <button
              type="button"
              onClick={openBlankBuilder}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              {t("operations.page.new")}
            </button>
          }
        />
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-neutral-600">{t("operations.table.name")}</th>
                <th className="px-4 py-2.5 font-semibold text-neutral-600">{t("operations.table.state")}</th>
                <th className="px-4 py-2.5 text-right font-semibold text-neutral-600">{t("operations.table.agents")}</th>
                <th className="px-4 py-2.5 text-right font-semibold text-neutral-600">{t("operations.table.steps")}</th>
                <th className="px-4 py-2.5 text-right font-semibold text-neutral-600">{t("operations.table.progress")}</th>
                <th className="px-4 py-2.5 font-semibold text-neutral-600">{t("operations.table.created")}</th>
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
                      className={`whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded ${ STATE_STYLE[op.state] ?? "bg-neutral-100 text-neutral-600" }`}
                    >
                      {t(`operations.state.${op.state}` as "operations.state.RUNNING")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-neutral-600">{op.agentCount}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-neutral-600">{op.stepCount}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-neutral-600">
                    {op.total > 0 ? `${op.completed}/${op.total}` : "—"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap tabular-nums text-neutral-500 text-xs">
                    {formatDate(op.createdAt)}
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
        initialPlan={initialPlan}
        onCreated={(id) => {
          if (sourceAssessment) {
            void trpc.assessments.markRun.mutate({ id: sourceAssessment }).catch(() => undefined);
            setSourceAssessment(null);
          }
          setBuilderOpen(false);
          void refresh();
          setSelectedId(id);
        }}
      />
    </div>
  );
}

function LoadingFallback() {
  const { t } = useI18n();
  return <p className="text-sm text-neutral-400 p-4">{t("operations.page.loading")}</p>;
}

export default function OperationsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OperationsInner />
    </Suspense>
  );
}
