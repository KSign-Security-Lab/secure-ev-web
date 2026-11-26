"use client";

import { useState, useEffect, useCallback } from "react";
import { Rocket } from "lucide-react";
import { AgentsTable } from "~/components/page/agents/AgentsTable";
import { DeployAgentModal } from "~/components/page/agents/DeployAgentModal";
import { ConfirmationDialog } from "~/components/common/ConfirmationDialog/ConfirmationDialog";
import { AgentTerminalPanel } from "~/components/page/playground/AgentTerminalPanel";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { cn } from "~/lib/utils";

export type AgentsListResponse = RouterOutputs["agents"]["list"];
type AgentRow = AgentsListResponse[number];

/**
 * Poll a queued instruction until the agent has picked it up (SENT) or finished
 * it (COMPLETE). A self-kill never reports back — the process is gone — so
 * delivery is the signal. Deleting the agent row cascades the queued
 * instruction away, so we must not delete before delivery. Returns whether the
 * instruction was delivered within the timeout.
 */
async function waitForDelivery(id: string, timeoutMs: number): Promise<boolean> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const res = await fetch(
        `/api/terminal/result?id=${encodeURIComponent(id)}`,
      );
      if (res.ok) {
        const payload = (await res.json()) as { state?: string };
        if (payload.state === "SENT" || payload.state === "COMPLETE") return true;
      }
    } catch {
      // Keep polling until the timeout.
    }
  }
  return false;
}

export default function Agents() {
  const { t } = useI18n();
  const showToast = useToast();
  const [data, setData] = useState<AgentsListResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeployOpen, setIsDeployOpen] = useState<boolean>(false);
  // The agent queued for termination (kill + remove), awaiting confirmation.
  const [pendingTerminate, setPendingTerminate] = useState<AgentRow | null>(null);
  const [isActing, setIsActing] = useState<boolean>(false);
  // The agent whose terminal is open. `panelAgent` lags `selectedAgent` so the
  // panel keeps its contents while it animates closed.
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);
  const [panelAgent, setPanelAgent] = useState<AgentRow | null>(null);
  const isPanelOpen = selectedAgent !== null;

  const openTerminal = useCallback((agent: AgentRow) => {
    setSelectedAgent(agent);
    setPanelAgent(agent);
  }, []);

  const closePanel = useCallback(() => setSelectedAgent(null), []);

  // Esc closes the terminal, unless focus is inside it (Esc belongs to the
  // terminal/autocomplete there).
  useEffect(() => {
    if (!isPanelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.activeElement?.closest("[data-agent-terminal]")) return;
      closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPanelOpen, closePanel]);

  const fetchAgents = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await trpc.agents.list.query();
      setData(response);
    } catch {
      if (!silent) setData(undefined);
    } finally {
      if (!silent) {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    }
  }, []);

  useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  // Close the terminal if its agent is gone (e.g. after a remove/refresh).
  useEffect(() => {
    if (!selectedAgent || !data) return;
    if (!data.some((a) => a.paw === selectedAgent.paw)) setSelectedAgent(null);
  }, [data, selectedAgent]);

  const hostOf = (agent: AgentRow) => agent.host || agent.paw;

  /**
   * Terminate an agent: kill the live implant so it can't re-register, then
   * delete the row. We wait for the kill to land before deleting because the
   * delete cascades the queued instruction away. A missing PID means we can't
   * target the process, so we just remove the (dead) row.
   */
  const confirmTerminate = useCallback(async () => {
    if (!pendingTerminate) return;
    const agent = pendingTerminate;
    const host = hostOf(agent);
    setIsActing(true);
    try {
      const kill = await trpc.agents.kill.mutate({ paw: agent.paw });
      if (kill.queued && kill.instructionId) {
        // Wait about one beacon for the agent to pick the kill up.
        const timeoutMs = Math.min(60_000, Math.max(8_000, (agent.sleep_max + 5) * 1000));
        const delivered = await waitForDelivery(kill.instructionId, timeoutMs);
        // A live agent that has not picked the kill up yet must keep its row,
        // or the queued kill is deleted with it and the agent re-registers.
        // An agent that has stopped beaconing can be removed straight away.
        if (!delivered && agent.trusted) {
          showToast(t("agents.terminate.pending", { host }), { type: "info" });
          setPendingTerminate(null);
          return;
        }
      }
      await trpc.agents.remove.mutate({ paw: agent.paw });
      showToast(t("agents.terminate.done", { host }), { type: "success" });
      setPendingTerminate(null);
      if (selectedAgent?.paw === agent.paw) setSelectedAgent(null);
      await fetchAgents({ silent: true });
    } catch {
      showToast(t("agents.terminate.failed", { host }), { type: "error" });
    } finally {
      setIsActing(false);
    }
  }, [pendingTerminate, selectedAgent, fetchAgents, showToast, t]);

  const dialogHost = pendingTerminate ? hostOf(pendingTerminate) : "";

  return (
    <div className="flex flex-col w-full gap-4">
      <PageHeader
        title={t("agents.page.title")}
        subtitle={t("agents.page.subtitle")}
        badge={t("common.badge.playground")}
        actions={
          <button
            onClick={() => setIsDeployOpen(true)}
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            <Rocket className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            {t("agents.page.deploy")}
          </button>
        }
      />

      {/* The whole two-pane area is bounded to the viewport, so neither the list
          nor the terminal can grow unbounded; both just fill this box. */}
      <div className="flex min-w-0 items-stretch gap-4 h-[calc(100dvh-13rem)] min-h-[440px]">
        {/* The table squeezes to a slim column as the terminal opens so the
            terminal becomes the main surface. On small screens it steps aside
            entirely and the screen becomes the terminal. It has a fixed height
            (fills this box) and scrolls internally with pagination pinned. */}
        <div
          className={cn(
            "h-full min-h-0 min-w-0 transition-all duration-300 ease-in-out",
            isPanelOpen
              ? "max-lg:hidden lg:w-[440px] lg:flex-none"
              : "flex-1",
          )}
        >
          <AgentsTable
            data={data || []}
            isLoading={isLoading}
            compact={isPanelOpen}
            onDeploy={() => setIsDeployOpen(true)}
            onOpenTerminal={openTerminal}
            onRowClick={openTerminal}
            onTerminate={(agent) => setPendingTerminate(agent)}
            selectedPaw={selectedAgent?.paw ?? null}
          />
        </div>

        {/* Terminal grows in from the right and takes the remaining width. It
            fills this bounded box, so its height tracks the viewport and never
            runs away. xterm refits via its own ResizeObserver. */}
        <div
          data-agent-terminal
          onTransitionEnd={(e) => {
            if (e.propertyName === "opacity" && !isPanelOpen) setPanelAgent(null);
          }}
          className={cn(
            "h-full min-h-0 overflow-hidden transition-all duration-300 ease-in-out",
            isPanelOpen
              ? "min-w-0 flex-1 opacity-100"
              : "pointer-events-none w-0 flex-none opacity-0",
          )}
        >
          <div className="h-full w-full">
            {panelAgent && (
              <AgentTerminalPanel
                key={panelAgent.paw}
                paw={panelAgent.paw}
                host={panelAgent.host}
                onClose={closePanel}
              />
            )}
          </div>
        </div>
      </div>

      <DeployAgentModal
        open={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        onAgentDeployed={() => fetchAgents({ silent: true })}
      />

      <ConfirmationDialog
        open={pendingTerminate !== null}
        onOpenChange={(open) => {
          if (!open && !isActing) setPendingTerminate(null);
        }}
        onConfirm={() => void confirmTerminate()}
        isLoading={isActing}
        variant="danger"
        title={t("agents.terminate.title", { host: dialogHost })}
        description={t("agents.terminate.description", { host: dialogHost })}
        confirmText={t("agents.terminate.confirm")}
      />
    </div>
  );
}
