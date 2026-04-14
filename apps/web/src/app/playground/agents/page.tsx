"use client";

import { useState, useEffect } from "react";
import { AgentsTable } from "~/components/page/agents/AgentsTable";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";

export type AgentsListResponse = RouterOutputs["agents"]["list"];

export default function Agents() {
  const { t } = useI18n();
  const [data, setData] = useState<AgentsListResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await trpc.agents.list.query();

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setData(undefined);
        }
      } finally {
        if (!cancelled) {
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col w-full gap-4">
      <PageHeader 
        title={t("agents.page.title")}
        subtitle={t("agents.page.subtitle")}
        badge="Playground"
      />

      <div className="flex flex-col flex-1 space-y-6 min-h-0 min-w-0">
        <AgentsTable data={data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
