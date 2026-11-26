"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ScrollText } from "lucide-react";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";

type LogLevel = "info" | "success" | "warning" | "error";

export interface SystemLogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
}

interface Props {
  logs: SystemLogEntry[];
  onClear?: () => void;
  className?: string;
}

const levelStyles: Record<LogLevel, string> = {
  info: "text-neutral-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  error: "text-rose-400",
};

const STORAGE_KEY = "playground.systemLog.collapsed";

export default function SystemLogPanel({ logs, onClear, className }: Props) {
  const { t } = useI18n();
  // Remember the collapsed choice across sessions (best-effort; storage may be
  // unavailable in private windows or previews). This panel only mounts after a
  // client-side interaction, so reading storage during init is hydration-safe.
  // Collapsed by default; only expanded when the viewer explicitly opened it.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "0";
    } catch {
      return true;
    }
  });

  const toggle = () =>
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white",
        collapsed ? "h-auto" : "h-[172px]",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          className="group flex min-w-0 items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700"
          title={collapsed ? t("playground.systemLog.expand") : t("playground.systemLog.collapse")}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform",
              collapsed && "-rotate-90"
            )}
            aria-hidden
          />
          <span>{t("playground.systemLog.title")}</span>
          {logs.length > 0 && (
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-500">
              {logs.length}
            </span>
          )}
        </button>
        {onClear && logs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700"
          >
            {t("playground.systemLog.clear")}
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto bg-neutral-950 px-3 py-3 space-y-1">
          {logs.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <div className="rounded-full bg-neutral-800 p-2.5 text-neutral-400">
                <ScrollText className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-neutral-200">
                {t("playground.systemLog.noEvents")}
              </p>
              <p className="max-w-[16rem] text-xs text-neutral-500">
                {t("playground.systemLog.noEventsDesc")}
              </p>
            </div>
          ) : (
            <ul className="space-y-2 text-xs">
              {logs
                .slice()
                .reverse()
                .map((log) => (
                  <li key={log.id} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs font-mono text-neutral-500">
                      {timeFormatter.format(log.timestamp)}
                    </span>
                    <span className={cn("leading-snug", levelStyles[log.level])}>
                      {log.message}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
