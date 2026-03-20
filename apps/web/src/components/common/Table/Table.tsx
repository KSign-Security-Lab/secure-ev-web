"use client";

import React from "react";
import clsx from "clsx";
import { useI18n } from "~/i18n/I18nProvider";

export interface TableColumn<T> {
  label: string;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[] | undefined | null;
  columns: TableColumn<T>[];
  striped?: boolean;
}

export function Table<T>({
  data = [],
  columns,
  striped = true,
}: TableProps<T>) {
  const { t } = useI18n();
  const baseHeaderClass = "text-white text-sm font-semibold text-center py-4 px-4";
  const baseCellClass = "px-4 py-4 font-medium text-slate-300 text-center border-b border-slate-800/50";

  const isEmpty = !Array.isArray(data) || data.length === 0;

  return (
    <table className="w-full table-fixed text-sm text-left text-white">
      <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-700/50 sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className={clsx(baseHeaderClass, col.className)}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <tr>
            <td
              colSpan={columns.length}
              className="text-center text-neutral-500 py-6"
            >
              {t("common.noDataAvailable")}
            </td>
          </tr>
        ) : (
          data.map((item, rowIdx) => (
            <tr
              key={rowIdx}
              className={
                striped && rowIdx % 2 === 0
                  ? "bg-slate-800/30"
                  : striped
                  ? "bg-transparent"
                  : ""
              }
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={clsx(baseCellClass, col.className)}>
                  {col.render(item, rowIdx)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
