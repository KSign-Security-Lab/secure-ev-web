import React from "react";
import {
  Integration,
  IntegrationsListResponse,
  IntegrationMode,
  IntegrationStatus,
} from "~/app/playground/integrations/page";
import {
  DataTable,
  type DataTableColumn,
} from "~/components/common/DataTable/DataTable";
import { StatusBadge } from "~/components/common/StatusBadge/StatusBadge";
import { useI18n } from "~/i18n/I18nProvider";
import type { TranslationKey } from "~/i18n/messages";

interface IntegrationsTableProps {
  data: IntegrationsListResponse;
  isLoading?: boolean;
  onRowClick?: (item: Integration) => void;
}

// StatusBadge derives its color from these canonical status names.
const STATUS_VARIANT: Record<IntegrationStatus, string> = {
  PENDING: "PENDING",
  CONNECTED: "SUCCESS",
  ERROR: "ERROR",
  DISABLED: "DRAFT",
};

const STATUS_LABEL_KEY: Record<IntegrationStatus, TranslationKey> = {
  PENDING: "integrations.table.statusPending",
  CONNECTED: "integrations.table.statusConnected",
  ERROR: "integrations.table.statusError",
  DISABLED: "integrations.table.statusDisabled",
};

const MODE_LABEL_KEY: Record<IntegrationMode, TranslationKey> = {
  API: "integrations.table.modeApi",
  AGENT: "integrations.table.modeAgent",
};

const MODE_CLASS: Record<IntegrationMode, string> = {
  API: "text-blue-400/80 bg-blue-400/5 border-blue-400/10",
  AGENT: "text-cyan-400/80 bg-cyan-400/5 border-cyan-400/10",
};

export const IntegrationsTable: React.FC<IntegrationsTableProps> = ({
  data,
  isLoading,
  onRowClick,
}) => {
  const { t } = useI18n();
  const columns: DataTableColumn<IntegrationsListResponse[number]>[] = [
    {
      label: t("integrations.table.name"),
      className: "font-bold text-slate-200",
      render: (item) => item.name,
    },
    {
      label: t("integrations.table.vendor"),
      className: "text-slate-400 font-medium",
      render: (item) => item.vendor,
    },
    {
      label: t("integrations.table.category"),
      render: (item) => (
        <span className="uppercase text-[10px] font-black tracking-widest text-slate-300 bg-slate-400/5 px-3 py-1 rounded border border-slate-400/10 inline-flex items-center">
          {item.category}
        </span>
      ),
    },
    {
      label: t("integrations.table.mode"),
      render: (item) => (
        <span
          className={`uppercase text-[10px] font-black tracking-widest px-3 py-1 rounded border inline-flex items-center ${MODE_CLASS[item.mode]}`}
        >
          {t(MODE_LABEL_KEY[item.mode])}
        </span>
      ),
    },
    {
      label: t("integrations.table.endpoint"),
      className: "text-slate-400 font-mono text-xs",
      render: (item) => item.baseUrl || t("integrations.table.noEndpoint"),
    },
    {
      label: t("integrations.table.status"),
      render: (item) => (
        <StatusBadge
          status={STATUS_VARIANT[item.status]}
          label={t(STATUS_LABEL_KEY[item.status])}
        />
      ),
    },
    {
      label: t("integrations.table.collected"),
      className: "font-mono text-xs text-slate-400 tabular-nums",
      render: (item) => item.collectedCount.toLocaleString(),
    },
    {
      label: t("integrations.table.lastSync"),
      className: "text-slate-500 tabular-nums italic text-xs",
      render: (item) =>
        item.lastSyncAt
          ? item.lastSyncAt.replace("T", " ").slice(0, 19)
          : t("integrations.table.neverSynced"),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRowClick={onRowClick}
      emptyState={{
        title: t("integrations.page.empty"),
      }}
    />
  );
};
