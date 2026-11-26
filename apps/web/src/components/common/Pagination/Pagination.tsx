"use client";

import React from "react";
import { useI18n } from "~/i18n/I18nProvider";
import clsx from "clsx";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getPageNumbers = (
  current: number,
  total: number
): (number | string)[] => {
  const delta = 1;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  let previous: number | null = null;

  for (const i of range) {
    if (previous !== null) {
      if (i - previous === 2) {
        rangeWithDots.push(previous + 1);
      } else if (i - previous > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    previous = i;
  }

  return rangeWithDots;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useI18n();
  const pages = getPageNumbers(currentPage, totalPages);

  const handleClick = (page: number | string) => {
    if (typeof page === "number" && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav className="flex justify-center gap-1.5" aria-label={t("common.pagination")}>
      <button
        type="button"
        disabled={currentPage <= 1}
        className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-neutral-100"
        aria-label={t("common.previous")}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        &laquo;
      </button>
      {pages.map((page, idx) => (
        <button
          key={idx}
          type="button"
          aria-current={page === currentPage ? "page" : undefined}
          className={clsx(
            "min-w-8 h-8 px-1 rounded-full transition-colors text-sm tabular-nums",
            page === "..."
              ? "pointer-events-none text-neutral-500"
              : page === currentPage
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          )}
          onClick={() => handleClick(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-neutral-100"
        aria-label={t("common.next")}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        &raquo;
      </button>
    </nav>
  );
};
