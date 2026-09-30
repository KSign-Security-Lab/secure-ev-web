"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import trpc from "~/lib/trpc";
import type { RouterOutputs } from "~/lib/trpc";
import type {
  TerminalViewHandle,
  ConnectionState,
} from "~/components/page/playground/Terminal";
import { normalizeMessage } from "~/components/page/playground/Terminal/utils";
import { PageHeader as CommonPageHeader } from "~/components/common/PageHeader/PageHeader";
import ConnectionPill from "~/components/page/playground/ConnectionPill";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import SessionsList from "~/components/page/playground/SessionsList";
import SystemLogPanel from "~/components/page/playground/SystemLogPanel";
import { CommandFilterDropdown } from "~/components/page/playground/CommandFilterDropdown";
import { useI18n } from "~/i18n/I18nProvider";

function TerminalLoadingFallback() {
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700">
        <span>{t("playground.page.dynamic.statusLoading")}</span>
      </div>
      <div className="h-[540px] w-full overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 shadow-sm flex items-center justify-center">
        <p className="text-neutral-400">{t("playground.page.dynamic.loadingTerminal")}</p>
      </div>
    </div>
  );
}

const TerminalView = dynamic(
  () =>
    import("~/components/page/playground/Terminal").then(
      (mod) => mod.TerminalView
    ),
  {
    ssr: false,
    loading: () => <TerminalLoadingFallback />,
  }
);

type SessionsListResponse = RouterOutputs["sessions"]["list"];

type SystemLogEntry = {
  id: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: number;
};

export default function AgentTerminal() {
  const { t } = useI18n();
  const terminalRef = useRef<TerminalViewHandle | null>(null);
  const selectedSessionIdRef = useRef<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [sessionsData, setSessionsData] = useState<SessionsListResponse | null>(
    null
  );
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);

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
        return next.length > 50 ? next.slice(next.length - 50) : next;
      });
    },
    []
  );

  const clearSystemLogs = useCallback(() => {
    setSystemLogs([]);
  }, []);

  // Centralized fetch for sessions list
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionsError(null);
    try {
      const response = await trpc.sessions.list.query();
      setSessionsData(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch sessions:", error);
      setSessionsError(
        error instanceof Error ? error.message : t("playground.page.errorFetchSessions")
      );
      setSessionsData(null);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [t]);

  /**
   * Commands no longer ride a socket. They are queued for the agent and picked
   * up on its next beacon — which is ~1s while this page holds the agent in
   * interactive mode via /api/terminal/attach.
   */
  const POLL_INTERVAL_MS = 500;
  const POLL_TIMEOUT_MS = 90_000;

  const attach = useCallback(async (paw: string, attached: boolean) => {
    try {
      const response = await fetch("/api/terminal/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paw, attached }),
      });
      if (!response.ok) return { alive: false, interactive: false };
      return (await response.json()) as { alive: boolean; interactive: boolean };
    } catch {
      return { alive: false, interactive: false };
    }
  }, []);

  const sendCommand = useCallback(
    async (command: string) => {
      const paw = selectedSessionIdRef.current;
      if (!paw) {
        terminalRef.current?.writeln(
          `\r\n${t("playground.page.warnNoSession")}`
        );
        return;
      }

      appendSystemLog("info", t("playground.page.log.command", { command }));

      let instructionId: string;
      try {
        const response = await fetch("/api/terminal/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paw, command }),
        });
        if (!response.ok) throw new Error(await response.text());
        ({ instructionId } = (await response.json()) as { instructionId: string });
      } catch (error) {
        terminalRef.current?.writeln(
          `\r\n${t("playground.page.warnNotConnected")}`
        );
        appendSystemLog(
          "error",
          error instanceof Error ? error.message : t("playground.page.log.cannotSend")
        );
        terminalRef.current?.prompt();
        return;
      }

      const startedAt = Date.now();
      while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

        // The operator switched agents mid-flight; stop reporting on this one.
        if (selectedSessionIdRef.current !== paw) return;

        let payload: { state?: string } & Record<string, unknown>;
        try {
          const response = await fetch(
            `/api/terminal/result?id=${encodeURIComponent(instructionId)}`
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

      terminalRef.current?.writeln(`\r\n${t("playground.page.log.commandTimeout")}`);
      appendSystemLog("warning", t("playground.page.log.commandTimeout"));
      terminalRef.current?.prompt();
    },
    [appendSystemLog, t]
  );

  const handleSessionClick = useCallback(
    (paw: string) => {
      const previous = selectedSessionIdRef.current;
      if (previous && previous !== paw) void attach(previous, false);

      selectedSessionIdRef.current = paw;
      setSelectedSessionId(paw);
      setConnectionState("connecting");
      appendSystemLog("info", t("playground.page.log.connecting", { id: paw }));
    },
    [attach, appendSystemLog, t]
  );

  // Keep ref in sync with state
  useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId;
  }, [selectedSessionId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * Hold the selected agent in interactive mode. The heartbeat is well inside
   * the server's 30s window, so an abandoned tab releases the agent on its own.
   */
  useEffect(() => {
    if (!selectedSessionId) {
      setConnectionState("disconnected");
      return;
    }

    let cancelled = false;
    let firstBeat = true;

    const beat = async () => {
      const { alive, interactive } = await attach(selectedSessionId, true);
      if (cancelled) return;

      // "connected" means the agent has actually picked up the 1s beacon; until
      // then it is still finishing its previous sleep, so stay on "connecting".
      setConnectionState(alive && interactive ? "connected" : "connecting");

      if (alive && firstBeat) {
        firstBeat = false;
        appendSystemLog(
          "success",
          t("playground.page.log.connected", { id: selectedSessionId })
        );
        terminalRef.current?.prompt();
      }
    };

    void beat();
    const timer = setInterval(beat, 10_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      void attach(selectedSessionId, false);
    };
  }, [selectedSessionId, attach, appendSystemLog, t]);

  // Refresh handlers
  const handleRefreshSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  // Handle command selection from filter
  const handleSelectCommand = useCallback((command: string) => {
    // Set command in terminal input buffer
    if (terminalRef.current) {
      terminalRef.current.setCommand(command);
    }
  }, []);

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0 w-full flex-col gap-6 overflow-hidden">
        <div className="shrink-0">
          <CommonPageHeader
            title={t("playground.header.title")}
            subtitle={t("playground.header.subtitle")}
            badge="Playground"
            actions={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-2">
                  <ConnectionPill state={connectionState} />
                  {selectedSessionId ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {t("playground.header.sessionSelected", {
                        id: selectedSessionId,
                      })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-500 ring-1 ring-inset ring-neutral-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                      {t("playground.header.noSessionSelected")}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshSessions}
                  disabled={isLoadingSessions}
                  className="gap-2 border-neutral-200 hover:bg-neutral-100 text-xs font-medium"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSessions ? "animate-spin" : ""}`} />
                  {t("common.refresh")}
                </Button>
              </div>
            }
          />
        </div>

        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <div className="flex w-full flex-col lg:w-[360px] min-h-0 max-h-full overflow-hidden">
            <SessionsList
              data={sessionsData}
              isLoading={isLoadingSessions}
              error={sessionsError}
              selectedSessionId={selectedSessionId}
              onSelect={handleSessionClick}
            />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 xl:flex-row overflow-hidden">
            <div className="flex min-h-0 flex-1 max-h-full flex-col gap-3 overflow-hidden">
              <div className="shrink-0">
                <CommandFilterDropdown
                  onSelectCommand={handleSelectCommand}
                  disabled={!selectedSessionId}
                />
              </div>
              <div className="flex min-h-0 flex-1 overflow-hidden">
                <TerminalView
                  ref={terminalRef}
                  connectionState={connectionState}
                  sessionId={selectedSessionId}
                  onCommand={sendCommand}
                />
              </div>
            </div>
            <div className="flex min-h-0 flex-1 xl:flex-none xl:w-[320px] max-h-full overflow-hidden h-full flex-col">
              <SystemLogPanel
                logs={systemLogs}
                onClear={systemLogs.length > 0 ? clearSystemLogs : undefined}
                className="h-full w-full flex-1 min-h-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
