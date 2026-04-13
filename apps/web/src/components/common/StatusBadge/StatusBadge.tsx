"use client";

import React from "react";
import { Badge } from "~/components/ui/badge";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";

type StatusType = "COMPLETED" | "RUNNING" | "FAILED" | "PENDING" | "DRAFT" | "HIGH" | "MEDIUM" | "LOW" | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const getStatusVariant = (status: string): "green" | "blue" | "red" | "yellow" | "outline" => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "COMPLETED":
    case "SUCCESS":
    case "LOW":
      return "green";
    case "RUNNING":
    case "ACTIVE":
      return "blue";
    case "FAILED":
    case "ERROR":
    case "CRITICAL":
    case "HIGH":
      return "red";
    case "PENDING":
    case "WARNING":
    case "MEDIUM":
      return "yellow";
    case "DRAFT":
      return "outline";
    default:
      return "outline";
  }
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { t } = useI18n();
  const variant = getStatusVariant(status);
  
  const displayLabel = label || t(`status.${status.toLowerCase()}` as any) || t(`risk.${status.toLowerCase()}` as any) || status;

  return (
    <Badge variant={variant} className={cn("gap-1.5 py-0.5 px-2.5", className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-current animate-pulse": status.toUpperCase() === "RUNNING",
        "bg-current": status.toUpperCase() !== "RUNNING",
      })}></span>
      {displayLabel}
    </Badge>
  );
}
