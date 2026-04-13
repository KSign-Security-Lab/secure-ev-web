"use client";

import React from "react";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";
import { Pagination } from "../Pagination/Pagination";
import { EmptyState } from "../EmptyState/EmptyState";
import { GlassCard } from "~/components/ui/glass-card";

export interface DataTableColumn<T> {
  label: string;
  className?: string;
  headerClassName?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export function DataTableSkeleton({ columns = 5, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-slate-800/30">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="px-6 py-4">
              <div className="h-4 bg-slate-800/50 rounded-md animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | undefined | null;
  isLoading?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ElementType;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount?: number;
    localeLabel?: string;
  };
  onRowClick?: (item: T) => void;
  className?: string;
  rowClassName?: (item: T, idx: number) => string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyState,
  pagination,
  onRowClick,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const { t } = useI18n();

  const isEmpty = !isLoading && (!data || data.length === 0);

  return (
    <GlassCard className={cn("overflow-visible shadow-2xl p-0 border-slate-700/50 bg-slate-900/30 backdrop-blur-md rounded-3xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700/50 text-slate-400">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] leading-none",
                    col.headerClassName,
                    idx === 0 && "rounded-tl-3xl",
                    idx === columns.length - 1 && "rounded-tr-3xl"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {isLoading ? (
              <DataTableSkeleton columns={columns.length} rows={8} />
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    {...emptyState}
                    className="border-none bg-transparent rounded-none p-20"
                  />
                </td>
              </tr>
            ) : (
              data?.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-all duration-200",
                    onRowClick && "cursor-pointer hover:bg-blue-500/5",
                    rowIdx % 2 === 1 ? "bg-slate-800/10" : "bg-transparent",
                    rowClassName?.(item, rowIdx)
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-6 py-4 text-sm font-medium text-slate-300 group-hover:text-white transition-colors",
                        col.className
                      )}
                    >
                      {col.render(item, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-900/30 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              {pagination.totalCount !== undefined
                ? t("common.showingCount", {
                    count: data?.length || 0,
                    total: pagination.totalCount,
                    label: pagination.localeLabel || t("common.items") || "items"
                  }) || `Showing ${data?.length || 0} of ${pagination.totalCount} ${pagination.localeLabel || "items"}`
                : ""}
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          </div>
        </div>
      )}
    </GlassCard>
  );
}
