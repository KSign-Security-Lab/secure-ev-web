"use client";

import dynamic from "next/dynamic";
import { X } from "lucide-react";
import ConnectionPill from "~/components/page/playground/ConnectionPill";
import SystemLogPanel from "~/components/page/playground/SystemLogPanel";
import { CommandFilterDropdown } from "~/components/page/playground/CommandFilterDropdown";
import { useAgentTerminal } from "~/components/page/playground/useAgentTerminal";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";

// xterm needs `window`, so the terminal is client-only.
const TerminalView = dynamic(
  () =>
    import("~/components/page/playground/Terminal").then(
      (mod) => mod.TerminalView,
    ),
  {
    ssr: false,
    loading: () => <TerminalLoadingFallback />,
  },
);

function TerminalLoadingFallback() {
  const { t } = useI18n();
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-sm text-neutral-400">
      {t("playground.page.dynamic.loadingTerminal")}
    </div>
  );
}

interface AgentTerminalPanelProps {
  /** Agent to attach to; the panel is expected to render only when set. */
  paw: string;
  /** Human-readable host label for the header. */
  host?: string | null;
  onClose: () => void;
  className?: string;
}

/**
 * Self-contained live terminal for a single agent: connection header, command
 * picker, interactive terminal and system log. Attaching/polling lives in
 * {@link useAgentTerminal}.
 */
export function AgentTerminalPanel({
  paw,
  host,
  onClose,
  className,
}: AgentTerminalPanelProps) {
  const { t } = useI18n();
  const {
    terminalRef,
    connectionState,
    systemLogs,
    clearSystemLogs,
    sendCommand,
    runCommand,
    handleSelectCommand,
  } = useAgentTerminal(paw);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm",
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-neutral-900">
            {host || paw}
          </span>
          <span className="truncate font-mono text-xs text-neutral-400">
            {paw}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ConnectionPill state={connectionState} />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="shrink-0">
        <CommandFilterDropdown
          onSelectCommand={handleSelectCommand}
          onRunCommand={runCommand}
          disabled={!paw}
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <TerminalView
          ref={terminalRef}
          connectionState={connectionState}
          sessionId={paw}
          onCommand={sendCommand}
        />
      </div>

      <SystemLogPanel
        logs={systemLogs}
        onClear={systemLogs.length > 0 ? clearSystemLogs : undefined}
        className="w-full"
      />
    </div>
  );
}

export default AgentTerminalPanel;
