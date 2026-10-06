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

  const tone = {
    connected: { dot: "bg-green-500", pill: "bg-green-50 ring-green-200 text-green-700" },
    connecting: { dot: "bg-amber-500", pill: "bg-amber-50 ring-amber-200 text-amber-700" },
    error: { dot: "bg-rose-500", pill: "bg-rose-50 ring-rose-200 text-rose-700" },
    disconnected: { dot: "bg-neutral-400", pill: "bg-neutral-100 ring-neutral-200 text-neutral-600" },
  }[state];
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ring-inset ${tone.pill}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${tone.dot} ${state === "connecting" ? "animate-pulse" : ""}`}
      />
      <span className="text-[10px] font-medium capitalize">{stateLabel}</span>
    </div>
  );
}

export default ConnectionPill;
