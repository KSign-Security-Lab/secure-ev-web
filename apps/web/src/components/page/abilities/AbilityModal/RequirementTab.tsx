"use client";

import React, { useEffect, useState } from "react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";

type Preview = RouterOutputs["operations"]["previewFacts"];

/** Real requirements, derived from the command: #{fact} placeholders and payload files. */
export const RequirementTab = ({ abilityId }: { abilityId: string }) => {
  const { t } = useI18n();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    trpc.operations.previewFacts
      .query({ abilityIds: [abilityId] })
      .then((res) => active && setPreview(res))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [abilityId]);

  if (failed) return <p className="text-sm text-rose-600">{t("abilities.requirement.failed")}</p>;
  if (!preview) return <p className="text-sm text-neutral-500">{t("abilities.requirement.loading")}</p>;

  const view = preview.abilities[0];
  const placeholders = view?.found ? view.placeholders : [];
  const payloads = view?.found ? view.payloads : [];
  const required = new Set(preview.requiredFacts);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-neutral-800">{t("abilities.requirement.facts")}</h3>
        {placeholders.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("abilities.requirement.factsEmpty")}</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
            {placeholders.map((fact) => (
              <li key={fact} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <code className="font-mono text-neutral-800">{`#{${fact}}`}</code>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-medium",
                    required.has(fact) ? "bg-amber-50 text-amber-700" : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {required.has(fact) ? t("abilities.requirement.required") : t("abilities.requirement.derived")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-neutral-800">{t("abilities.requirement.payloads")}</h3>
        {payloads.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("abilities.requirement.payloadsEmpty")}</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
            {payloads.map((p) => (
              <li key={p.name} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <code className="min-w-0 truncate font-mono text-neutral-800">{p.name}</code>
                <span
                  className={cn(
                    "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
                    p.available === true
                      ? "bg-green-50 text-green-700"
                      : p.available === false
                        ? "bg-rose-50 text-rose-700"
                        : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {p.available === true
                    ? t("abilities.requirement.available")
                    : p.available === false
                      ? t("abilities.requirement.missing")
                      : t("abilities.requirement.unknown")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
