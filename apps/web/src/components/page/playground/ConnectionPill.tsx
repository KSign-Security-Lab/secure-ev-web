"use client";

import type { ConnectionState } from "~/components/page/playground/Terminal";
import { useI18n } from "~/i18n/I18nProvider";

export function ConnectionPill({ state }: { state: ConnectionState }) {
  const { t } = useI18n();
  const stateLabel = {
    connected: t("playground.connection.connected"),
    connecting: t("playground.connection.connecting"),
    disconnected: t("playground.connection.disconnected"),
    error: t("playground.connection.error"),
  }[state];

  const dot =
    state === "connected"
      ? "bg-emerald-400"
      : state === "connecting"
      ? "bg-yellow-400"
      : state === "error"
      ? "bg-red-400"
      : "bg-slate-500";
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2.5 py-1 ring-1 ring-inset ring-slate-700">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="text-[10px] font-medium capitalize text-slate-300">
        {stateLabel}
      </span>
    </div>
  );
}

export default ConnectionPill;
