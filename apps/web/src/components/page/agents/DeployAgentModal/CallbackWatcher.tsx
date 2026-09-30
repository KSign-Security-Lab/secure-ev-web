"use client";

import React from "react";
import { CheckCircle2, Loader2, RefreshCw, Satellite } from "lucide-react";
import trpc from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 5 * 60_000;

type WatchState =
  | { status: "idle" }
  | { status: "waiting" }
  | { status: "found"; host: string; paw: string }
  | { status: "timeout" };

interface CallbackWatcherProps {
  /** Paws already known when the modal opened. */
  knownPaws: Set<string>;
  /** True once the operator has copied or downloaded a command. */
  armed: boolean;
  /** Bumped to restart a finished watch. */
  watchNonce: number;
  onAgentFound: () => void;
  onRearm: () => void;
}

/**
 * Polls the agent list after a command has been taken, so the operator sees the
 * agent land without leaving the modal. Caldera gives no such feedback.
 */
export const CallbackWatcher: React.FC<CallbackWatcherProps> = ({
  knownPaws,
  armed,
  watchNonce,
  onAgentFound,
  onRearm,
}) => {
  const { t } = useI18n();
  const showToast = useToast();
  const [state, setState] = React.useState<WatchState>({ status: "idle" });

  // Keep the callbacks out of the polling effect's dependencies so a parent
  // re-render never restarts the timer.
  const onAgentFoundRef = React.useRef(onAgentFound);
  const showToastRef = React.useRef(showToast);
  const tRef = React.useRef(t);

  React.useEffect(() => {
    onAgentFoundRef.current = onAgentFound;
    showToastRef.current = showToast;
    tRef.current = t;
  });

  React.useEffect(() => {
    if (!armed) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();
    setState({ status: "waiting" });

    const poll = async () => {
      try {
        const agents = await trpc.agents.list.query();
        if (cancelled) return;

        const fresh = agents.find((agent) => !knownPaws.has(agent.paw));
        if (fresh) {
          setState({
            status: "found",
            host: fresh.host,
            paw: fresh.paw,
          });
          showToastRef.current(
            tRef.current("deploy.watcher.foundToast", {
              host: fresh.host,
              paw: fresh.paw,
            }),
            { type: "success" }
          );
          onAgentFoundRef.current();
          window.clearInterval(timer);
          return;
        }
      } catch {
        // A transient failure shouldn't stop the watch; the next tick retries.
      }

      if (!cancelled && Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setState({ status: "timeout" });
        window.clearInterval(timer);
      }
    };

    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
    // `knownPaws` is a stable snapshot taken when the modal opened.
  }, [armed, watchNonce, knownPaws]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Satellite size={13} className="text-neutral-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
          {t("deploy.watcher.title")}
        </span>
      </div>

      {state.status === "idle" && (
        <p className="text-xs text-neutral-500">{t("deploy.watcher.idle")}</p>
      )}

      {state.status === "waiting" && (
        <p className="flex items-center gap-2 text-xs text-blue-700">
          <Loader2 size={13} className="animate-spin" />
          {t("deploy.watcher.waiting")}
        </p>
      )}

      {state.status === "found" && (
        <p className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle2 size={13} />
          {t("deploy.watcher.found", { host: state.host, paw: state.paw })}
        </p>
      )}

      {state.status === "timeout" && (
        <div className="space-y-2">
          <p className="text-xs text-amber-700">
            {t("deploy.watcher.timeout")}
          </p>
          <button
            type="button"
            onClick={onRearm}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <RefreshCw size={12} />
            {t("deploy.watcher.retry")}
          </button>
        </div>
      )}
    </div>
  );
};
