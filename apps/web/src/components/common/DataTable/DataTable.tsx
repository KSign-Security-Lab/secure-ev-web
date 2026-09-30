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
        <tr key={rIdx} className="border-b border-neutral-200">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="px-6 py-4">
              <div className="h-4 bg-neutral-200 rounded-md animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
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
    <GlassCard className={cn("overflow-visible p-0 border-neutral-200 bg-white rounded-lg", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 text-[10px] font-semibold uppercase tracking-wide leading-none text-center",
                    col.headerClassName,
                    idx === 0 && "rounded-tl-lg",
                    idx === columns.length - 1 && "rounded-tr-lg"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
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
                    "group transition-all duration-200 bg-transparent",
                    onRowClick && "cursor-pointer hover:bg-neutral-50",
                    rowClassName?.(item, rowIdx)
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-6 py-4 text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors text-center",
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
        <div className="px-6 py-4 border-t border-neutral-200 bg-white rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500 font-medium">
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
