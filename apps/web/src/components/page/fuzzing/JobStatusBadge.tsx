import React from "react";
import clsx from "clsx";
import { useI18n } from "~/i18n/I18nProvider";

interface JobStatusBadgeProps {
  status: string;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const { t } = useI18n();
  const statusLabel =
    status === "RUNNING"
      ? t("status.running")
      : status === "COMPLETED"
      ? t("status.completed")
      : status === "FAILED"
      ? t("status.failed")
      : status === "PENDING"
      ? t("status.pending")
      : status === "DRAFT"
      ? t("status.draft")
      : status;

  return (
    <span
      className={clsx(
        "text-xs font-mono px-2 py-0.5 rounded border",
        {
          "border-blue-300 bg-blue-50 text-blue-700 animate-pulse": status === "RUNNING",
          "border-green-300 bg-green-50 text-green-700": status === "COMPLETED",
          "border-rose-300 bg-rose-50 text-rose-700": status === "FAILED",
          "border-amber-300 bg-amber-50 text-amber-700": status === "PENDING",
          "border-neutral-300 bg-neutral-50 text-neutral-700": !["RUNNING", "COMPLETED", "FAILED", "PENDING"].includes(status),
        }
      )}
    >
      {statusLabel}
    </span>
  );
}
