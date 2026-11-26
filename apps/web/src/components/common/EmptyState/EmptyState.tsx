"use client";

import React from "react";
import { SearchX } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** "sm" for narrow panels (side lists, chart cards). */
  size?: "sm" | "md";
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const { t } = useI18n();
  const sm = size === "sm";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50",
        sm ? "p-6" : "p-12",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-neutral-100 text-neutral-500 animate-in zoom-in-50 duration-500",
          sm ? "p-2.5 mb-3" : "p-4 mb-4"
        )}
      >
        <Icon size={sm ? 24 : 48} strokeWidth={1.5} aria-hidden />
      </div>
      <h3
        className={cn(
          "font-bold text-neutral-950 leading-tight tracking-tight",
          sm ? "text-sm mb-1" : "text-xl mb-2"
        )}
      >
        {title || t("common.noDataAvailable") || "No Data Available"}
      </h3>
      {description && (
        <p className={cn("text-neutral-500 max-w-xs font-medium", sm ? "text-xs mb-3" : "text-sm mb-6")}>
          {description}
        </p>
      )}
      {action && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          {action}
        </div>
      )}
    </div>
  );
}
