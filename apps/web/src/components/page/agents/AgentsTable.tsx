import React from "react";
import { AgentsListResponse } from "~/app/playground/agents/page";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import { StatusBadge } from "~/components/common/StatusBadge/StatusBadge";
import { useI18n } from "~/i18n/I18nProvider";

interface AgentsTableProps {
  data: AgentsListResponse;
  isLoading?: boolean;
}

export const AgentsTable: React.FC<AgentsTableProps> = ({ data, isLoading }) => {
  const { t } = useI18n();
  const columns: DataTableColumn<AgentsListResponse[number]>[] = [
    {
      label: t("agents.table.idPaw"),
      className: "font-mono text-xs text-slate-400 font-bold",
      render: (item) => item.paw,
    },
    {
      label: t("agents.table.host"),
      className: "font-bold text-slate-200",
      render: (item) => item.host,
    },
    {
      label: t("agents.table.group"),
      className: "text-slate-400 font-medium",
      render: (item) => item.group,
    },
    {
      label: t("agents.table.platform"),
      render: (item) => (
        <span className="uppercase text-[10px] font-black tracking-widest text-blue-400/80 bg-blue-400/5 px-3 py-1 rounded border border-blue-400/10 inline-flex items-center">
            {item.platform}
        </span>
      ),
    },
    {
      label: t("agents.table.contact"),
      className: "text-slate-400 font-mono",
      render: (item) => item.contact,
    },
    {
      label: t("agents.table.pid"),
      className: "font-mono text-xs text-slate-500",
      render: (item) => item.pid,
    },
    {
      label: t("agents.table.privilege"),
      className: "text-slate-400",
      render: (item) => item.privilege,
    },
    {
      label: t("agents.table.status"),
      render: (item) => (
        <StatusBadge 
          status={item.trusted ? "COMPLETED" : "FAILED"} 
          label={item.trusted ? t("agents.table.trusted") : t("agents.table.untrusted")} 
        />
      ),
    },
    {
      label: t("agents.table.lastSeen"),
      className: "text-slate-500 tabular-nums italic text-xs",
      render: (item) => item.last_seen,
    },
  ];

  return (
    <DataTable 
      data={data} 
      columns={columns} 
      isLoading={isLoading}
      emptyState={{
        title: t("agents.page.empty"),
      }}
    />
  );
};
