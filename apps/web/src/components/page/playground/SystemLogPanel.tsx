"use client";

import { useMemo } from "react";
import { cn } from "~/lib/utils";

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
  error: "text-danger-500",
};

export default function SystemLogPanel({ logs, onClear, className }: Props) {
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
        "flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-lg border border-base-700/50 bg-base-900/50",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-base-700/50 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
          System Log
        </span>
        {onClear && logs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-medium text-neutral-400 transition-colors hover:text-neutral-200"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-col min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {logs.length === 0 ? (
          <p className="text-xs text-neutral-500">No recent events.</p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {logs
              .slice()
              .reverse()
              .map((log) => (
                <li key={log.id} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-[10px] font-mono text-neutral-500">
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
    </div>
  );
}
