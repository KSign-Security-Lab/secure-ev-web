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
import { CommandFilterDropdown } from "~/components/page/playground/CommandFilterDropdown";

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

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeWebSocket = useCallback(() => {
    clearReconnectTimer();
    const ws = wsRef.current;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close();
      wsRef.current = null;
    }
  }, [clearReconnectTimer]);

  const connectWebSocket = useCallback(
    (sessionId?: number | null) => {
      closeWebSocket();

      const baseUrl = process.env.NEXT_PUBLIC_TERMINAL_WS_URL?.trim() || "";
      const apiKey = process.env.NEXT_PUBLIC_DEFEND_API_KEY?.trim() || "";

      const normalizedBase = baseUrl.replace(/\/$/, "");
      const baseWithSession = sessionId
        ? `${normalizedBase}/${sessionId}`
        : normalizedBase;
      let url = baseWithSession;
      if (apiKey) {
        try {
          const urlObj = new URL(baseWithSession);
          urlObj.searchParams.set("key", apiKey);
          url = urlObj.toString();
        } catch {
          const separator = baseWithSession.includes("?") ? "&" : "?";
          url = `${baseWithSession}${separator}key=${encodeURIComponent(
            apiKey
          )}`;
        }
      }

      appendSystemLog(
        "info",
        `Connecting to ${sessionId ? `session #${sessionId}` : "terminal"}...`
      );
      setConnectionState("connecting");

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState("connected");
        appendSystemLog(
          "success",
          `Connected to ${sessionId ? `session #${sessionId}` : "terminal"}.`
        );
        terminalRef.current?.prompt();
      };

      ws.onmessage = (event) => {
        const message = normalizeMessage(event.data);
        message.lines.forEach((line) => terminalRef.current?.writeln(line));
        if (message.meta.length > 0) {
          appendSystemLog("info", message.meta.join(" | "));
        }
      };

      ws.onerror = (event) => {
        console.error("Terminal WebSocket error", event);
        setConnectionState("error");
        appendSystemLog("error", "Connection error.");
      };

      ws.onclose = () => {
        wsRef.current = null;
        setConnectionState("disconnected");
        appendSystemLog("warning", "Connection closed. Reconnecting...");
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connectWebSocket(sessionId ?? selectedSessionId ?? undefined);
        }, 1000);
      };
    },
    [appendSystemLog, closeWebSocket, selectedSessionId]
  );

  const sendCommand = useCallback(
    (command: string) => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(command);
        appendSystemLog("info", `Command: ${command}`);
      } else {
        terminalRef.current?.writeln(
          "\r\n[warn] Not connected. Use the Reconnect button."
        );
        appendSystemLog(
          "warning",
          "Cannot send command: terminal is disconnected."
        );
      }
    },
    [appendSystemLog]
  );

  const reconnect = useCallback(() => {
    connectWebSocket(selectedSessionId ?? undefined);
  }, [connectWebSocket, selectedSessionId]);

  const handleSessionClick = useCallback(
    (sessionId: number) => {
      setSelectedSessionId(sessionId);
      connectWebSocket(sessionId);
    },
    [connectWebSocket]
  );

  useEffect(() => {
    fetchSessions();
    connectWebSocket();
    return () => {
      closeWebSocket();
    };
  }, [fetchSessions, connectWebSocket, closeWebSocket]);

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
      <div className="flex flex-1 min-h-0 w-full flex-col gap-4 p-4 overflow-hidden">
        <div className="shrink-0">
          <PageHeader
            connectionState={connectionState}
            selectedSessionId={selectedSessionId}
            onRefreshSessions={handleRefreshSessions}
            onReconnect={reconnect}
            sessionsLoading={isLoadingSessions}
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
                <CommandFilterDropdown onSelectCommand={handleSelectCommand} />
              </div>
              <div className="flex min-h-0 flex-1 overflow-hidden">
                <TerminalView
                  ref={terminalRef}
                  connectionState={connectionState}
                  sessionId={selectedSessionId}
                  onCommand={sendCommand}
                  onReconnect={reconnect}
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
