"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { ws, type WebSocketStatus } from "~/lib/WebSocketService";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { cn } from "~/lib/utils";

const TONE: Record<Exclude<WebSocketStatus, "idle">, { dot: string; pill: string }> = {
  open: { dot: "bg-green-500", pill: "text-green-700 ring-green-200 bg-green-50" },
  connecting: { dot: "bg-amber-500 animate-pulse", pill: "text-amber-700 ring-amber-200 bg-amber-50" },
  reconnecting: { dot: "bg-amber-500 animate-pulse", pill: "text-amber-700 ring-amber-200 bg-amber-50" },
  failed: { dot: "bg-rose-500", pill: "text-rose-700 ring-rose-200 bg-rose-50" },
};

/** Header indicator for the live-event WebSocket, with a retry on failure. */
export function WsStatus() {
  const { t } = useI18n();
  const showToast = useToast();
  const status = useSyncExternalStore(
    (onChange) => ws.onStatus(onChange),
    () => ws.getStatus(),
    () => "idle" as WebSocketStatus
  );
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });

  useEffect(() => {
    return ws.onStatus((next) => {
      // Toast only when an established connection is lost and could not be
      // restored; an initial failure is shown by the header pill alone.
      if (next === "failed" && ws.hasEverConnected()) {
        showToast(tRef.current("common.ws.failedToast"), {
          type: "error",
          duration: 0,
          key: "ws-status",
          action: { label: tRef.current("common.ws.retry"), onClick: () => ws.retry() },
        });
      }
    });
  }, [showToast]);

  if (status === "idle") return null;

  const label = t(`common.ws.${status}` as "common.ws.open");
  const tone = TONE[status];
  const failed = status === "failed";

  return (
    <button
      type="button"
      onClick={failed ? () => ws.retry() : undefined}
      disabled={!failed}
      title={failed ? t("common.ws.retry") : t("common.ws.tooltip", { status: label })}
      aria-label={t("common.ws.tooltip", { status: label })}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        tone.pill,
        failed ? "cursor-pointer hover:brightness-95" : "cursor-default"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
      {label}
    </button>
  );
}
