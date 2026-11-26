"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, Play } from "lucide-react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { Modal } from "~/components/common/Modal/Modal";
import { ModalButton } from "~/components/common/Modal/ModalButton";
import { EmptyState } from "~/components/common/EmptyState/EmptyState";
import { useI18n } from "~/i18n/I18nProvider";
import { display, formatDate, platformLabel, tacticLabel } from "~/lib/format";

type AssessmentDetail = RouterOutputs["assessments"]["get"];

interface AssessmentDetailModalProps {
  assessmentId: string | null;
  open: boolean;
  onClose: () => void;
}

export function AssessmentDetailModal({ assessmentId, open, onClose }: AssessmentDetailModalProps) {
  const { t } = useI18n();
  const translate = (key: string) => t(key as Parameters<typeof t>[0]);
  const [data, setData] = useState<AssessmentDetail | null>(null);

  useEffect(() => {
    if (!open || !assessmentId) return;
    let active = true;
    trpc.assessments.get
      .query({ id: assessmentId })
      .then((res) => active && setData(res))
      .catch(() => active && setData(null));
    return () => {
      active = false;
    };
  }, [open, assessmentId]);

  const current = data && data.id === assessmentId ? data : null;

  const summary = current
    ? [
        { label: t("assessment.detail.summary.target"), value: display(current.target) },
        { label: t("assessment.detail.summary.attacks"), value: current.abilities.length.toLocaleString() },
        { label: t("assessment.detail.summary.repeat"), value: current.repeatCount.toLocaleString() },
        {
          label: t("assessment.detail.summary.lastRun"),
          value: current.lastRunAt ? formatDate(current.lastRunAt) : t("assessment.table.notYet"),
        },
      ]
    : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={current?.name ?? t("assessment.detail.loading")}
      className="lg:max-w-[960px]"
      bodyClassName="h-[min(64vh,620px)]"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            {t("assessment.detail.close")}
          </ModalButton>
          {current && (
            <Link
              href={`/playground/operations?assessment=${current.id}`}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
              {t("assessment.detail.run")}
            </Link>
          )}
        </>
      }
    >
      {!current ? (
        <p className="text-sm text-neutral-500">{t("assessment.detail.loading")}</p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <dt className="text-xs font-medium text-neutral-500">{item.label}</dt>
                <dd className="mt-1 truncate text-base font-semibold tabular-nums text-neutral-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-800">{t("assessment.detail.abilities")}</h3>
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs text-neutral-600">
                  <tr>
                    <th className="w-10 px-3 py-2 text-right font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">{t("abilities.table.abilityName")}</th>
                    <th className="px-3 py-2 font-semibold">{t("abilities.table.tactics")}</th>
                    <th className="px-3 py-2 font-semibold">{t("abilities.table.techniqueId")}</th>
                    <th className="px-3 py-2 font-semibold">{t("abilities.executors.platform")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {current.abilities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                        {t("assessment.form.abilitiesEmpty")}
                      </td>
                    </tr>
                  )}
                  {current.abilities.map(({ id, ability }, idx) => (
                    <tr key={id}>
                      <td className="px-3 py-2 text-right tabular-nums text-neutral-400">{idx + 1}</td>
                      {ability ? (
                        <>
                          <td className="px-3 py-2 text-neutral-900">{ability.ability_name}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-neutral-600">
                            {tacticLabel(ability.tactic, translate)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-neutral-600">
                            {display(ability.technique_id)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-neutral-600">
                            {platformLabel(ability.platform)}
                          </td>
                        </>
                      ) : (
                        <td colSpan={4} className="px-3 py-2 text-neutral-400">
                          <span className="font-mono text-xs">{id}</span> · {t("assessment.detail.missingAbility")}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-800">{t("assessment.detail.history")}</h3>
            <EmptyState
              size="sm"
              icon={History}
              title={t("assessment.detail.historyEmpty")}
              description={t("assessment.detail.historyEmptyDesc")}
              action={
                <Link
                  href="/playground/operations"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
                >
                  {t("assessment.detail.viewOperations")}
                </Link>
              }
            />
          </section>
        </>
      )}
    </Modal>
  );
}
