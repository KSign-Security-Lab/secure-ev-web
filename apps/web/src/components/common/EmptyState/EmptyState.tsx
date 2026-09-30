"use client";

import React from "react";
import { Ghost, ShieldAlert, Database, SearchX } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useI18n();

  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50", className)}>
      <div className="p-4 rounded-full bg-neutral-100 text-neutral-500 mb-4 animate-in zoom-in-50 duration-500">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-neutral-950 mb-2 leading-none tracking-tight">
        {title || t("common.noDataAvailable") || "No Data Available"}
      </h3>
      {description && (
        <p className="text-neutral-500 max-w-xs mb-6 text-sm font-medium">
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
