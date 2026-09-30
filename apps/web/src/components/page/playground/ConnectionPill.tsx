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
      ? "bg-green-500"
      : state === "connecting"
      ? "bg-amber-500"
      : state === "error"
      ? "bg-rose-500"
      : "bg-neutral-400";
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 ring-1 ring-inset ring-neutral-200">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="text-[10px] font-medium capitalize text-neutral-600">
        {stateLabel}
      </span>
    </div>
  );
}

export default ConnectionPill;
