"use client";

import React from "react";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import { useI18n } from "~/i18n/I18nProvider";

export interface AssessmentItem {
  id: string;
  name: string;
  target: string;
  attackCount: number;
  repeatCount: number;
  lastExecutionDate: string | null;
}

interface AssessmentTableProps {
  data: AssessmentItem[];
  isLoading?: boolean;
  onItemClick?: (item: AssessmentItem) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount?: number;
  };
}

export const AssessmentTable: React.FC<AssessmentTableProps> = ({ 
  data, 
  isLoading, 
  onItemClick,
  pagination 
}) => {
  const { t } = useI18n();

  const columns: DataTableColumn<AssessmentItem>[] = [
    {
      label: t("assessment.table.name"),
      render: (item) => (
        <button 
          onClick={() => onItemClick?.(item)}
          className="text-blue-400 hover:text-blue-300 font-bold transition-colors text-left"
        >
          {item.name}
        </button>
      ),
    },
    {
      label: t("assessment.table.target"),
      className: "font-mono text-xs text-slate-400 font-bold",
      render: (item) => item.target,
    },
    {
      label: t("assessment.table.attackCount"),
      className: "text-slate-200 font-bold tabular-nums",
      render: (item) => item.attackCount,
    },
    {
      label: t("assessment.table.repeatCount"),
      className: "text-slate-400 font-medium tabular-nums",
      render: (item) => item.repeatCount,
    },
    {
      label: t("assessment.table.lastDate"),
      className: "text-slate-500 text-xs italic",
      render: (item) => item.lastExecutionDate || t("assessment.table.notYet"),
    },
  ];

  return (
    <DataTable 
      data={data} 
      columns={columns} 
      isLoading={isLoading}
      pagination={pagination}
      emptyState={{
        title: t("assessment.page.empty"),
      }}
    />
  );
};
