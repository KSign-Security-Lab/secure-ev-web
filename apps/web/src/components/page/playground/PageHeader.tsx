"use client";

import { RefreshCw } from "lucide-react";
import type { ConnectionState } from "~/components/page/playground/Terminal";
import ConnectionPill from "./ConnectionPill";
import { useI18n } from "~/i18n/I18nProvider";

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
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <div>
        <h1 className="text-sm font-semibold tracking-wide text-neutral-950">
          {t("playground.header.title")}
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          {t("playground.header.subtitle")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ConnectionPill state={connectionState} />
          {selectedSessionId ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {t("playground.header.sessionSelected", {
                id: selectedSessionId,
              })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-500 ring-1 ring-inset ring-neutral-200">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              {t("playground.header.noSessionSelected")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRefreshSessions}
          disabled={sessionsLoading}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("playground.header.refreshSessions")}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${sessionsLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </button>
      </div>
    </div>
  );
}

export default PageHeader;
