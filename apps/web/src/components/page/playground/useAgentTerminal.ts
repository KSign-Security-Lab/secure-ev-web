"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type {
  ConnectionState,
  TerminalViewHandle,
} from "~/components/page/playground/Terminal";
import type { SystemLogEntry } from "~/components/page/playground/SystemLogPanel";
import { normalizeMessage } from "~/components/page/playground/Terminal/utils";
import { useI18n } from "~/i18n/I18nProvider";

/**
 * Commands no longer ride a socket. They are queued for the agent and picked up
 * on its next beacon — which is ~1s while a view holds the agent in interactive
 * mode via /api/terminal/attach.
 */
const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 90_000;
const MAX_LOG_ENTRIES = 50;

export interface UseAgentTerminal {
  terminalRef: MutableRefObject<TerminalViewHandle | null>;
  connectionState: ConnectionState;
  systemLogs: SystemLogEntry[];
  clearSystemLogs: () => void;
  sendCommand: (command: string) => Promise<void>;
  /** Echo a command onto the prompt and run it, as if typed and entered. */
  runCommand: (command: string) => Promise<void>;
  handleSelectCommand: (command: string) => void;
}

/**
 * Drives a live terminal for a single agent. Attaching, the beacon heartbeat,
 * command dispatch/polling and the system log all key off `paw`; pass `null`
 * to detach. Shared by the Agents page side panel and any standalone view.
 */
export function useAgentTerminal(paw: string | null): UseAgentTerminal {
  const { t } = useI18n();
  const terminalRef = useRef<TerminalViewHandle | null>(null);
  const pawRef = useRef<string | null>(paw);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const connectionStateRef = useRef<ConnectionState>("disconnected");
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);

  useEffect(() => {
    pawRef.current = paw;
  }, [paw]);

  useEffect(() => {
    connectionStateRef.current = connectionState;
  }, [connectionState]);

  const appendSystemLog = useCallback(
    (level: SystemLogEntry["level"], message: string) => {
      setSystemLogs((prev) => {
        const nextEntry: SystemLogEntry = {
          id: `${Date.now().toString(36)}-${Math.random()
            .toString(16)
            .slice(2, 8)}`,
          level,
          message,
          timestamp: Date.now(),
        };
        const next = [...prev, nextEntry];
        return next.length > MAX_LOG_ENTRIES
          ? next.slice(next.length - MAX_LOG_ENTRIES)
          : next;
      });
    },
    [],
  );

  const clearSystemLogs = useCallback(() => setSystemLogs([]), []);

  /**
   * One heartbeat. Returns the agent's liveness, or `null` when the request
   * itself failed (network blip, 5xx) so the caller can tolerate a few misses
   * instead of tearing the session down on a single hiccup.
   */
  const attach = useCallback(
    async (
      p: string,
      attached: boolean,
    ): Promise<{ alive: boolean; interactive: boolean } | null> => {
      try {
        const response = await fetch("/api/terminal/attach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paw: p, attached }),
        });
        if (!response.ok) return null;
        return (await response.json()) as {
          alive: boolean;
          interactive: boolean;
        };
      } catch {
        return null;
      }
    },
    [],
  );

  const sendCommand = useCallback(
    async (command: string) => {
      const p = pawRef.current;
      if (!p) {
        terminalRef.current?.writeln(`\r\n${t("playground.page.warnNoSession")}`);
        return;
      }

      appendSystemLog("info", t("playground.page.log.command", { command }));

      let instructionId: string;
      try {
        const response = await fetch("/api/terminal/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paw: p, command }),
        });
        if (!response.ok) throw new Error(await response.text());
        ({ instructionId } = (await response.json()) as {
          instructionId: string;
        });
      } catch (error) {
        terminalRef.current?.writeln(
          `\r\n${t("playground.page.warnNotConnected")}`,
        );
        appendSystemLog(
          "error",
          error instanceof Error
            ? error.message
            : t("playground.page.log.cannotSend"),
        );
        terminalRef.current?.prompt();
        return;
      }

      const startedAt = Date.now();
      while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

        // The operator switched agents mid-flight; stop reporting on this one.
        if (pawRef.current !== p) return;

        let payload: { state?: string } & Record<string, unknown>;
        try {
          const response = await fetch(
            `/api/terminal/result?id=${encodeURIComponent(instructionId)}`,
          );
          if (!response.ok) continue;
          payload = await response.json();
        } catch {
          continue;
        }

        if (payload.state !== "COMPLETE") continue;

        const message = normalizeMessage(JSON.stringify(payload));
        message.lines.forEach((line) => terminalRef.current?.writeln(line));
        if (message.meta.length > 0) {
          appendSystemLog("info", message.meta.join(" | "));
        }
        terminalRef.current?.prompt();
        return;
      }

      terminalRef.current?.writeln(
        `\r\n${t("playground.page.log.commandTimeout")}`,
      );
      appendSystemLog("warning", t("playground.page.log.commandTimeout"));
      terminalRef.current?.prompt();
    },
    [appendSystemLog, t],
  );

  /**
   * Hold the selected agent in interactive mode with a resilient heartbeat.
   *
   * The pill is intentionally "sticky": a single failed beat or a one-off
   * non-interactive reading does not tear the session down, because the server
   * keeps the agent interactive for 60s (see /api/terminal/attach) and these
   * blips are usually transient. Only sustained failure downgrades the pill,
   * which keeps the connection from flickering connected⇄connecting⇄disconnected.
   */
  useEffect(() => {
    if (!paw) {
      setConnectionState("disconnected");
      return;
    }

    // Beat often enough that the 60s server window survives tab-throttling and
    // the odd dropped request, but not so often it hammers the DB.
    const BEAT_MS = 5_000;
    // How many consecutive bad beats we tolerate before downgrading the pill.
    const MISS_TOLERANCE = 3; // ~15s of silence before we call it dropped.
    const STALE_TOLERANCE = 2; // brief non-interactive dips stay "connected".

    let cancelled = false;
    let announcedConnected = false;
    let misses = 0; // consecutive failed beats
    let staleBeats = 0; // consecutive alive-but-not-interactive beats
    let timer: ReturnType<typeof setTimeout>;

    setConnectionState("connecting");
    appendSystemLog("info", t("playground.page.log.connecting", { id: paw }));

    const schedule = (delay: number) => {
      if (!cancelled) timer = setTimeout(beat, delay);
    };

    const beat = async () => {
      const result = await attach(paw, true);
      if (cancelled) return;

      // Transient failure: keep the last-known state until misses pile up.
      if (result === null) {
        misses += 1;
        if (misses >= MISS_TOLERANCE) setConnectionState("disconnected");
        schedule(BEAT_MS);
        return;
      }
      misses = 0;

      const { alive, interactive } = result;
      if (!alive) {
        staleBeats = 0;
        setConnectionState("disconnected");
      } else if (interactive) {
        // "connected": the agent is answering in ~1s. Commands run promptly.
        staleBeats = 0;
        setConnectionState("connected");
        if (!announcedConnected) {
          announcedConnected = true;
          appendSystemLog(
            "success",
            t("playground.page.log.connected", { id: paw }),
          );
          terminalRef.current?.prompt();
        }
      } else {
        // Alive but not yet (or momentarily not) interactive. Hold "connected"
        // through brief dips so the pill doesn't flicker; commands still queue
        // either way, so input stays enabled.
        staleBeats += 1;
        const holdConnected =
          connectionStateRef.current === "connected" &&
          staleBeats < STALE_TOLERANCE;
        setConnectionState(holdConnected ? "connected" : "connecting");
      }

      // Beat a little faster while still waking up so the pill flips promptly.
      schedule(announcedConnected ? BEAT_MS : 2_500);
    };

    void beat();

    // Re-establish immediately when the tab regains focus — background throttling
    // may have let a couple of beats slip while it was hidden.
    const onVisible = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        clearTimeout(timer);
        void beat();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      void attach(paw, false);
    };
  }, [paw, attach, appendSystemLog, t]);

  const handleSelectCommand = useCallback((command: string) => {
    terminalRef.current?.setCommand(command);
  }, []);

  /**
   * Run a command straight away — used by the "Run" action on each ability so
   * the operator can fire it at the agent without retyping. Echoes the command
   * onto the prompt line first so the terminal reads exactly as if it were
   * typed and entered.
   */
  const runCommand = useCallback(
    async (command: string) => {
      const term = terminalRef.current;
      // Allow queueing whenever the agent is reachable (connected or still
      // waking up); only a dead/errored session is refused.
      const state = connectionStateRef.current;
      if (state === "disconnected" || state === "error") {
        term?.writeln(`\r\n${t("playground.page.warnNotConnected")}`);
        term?.prompt();
        return;
      }
      term?.setCommand(command);
      term?.write("\r\n");
      await sendCommand(command);
    },
    [sendCommand, t],
  );

  return {
    terminalRef,
    connectionState,
    systemLogs,
    clearSystemLogs,
    sendCommand,
    runCommand,
    handleSelectCommand,
  };
}
