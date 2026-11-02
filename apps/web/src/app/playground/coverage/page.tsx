"use client";

import React, { useEffect, useState } from "react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { CoverageHeatmap } from "~/components/page/coverage/CoverageHeatmap";

type Coverage = RouterOutputs["abilities"]["coverage"];

export default function CoveragePage() {
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
        title="MITRE ATT&CK Coverage"
        subtitle="The full Enterprise ATT&CK matrix: every technique and sub-technique, shaded by how many abilities exercise it."
        badge="Playground"
      />
      {loading ? (
        <p className="p-6 text-sm text-neutral-400">Computing coverage…</p>
      ) : data ? (
        <CoverageHeatmap data={data} />
      ) : (
        <p className="p-6 text-sm text-rose-500">Could not load coverage data.</p>
      )}
    </div>
  );
}
