"use client";

import React from "react";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";
import { Pagination } from "../Pagination/Pagination";
import { EmptyState } from "../EmptyState/EmptyState";
import { GlassCard } from "~/components/ui/glass-card";
import { Checkbox } from "~/components/ui/checkbox";
import { NativeSelect } from "../Select/NativeSelect";

export interface DataTableColumn<T> {
  label: string;
  /** Text columns: left (default). Numeric columns: right. */
  align?: "left" | "center" | "right";
  /** Keep the cell on one line (e.g. hyphenated tactic names). */
  nowrap?: boolean;
  className?: string;
  headerClassName?: string;
  render: (item: T, index: number) => React.ReactNode;
}

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;

// Deterministic widths: random values differ between server and client
// render and cause a hydration mismatch.
const SKELETON_WIDTHS = [72, 88, 64, 80, 92, 68, 76, 84];

export function DataTableSkeleton({
  columns = 5,
  rows = 5,
  leadingCell = false,
}: {
  columns?: number;
  rows?: number;
  leadingCell?: boolean;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-neutral-200">
          {leadingCell && <td className="w-10 px-4 py-4" />}
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="px-6 py-4">
              <div
                className="h-4 bg-neutral-200 rounded-md animate-pulse"
                style={{ width: `${SKELETON_WIDTHS[(rIdx * 3 + cIdx) % SKELETON_WIDTHS.length]}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | undefined | null;
  isLoading?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount?: number;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    /** @deprecated no longer rendered; kept for call-site compatibility. */
    localeLabel?: string;
  };
  onRowClick?: (item: T) => void;
  className?: string;
  rowClassName?: (item: T, idx: number) => string;
  /** Stable row identity (used for keys and selection). Defaults to the index. */
  rowKey?: (item: T, idx: number) => string;
  /** Multi-select with a checkbox column. Requires `rowKey`. */
  selection?: {
    selected: Set<string>;
    onChange: (next: Set<string>) => void;
  };
  /**
   * Fill the parent's height: the card becomes a fixed-height flex column with a
   * sticky header, an internally scrolling body and a pinned footer. The parent
   * must give it a height (e.g. `h-[480px]` or a flex child with min-h-0).
   */
  fillHeight?: boolean;
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
  rowKey,
  selection,
  fillHeight,
}: DataTableProps<T>) {
  const { t } = useI18n();

  const isEmpty = !isLoading && (!data || data.length === 0);
  const rows = data ?? [];
  const keyOf = (item: T, idx: number) => (rowKey ? rowKey(item, idx) : String(idx));

  const pageKeys = rows.map(keyOf);
  const selectedOnPage = selection ? pageKeys.filter((k) => selection.selected.has(k)).length : 0;
  const allOnPage = pageKeys.length > 0 && selectedOnPage === pageKeys.length;

  const togglePage = () => {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (allOnPage) pageKeys.forEach((k) => next.delete(k));
    else pageKeys.forEach((k) => next.add(k));
    selection.onChange(next);
  };
  const toggleRow = (key: string) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selection.onChange(next);
  };

  const colSpan = columns.length + (selection ? 1 : 0);

  const total = pagination?.totalCount;
  const pageSize = pagination?.pageSize ?? rows.length;
  const from = pagination && rows.length ? (pagination.currentPage - 1) * pageSize + 1 : 0;
  const to = from ? from + rows.length - 1 : 0;
  const showFooter =
    pagination && !isLoading && (total ?? rows.length) > 0 &&
    (pagination.totalPages > 1 || pagination.onPageSizeChange || total !== undefined);

  return (
    <GlassCard
      className={cn(
        "p-0 border-neutral-200 bg-white rounded-lg",
        fillHeight ? "flex h-full flex-col overflow-hidden" : "overflow-visible",
        className,
      )}
    >
      <div className={cn("overflow-x-auto", fillHeight && "min-h-0 flex-1 overflow-y-auto")}>
        <table className="w-full text-left border-collapse">
          <thead className={cn(fillHeight && "sticky top-0 z-10")}>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
              {selection && (
                <th className="w-10 rounded-tl-lg px-4 py-3">
                  <Checkbox
                    checked={allOnPage ? true : selectedOnPage > 0 ? "indeterminate" : false}
                    onCheckedChange={togglePage}
                    disabled={!rows.length}
                    aria-label={t("common.selectAll")}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={cn(
                    "px-6 py-3 text-xs font-semibold whitespace-nowrap",
                    ALIGN[col.align ?? "left"],
                    col.headerClassName,
                    idx === 0 && !selection && "rounded-tl-lg",
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
              <DataTableSkeleton columns={columns.length} rows={8} leadingCell={Boolean(selection)} />
            ) : isEmpty ? (
              <tr>
                <td colSpan={colSpan} className="p-0">
                  <EmptyState
                    {...emptyState}
                    className="border-none bg-transparent rounded-none p-20"
                  />
                </td>
              </tr>
            ) : (
              rows.map((item, rowIdx) => {
                const key = keyOf(item, rowIdx);
                const isSelected = selection?.selected.has(key) ?? false;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    aria-selected={selection ? isSelected : undefined}
                    className={cn(
                      "group transition-colors duration-200",
                      isSelected ? "bg-blue-50/60" : "bg-transparent",
                      onRowClick && "cursor-pointer hover:bg-neutral-50",
                      rowClassName?.(item, rowIdx)
                    )}
                  >
                    {selection && (
                      <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(key)}
                          aria-label={t("common.selectRow")}
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn(
                          "px-6 py-3 text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors",
                          ALIGN[col.align ?? "left"],
                          col.align === "right" && "tabular-nums",
                          col.nowrap && "whitespace-nowrap",
                          col.className
                        )}
                      >
                        {col.render(item, rowIdx)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showFooter && pagination && (
        <div className={cn("flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-neutral-200 bg-white rounded-b-lg", fillHeight && "shrink-0")}>
          <div className="flex items-center gap-4 text-xs text-neutral-500 tabular-nums">
            {total !== undefined && from > 0 && (
              <span>
                {t("common.range", {
                  from: from.toLocaleString(),
                  to: to.toLocaleString(),
                  total: total.toLocaleString(),
                })}
              </span>
            )}
            {selection && selection.selected.size > 0 && (
              <span className="font-medium text-blue-700">
                {t("common.selectedCount", { count: selection.selected.size })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {pagination.onPageSizeChange && (
              <label className="flex items-center gap-2 text-xs text-neutral-500">
                {t("common.perPage")}
                <NativeSelect
                  size="sm"
                  wrapperClassName="w-20"
                  className="tabular-nums"
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            )}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
              />
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
