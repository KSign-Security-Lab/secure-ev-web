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
import PageHeader from "~/components/page/playground/PageHeader";
import SessionsList from "~/components/page/playground/SessionsList";
import SystemLogPanel from "~/components/page/playground/SystemLogPanel";

const TerminalView = dynamic(
  () =>
    import("~/components/page/playground/Terminal").then(
      (mod) => mod.TerminalView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-200">
          <span>
            Status:{" "}
            <strong className="font-semibold capitalize">loading</strong>
          </span>
        </div>
        <div className="h-[540px] w-full overflow-hidden rounded-md border border-slate-800 bg-black shadow-lg flex items-center justify-center">
          <p className="text-slate-400">Loading terminal...</p>
        </div>
      </div>
    ),
  }
);

type SessionsListResponse = RouterOutputs["sessions"]["list"];

type SystemLogEntry = {
  id: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: number;
};

export default function Playground() {
  const terminalRef = useRef<TerminalViewHandle | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef<boolean>(false);
  const activeSessionRef = useRef<number | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [sessionsData, setSessionsData] = useState<SessionsListResponse | null>(
    null
  );
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
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

  const disposeReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // Centralized fetch for sessions list
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionsError(null);
    try {
      const response = await trpc.sessions.list.query();
      setSessionsData(response);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessionsError(
        error instanceof Error ? error.message : "Failed to fetch sessions"
      );
      setSessionsData(null);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const disposeWebSocket = useCallback(() => {
    disposeReconnectTimer();
    shouldReconnectRef.current = false;
    const ws = wsRef.current;
    if (!ws) return;
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.close();
    }
    wsRef.current = null;
  }, [disposeReconnectTimer]);

  const connectWebSocket = useCallback(
    (sessionId?: number | null) => {
      disposeReconnectTimer();

      const baseUrl = process.env.NEXT_PUBLIC_TERMINAL_WS_URL?.trim();
      if (!baseUrl) {
        shouldReconnectRef.current = false;
        terminalRef.current?.writeln(
          "\r\n[error] NEXT_PUBLIC_TERMINAL_WS_URL is not configured."
        );
        setConnectionState("error");
        appendSystemLog(
          "error",
          "NEXT_PUBLIC_TERMINAL_WS_URL is not configured."
        );
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_DEFEND_API_KEY?.trim();

      if (typeof sessionId !== "undefined") {
        activeSessionRef.current = sessionId ?? null;
      }

      const targetSessionId =
        typeof sessionId === "number"
          ? sessionId
          : sessionId === null
          ? null
          : activeSessionRef.current;

      const normalizedBase = baseUrl.replace(/\/$/, "");
      const baseWithSession =
        typeof targetSessionId === "number"
          ? `${normalizedBase}/${targetSessionId}`
          : normalizedBase;
      let url = baseWithSession;
      if (apiKey) {
        try {
          const urlObj = new URL(baseWithSession);
          urlObj.searchParams.set("key", apiKey);
          url = urlObj.toString();
        } catch (error) {
          const separator = baseWithSession.includes("?") ? "&" : "?";
          url = `${baseWithSession}${separator}key=${encodeURIComponent(
            apiKey
          )}`;
        }
      }

      appendSystemLog(
        "info",
        `Connecting to ${
          typeof targetSessionId === "number"
            ? `session #${targetSessionId}`
            : "terminal"
        }...`
      );

      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        setConnectionState("connecting");

        ws.onopen = () => {
          shouldReconnectRef.current = false;
          setConnectionState("connected");
          appendSystemLog(
            "success",
            `Connected to ${
              typeof targetSessionId === "number"
                ? `session #${targetSessionId}`
                : "terminal"
            }.`
          );
          terminalRef.current?.prompt();
        };

        ws.onmessage = (event) => {
          const message = normalizeMessage(event.data);
          if (message.lines.length > 0) {
            message.lines.forEach((line) => terminalRef.current?.writeln(line));
          }
          if (message.meta.length > 0) {
            appendSystemLog("info", message.meta.join(" | "));
          }

          if (shouldReconnectRef.current) {
            let commandComplete = false;
            if (typeof event.data === "string") {
              try {
                const parsed = JSON.parse(event.data) as Record<
                  string,
                  unknown
                >;
                if (
                  parsed &&
                  typeof parsed === "object" &&
                  "status" in parsed
                ) {
                  commandComplete = true;
                }
              } catch {
                if (event.data.includes("exit status")) {
                  commandComplete = true;
                }
              }
            }

            if (
              !commandComplete &&
              (message.meta.some((meta) =>
                meta.toLowerCase().includes("exit status")
              ) ||
                message.lines.some((line) =>
                  line.toLowerCase().includes("exit status")
                ))
            ) {
              commandComplete = true;
            }

            if (commandComplete) {
              appendSystemLog(
                "info",
                "Command completed. Refreshing session..."
              );
              shouldReconnectRef.current = true;
              const currentWs = wsRef.current;
              if (currentWs && currentWs.readyState === WebSocket.OPEN) {
                currentWs.close(1000, "refresh");
              }
            }
          }
        };

        ws.onerror = (event) => {
          console.error("Terminal WebSocket error", event);
          terminalRef.current?.writeln(
            "\r\n[error] WebSocket connection encountered an error."
          );
          setConnectionState("error");
          appendSystemLog(
            "error",
            "WebSocket connection encountered an error."
          );
        };

        ws.onclose = (event) => {
          const isNormalClose = event.wasClean && event.code === 1000;
          const shouldReconnect = shouldReconnectRef.current || !isNormalClose;
          shouldReconnectRef.current = false;

          const reason =
            event.reason && event.reason.trim().length > 0
              ? event.reason
              : "(none)";
          const summary = `code=${event.code} clean=${event.wasClean} reason=${reason}`;

          if (shouldReconnect && !reconnectTimerRef.current) {
            appendSystemLog(
              isNormalClose ? "info" : "warning",
              `Connection closed (${summary}). Reconnecting...`
            );
            setConnectionState("connecting");
            reconnectTimerRef.current = setTimeout(() => {
              reconnectTimerRef.current = null;
              connectWebSocket(activeSessionRef.current ?? undefined);
            }, 150);
          } else {
            setConnectionState("disconnected");
            appendSystemLog(
              isNormalClose ? "info" : "warning",
              `Connection closed (${summary}).`
            );
          }
        };
      } catch (error) {
        console.error("Failed to create terminal WebSocket", error);
        shouldReconnectRef.current = false;
        terminalRef.current?.writeln(
          "\r\n[error] Failed to create WebSocket connection."
        );
        setConnectionState("error");
        appendSystemLog("error", "Failed to create WebSocket connection.");
      }
    },
    [appendSystemLog, disposeReconnectTimer]
  );

  const sendCommand = useCallback(
    (command: string) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        shouldReconnectRef.current = true;
        ws.send(command);
      } else {
        shouldReconnectRef.current = false;
        terminalRef.current?.writeln("\r\n[warn] WebSocket is not connected.");
        appendSystemLog(
          "warning",
          "Cannot send command: WebSocket is not connected."
        );
      }
    },
    [appendSystemLog]
  );

  const reconnect = useCallback(() => {
    disposeWebSocket();
    appendSystemLog("info", "Manual reconnect requested.");
    const sessionToUse =
      activeSessionRef.current ?? selectedSessionId ?? undefined;
    connectWebSocket(sessionToUse);
  }, [appendSystemLog, connectWebSocket, disposeWebSocket, selectedSessionId]);

  const handleSessionClick = useCallback(
    (sessionId: number) => {
      setSelectedSessionId(sessionId);
      disposeWebSocket();
      setTimeout(() => connectWebSocket(sessionId), 100);
    },
    [disposeWebSocket, connectWebSocket]
  );

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      await fetchSessions();
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [fetchSessions]);

  // Refresh handlers
  const handleRefreshSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="flex flex-col w-full rounded-xl">
      <div className="flex h-full w-full flex-col gap-4 p-4">
        <PageHeader
          connectionState={connectionState}
          selectedSessionId={selectedSessionId}
          onRefreshSessions={handleRefreshSessions}
          sessionsLoading={isLoadingSessions}
        />

        <div className="flex min-h-0 flex-1 gap-4">
          <div className="flex w-full flex-col lg:w-[360px]">
            <SessionsList
              data={sessionsData}
              isLoading={isLoadingSessions}
              error={sessionsError}
              selectedSessionId={selectedSessionId}
              onSelect={handleSessionClick}
            />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 xl:flex-row">
            <div className="flex min-h-0 flex-1">
              <TerminalView
                ref={terminalRef}
                connectionState={connectionState}
                sessionId={selectedSessionId}
                onCommand={sendCommand}
                onReconnect={reconnect}
              />
            </div>
            <SystemLogPanel
              logs={systemLogs}
              onClear={systemLogs.length > 0 ? clearSystemLogs : undefined}
              className="h-48 shrink-0 xl:h-full xl:w-[320px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
