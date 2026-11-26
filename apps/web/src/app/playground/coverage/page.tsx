"use client";

import React, { useEffect, useState } from "react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { CoverageHeatmap } from "~/components/page/coverage/CoverageHeatmap";
import { useI18n } from "~/i18n/I18nProvider";

type Coverage = RouterOutputs["abilities"]["coverage"];

export default function CoveragePage() {
  const { t } = useI18n();
  const [data, setData] = useState<Coverage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    trpc.abilities.coverage
      .query()
      .then((res) => active && setData(res))
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title={t("coverage.page.title")}
        subtitle={t("coverage.page.subtitle")}
        badge={t("common.badge.playground")}
      />
      {loading ? (
        <p className="p-6 text-sm text-neutral-400">{t("coverage.page.loading")}</p>
      ) : data ? (
        <CoverageHeatmap data={data} />
      ) : (
        <p className="p-6 text-sm text-rose-500">{t("coverage.page.error")}</p>
      )}
    </div>
  );
}
