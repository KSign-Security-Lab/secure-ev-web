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
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/20 backdrop-blur-sm", className)}>
      <div className="p-4 rounded-full bg-slate-800/50 text-slate-500 mb-4 animate-in zoom-in-50 duration-500">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 leading-none uppercase tracking-tight">
        {title || t("common.noDataAvailable") || "No Data Available"}
      </h3>
      {description && (
        <p className="text-slate-400 max-w-xs mb-6 text-sm font-medium">
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
