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

const getStatusVariant = (
  status: string,
): "green" | "blue" | "red" | "orange" | "yellow" | "cyan" | "outline" => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "COMPLETED":
    case "SUCCESS":
    case "PASS":
      return "green";
    case "RUNNING":
    case "ACTIVE":
    case "INFO":
      return "blue";
    case "FAILED":
    case "ERROR":
    case "CRITICAL":
      return "red";
    // Severity scale: critical=rose > high=orange > medium=amber > low=sky
    case "HIGH":
      return "orange";
    case "PENDING":
    case "WARNING":
    case "MEDIUM":
      return "yellow";
    case "LOW":
      return "cyan";
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
