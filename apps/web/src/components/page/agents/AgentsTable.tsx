import React, { useState } from "react";
import { Rocket, ServerOff, SquareTerminal, Trash2 } from "lucide-react";
import { AgentsListResponse } from "~/app/playground/agents/page";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import { StatusBadge } from "~/components/common/StatusBadge/StatusBadge";
import { useI18n } from "~/i18n/I18nProvider";
import { display, formatDate, platformLabel } from "~/lib/format";
import { cn } from "~/lib/utils";

type AgentRow = AgentsListResponse[number];

interface AgentsTableProps {
  data: AgentsListResponse;
  isLoading?: boolean;
  onDeploy?: () => void;
  /** Open the live terminal drawer for an agent. */
  onOpenTerminal?: (agent: AgentRow) => void;
  /** Kill the implant and remove it from the console in one step. */
  onTerminate?: (agent: AgentRow) => void;
  /** Open the live terminal for an agent. */
  onRowClick?: (agent: AgentRow) => void;
  /** Paw of the agent whose terminal is currently open, for row highlighting. */
  selectedPaw?: string | null;
  /** Collapse to a few essential columns (while the terminal squeezes the table). */
  compact?: boolean;
}

/** Rows per page when paginating the agent list. */
const DEFAULT_PAGE_SIZE = 10;

export const AgentsTable: React.FC<AgentsTableProps> = ({
  data,
  isLoading,
  onDeploy,
  onOpenTerminal,
  onTerminate,
  onRowClick,
  selectedPaw,
  compact = false,
}) => {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  // Clamp for display/slicing so the view stays valid as the list shrinks
  // (e.g. after a terminate) without needing to write state back in an effect.
  const currentPage = Math.min(page, totalPages);
  const pagedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  let columns: DataTableColumn<AgentRow>[] = [
    {
      label: t("agents.table.idPaw"),
      className: "font-mono text-xs text-neutral-500 font-semibold",
      nowrap: true,
      render: (item) => item.paw,
    },
    {
      label: t("agents.table.host"),
      className: "font-semibold text-neutral-900",
      render: (item) => display(item.host),
    },
    {
      label: t("agents.table.group"),
      className: "text-neutral-500 font-medium",
      render: (item) => display(item.group),
    },
    {
      label: t("agents.table.platform"),
      render: (item) => (
        <span className="whitespace-nowrap text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-flex items-center">
            {platformLabel(item.platform)}
        </span>
      ),
    },
    {
      label: t("agents.table.contact"),
      className: "text-neutral-500 font-mono",
      render: (item) => display(item.contact),
    },
    {
      label: t("agents.table.pid"),
      align: "right",
      className: "font-mono text-xs text-neutral-500",
      render: (item) => display(item.pid),
    },
    {
      label: t("agents.table.privilege"),
      className: "text-neutral-500",
      render: (item) => display(item.privilege),
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
      className: "text-neutral-500 tabular-nums text-xs",
      nowrap: true,
      render: (item) => formatDate(item.last_seen),
    },
  ];

  if (compact) {
    // Squeezed next to the terminal: pack the key facts (host, paw, OS,
    // privilege) into one dense cell, keep status, drop the rest.
    columns = [
      {
        label: t("agents.table.host"),
        render: (item) => (
          <div className="min-w-0">
            <div className="truncate font-semibold text-neutral-900">
              {display(item.host)}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-neutral-500">
              <span className="font-mono">{item.paw}</span>
              <span aria-hidden>·</span>
              <span>{platformLabel(item.platform)}</span>
              <span aria-hidden>·</span>
              <span>{display(item.privilege)}</span>
            </div>
          </div>
        ),
      },
      {
        label: t("agents.table.status"),
        nowrap: true,
        render: (item) => (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge
              status={item.trusted ? "COMPLETED" : "FAILED"}
              label={
                item.trusted
                  ? t("agents.table.trusted")
                  : t("agents.table.untrusted")
              }
            />
            <span className="text-[11px] tabular-nums text-neutral-400">
              {formatDate(item.last_seen)}
            </span>
          </div>
        ),
      },
    ];
  }

  if (onOpenTerminal || onTerminate) {
    columns.push({
      label: t("agents.table.actions"),
      align: "right",
      nowrap: true,
      headerClassName: "sr-only",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {onOpenTerminal && (
            <button
              type="button"
              title={t("agents.action.terminalTitle")}
              aria-label={t("agents.action.terminalTitle")}
              aria-pressed={selectedPaw === item.paw}
              onClick={(event) => {
                event.stopPropagation();
                onOpenTerminal(item);
              }}
              className={cn(
                "mr-1 inline-flex h-8 items-center gap-1.5 rounded-md border text-xs font-semibold transition-colors",
                compact ? "w-8 justify-center" : "px-2.5",
                selectedPaw === item.paw
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100",
              )}
            >
              <SquareTerminal size={14} />
              {!compact && t("agents.action.terminal")}
            </button>
          )}
          {onTerminate && (
            <button
              type="button"
              title={t("agents.action.terminateTitle")}
              aria-label={t("agents.action.terminate")}
              onClick={(event) => {
                event.stopPropagation();
                onTerminate(item);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={pagedData}
      columns={columns}
      isLoading={isLoading}
      fillHeight
      rowKey={(item) => item.paw}
      onRowClick={onRowClick}
      pagination={{
        currentPage,
        totalPages,
        totalCount,
        pageSize,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
      rowClassName={(item) =>
        selectedPaw && item.paw === selectedPaw
          ? "bg-blue-50/70 hover:bg-blue-50"
          : ""
      }
      emptyState={{
        icon: ServerOff,
        title: t("agents.page.empty"),
        description: t("agents.page.emptyDesc"),
        action: onDeploy ? (
          <button
            type="button"
            onClick={onDeploy}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Rocket className="h-4 w-4" />
            {t("agents.page.deploy")}
          </button>
        ) : undefined,
      }}
    />
  );
};
