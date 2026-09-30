"use client";

import { useState, useEffect, useCallback } from "react";
import { Rocket } from "lucide-react";
import { AgentsTable } from "~/components/page/agents/AgentsTable";
import { DeployAgentModal } from "~/components/page/agents/DeployAgentModal";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";

export type AgentsListResponse = RouterOutputs["agents"]["list"];

export default function Agents() {
  const { t } = useI18n();
  const [data, setData] = useState<AgentsListResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeployOpen, setIsDeployOpen] = useState<boolean>(false);

  const fetchAgents = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await trpc.agents.list.query();
      setData(response);
    } catch {
      if (!silent) setData(undefined);
    } finally {
      if (!silent) {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    }
  }, []);

  useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  return (
    <div className="flex flex-col w-full gap-4">
      <PageHeader
        title={t("agents.page.title")}
        subtitle={t("agents.page.subtitle")}
        badge="Playground"
        actions={
          <button
            onClick={() => setIsDeployOpen(true)}
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <Rocket className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            {t("agents.page.deploy")}
          </button>
        }
      />

      <div className="flex flex-col flex-1 space-y-6 min-h-0 min-w-0">
        <AgentsTable data={data || []} isLoading={isLoading} />
      </div>

      <DeployAgentModal
        open={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        onAgentDeployed={() => fetchAgents({ silent: true })}
      />
    </div>
  );
}
