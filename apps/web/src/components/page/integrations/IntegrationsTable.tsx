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
import { display, formatDate } from "~/lib/format";

/**
 * A CONNECTED integration whose last collection is older than this is shown
 * as delayed; older than WARN_AFTER_MIN it is shown as a warning.
 * Override with NEXT_PUBLIC_INTEGRATION_STALE_MINUTES.
 */
const STALE_AFTER_MIN = Number(process.env.NEXT_PUBLIC_INTEGRATION_STALE_MINUTES) || 60;
const WARN_AFTER_MIN = 24 * 60;

type DisplayStatus = IntegrationStatus | "STALE" | "WARNING";

export function displayStatus(item: Integration, now: number): DisplayStatus {
  if (item.status !== "CONNECTED" || !item.lastSyncAt) return item.status;
  const ageMin = (now - new Date(item.lastSyncAt).getTime()) / 60_000;
  if (ageMin > WARN_AFTER_MIN) return "WARNING";
  if (ageMin > STALE_AFTER_MIN) return "STALE";
  return "CONNECTED";
}

interface IntegrationsTableProps {
  data: IntegrationsListResponse;
  isLoading?: boolean;
  onRowClick?: (item: Integration) => void;
}

// StatusBadge derives its color from these canonical status names.
const STATUS_VARIANT: Record<DisplayStatus, string> = {
  // Neutral: nothing is wrong, the product just isn't set up yet.
  PENDING: "DRAFT",
  CONNECTED: "SUCCESS",
  STALE: "MEDIUM",
  WARNING: "HIGH",
  ERROR: "ERROR",
  DISABLED: "DRAFT",
};

const STATUS_LABEL_KEY: Record<DisplayStatus, TranslationKey> = {
  PENDING: "integrations.table.statusPending",
  CONNECTED: "integrations.table.statusConnected",
  STALE: "integrations.table.statusStale",
  WARNING: "integrations.table.statusWarning",
  ERROR: "integrations.table.statusError",
  DISABLED: "integrations.table.statusDisabled",
};

const MODE_LABEL_KEY: Record<IntegrationMode, TranslationKey> = {
  API: "integrations.table.modeApi",
  AGENT: "integrations.table.modeAgent",
};

const MODE_CLASS: Record<IntegrationMode, string> = {
  API: "text-blue-700 bg-blue-50 border-blue-300",
  AGENT: "text-sky-700 bg-sky-50 border-sky-300",
};

/** Status badge shared by the table and the add-integration picker. */
export function IntegrationStatusBadge({ item, now }: { item: Integration; now: number }) {
  const { t } = useI18n();
  const status = displayStatus(item, now);
  let reason: string | undefined;
  if ((status === "STALE" || status === "WARNING") && item.lastSyncAt) {
    const hours = Math.floor((now - new Date(item.lastSyncAt).getTime()) / 3_600_000);
    reason = t("integrations.table.staleReason", {
      when: formatDate(item.lastSyncAt),
      hours,
      minutes: STALE_AFTER_MIN,
    });
  } else if (status === "ERROR" && item.lastError) {
    reason = item.lastError;
  }
  return (
    <span title={reason} className={reason ? "cursor-help" : undefined}>
      <StatusBadge status={STATUS_VARIANT[status]} label={t(STATUS_LABEL_KEY[status])} />
    </span>
  );
}

export const IntegrationsTable: React.FC<IntegrationsTableProps> = ({
  data,
  isLoading,
  onRowClick,
}) => {
  const { t } = useI18n();
  // Evaluated per render; the page refetches periodically so staleness updates.
  const [now] = React.useState(() => Date.now());
  const hasEndpoint = (data ?? []).some((item) => Boolean(item.baseUrl));
  const columns: DataTableColumn<IntegrationsListResponse[number]>[] = [
    {
      label: t("integrations.table.name"),
      className: "font-semibold text-neutral-900",
      render: (item) => item.name,
    },
    {
      label: t("integrations.table.vendor"),
      className: "text-neutral-500 font-medium",
      render: (item) => item.vendor,
    },
    {
      label: t("integrations.table.category"),
      render: (item) => (
        <span className="whitespace-nowrap text-xs font-medium text-neutral-700 bg-neutral-50 px-2.5 py-0.5 rounded border border-neutral-200 inline-flex items-center">
          {item.category}
        </span>
      ),
    },
    {
      label: t("integrations.table.mode"),
      render: (item) => (
        <span
          className={`whitespace-nowrap text-xs font-medium px-2.5 py-0.5 rounded border inline-flex items-center ${MODE_CLASS[item.mode]}`}
        >
          {t(MODE_LABEL_KEY[item.mode])}
        </span>
      ),
    },
    // Agent-mode integrations have no endpoint; hide the column when none do.
    ...(hasEndpoint
      ? [
          {
            label: t("integrations.table.endpoint"),
            className: "text-neutral-500 font-mono text-xs",
            render: (item: Integration) => display(item.baseUrl),
          },
        ]
      : []),
    {
      label: t("integrations.table.status"),
      nowrap: true,
      render: (item) => <IntegrationStatusBadge item={item} now={now} />,
    },
    {
      label: t("integrations.table.collected"),
      align: "right",
      className: "text-sm text-neutral-600",
      render: (item) => item.collectedCount.toLocaleString(),
    },
    {
      label: t("integrations.table.lastSync"),
      className: "text-neutral-500 tabular-nums text-xs",
      nowrap: true,
      render: (item) => formatDate(item.lastSyncAt),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRowClick={onRowClick}
      rowKey={(item) => item.adapterKey}
      emptyState={{
        title: t("integrations.page.empty"),
      }}
    />
  );
};
