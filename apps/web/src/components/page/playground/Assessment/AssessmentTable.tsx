"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import { useI18n } from "~/i18n/I18nProvider";
import { display, formatDate } from "~/lib/format";

import type { RouterOutputs } from "~/lib/trpc";

export type AssessmentItem = RouterOutputs["assessments"]["list"][number];

interface AssessmentTableProps {
  data: AssessmentItem[];
  isLoading?: boolean;
  onRowClick?: (item: AssessmentItem) => void;
  selection?: {
    selected: Set<string>;
    onChange: (next: Set<string>) => void;
  };
  emptyAction?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount?: number;
    pageSize?: number;
  };
}

export const AssessmentTable: React.FC<AssessmentTableProps> = ({ 
  data, 
  isLoading, 
  onRowClick,
  selection,
  emptyAction,
  pagination 
}) => {
  const { t } = useI18n();

  const columns: DataTableColumn<AssessmentItem>[] = [
    {
      label: t("assessment.table.name"),
      render: (item) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold text-neutral-900 truncate">
            {item.name}
          </span>
        </div>
      ),
    },
    {
      label: t("assessment.table.target"),
      className: "font-mono text-xs text-neutral-600",
      render: (item) => display(item.target),
    },
    {
      label: t("assessment.table.attackCount"),
      align: "right",
      className: "text-neutral-700",
      render: (item) => item.attackCount.toLocaleString(),
    },
    {
      label: t("assessment.table.repeatCount"),
      align: "right",
      className: "text-neutral-700",
      render: (item) => item.repeatCount.toLocaleString(),
    },
    {
      label: t("assessment.table.lastDate"),
      className: "text-neutral-500 text-xs tabular-nums",
      nowrap: true,
      render: (item) => (item.lastRunAt ? formatDate(item.lastRunAt) : t("assessment.table.notYet")),
    },
  ];

  return (
    <DataTable 
      data={data} 
      columns={columns} 
      isLoading={isLoading}
      onRowClick={onRowClick}
      rowKey={(item) => item.id}
      selection={selection}
      pagination={pagination}
      emptyState={{
        icon: ClipboardList,
        title: t("assessment.page.empty"),
        description: t("assessment.page.emptyDesc"),
        action: emptyAction,
      }}
    />
  );
};
