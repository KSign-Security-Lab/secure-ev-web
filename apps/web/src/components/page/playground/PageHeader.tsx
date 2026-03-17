"use client";

import { RefreshCw } from "lucide-react";
import type { ConnectionState } from "~/components/page/playground/Terminal";
import ConnectionPill from "./ConnectionPill";

interface Props {
  connectionState: ConnectionState;
  selectedSessionId: number | null;
  onRefreshSessions: () => void;
  sessionsLoading?: boolean;
}

export function PageHeader({
  connectionState,
  selectedSessionId,
  onRefreshSessions,
  sessionsLoading,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-base-700/50 bg-base-900/50 px-4 py-3">
      <div>
        <h1 className="text-sm font-semibold tracking-wide text-white">
          Playground
        </h1>
        <p className="mt-1 text-xs text-neutral-400">
          Browse active sessions and interact with a live terminal.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ConnectionPill state={connectionState} />
          {selectedSessionId ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/20 px-2.5 py-1 text-[10px] font-medium text-primary-300 ring-1 ring-inset ring-primary-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
              Session #{selectedSessionId}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/20 px-2.5 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-inset ring-slate-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              No session selected
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRefreshSessions}
          disabled={sessionsLoading}
          className="flex items-center gap-1.5 rounded-lg bg-base-800/80 px-3 py-1.5 text-xs font-medium text-neutral-300 ring-1 ring-inset ring-base-700/50 transition-colors hover:bg-base-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh sessions list"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${sessionsLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}

export default PageHeader;
