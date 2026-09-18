"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Plug, Plus, ShieldCheck } from "lucide-react";
import { IntegrationsTable } from "~/components/page/integrations/IntegrationsTable";
import { IntegrationModal } from "~/components/page/integrations/IntegrationModal";
import { AddIntegrationModal } from "~/components/page/integrations/AddIntegrationModal";
import { Button } from "~/components/ui/button";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { StatsCard } from "~/components/dashboard/StatsCard";

export type IntegrationsListResponse = RouterOutputs["integrations"]["list"];
export type Integration = IntegrationsListResponse[number];
export type IntegrationMode = Integration["mode"];
export type IntegrationStatus = Integration["status"];

export default function Integrations() {
  const { t } = useI18n();
  const [data, setData] = useState<IntegrationsListResponse | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Integration | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await trpc.integrations.list.query();
      setData(response);
      // Keep the open modal in step with the refreshed row.
      setSelected((current) =>
        current
          ? (response.find((item) => item.adapterKey === current.adapterKey) ??
            current)
          : current
      );
    } catch {
      setData(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const integrations = data || [];
  const connectedCount = integrations.filter(
    (item) => item.status === "CONNECTED"
  ).length;
  const collectedCount = integrations.reduce(
    (sum, item) => sum + item.collectedCount,
    0
  );

  return (
    <div className="flex flex-col w-full gap-4">
      <PageHeader
        title={t("integrations.page.title")}
        subtitle={t("integrations.page.subtitle")}
        badge="Playground"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("integrations.page.add")}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title={t("integrations.stats.total")}
          value={integrations.length}
          description={t("integrations.stats.totalDescription")}
          icon={Plug}
          variant="primary"
        />
        <StatsCard
          title={t("integrations.stats.connected")}
          value={connectedCount}
          description={t("integrations.stats.connectedDescription")}
          icon={ShieldCheck}
          variant="success"
        />
        <StatsCard
          title={t("integrations.stats.collected")}
          value={collectedCount}
          description={t("integrations.stats.collectedDescription")}
          icon={Database}
          variant="accent"
        />
      </div>

      <div className="flex flex-col flex-1 space-y-6 min-h-0 min-w-0">
        <IntegrationsTable
          data={integrations}
          isLoading={isLoading}
          onRowClick={(item) => setSelected(item)}
        />
      </div>

      <AddIntegrationModal
        open={addOpen}
        integrations={integrations}
        onClose={() => setAddOpen(false)}
        onPick={(integration) => {
          setSelected(integration);
        }}
      />

      <IntegrationModal
        integration={selected}
        onClose={() => setSelected(null)}
        onChanged={fetchData}
      />
    </div>
  );
}
