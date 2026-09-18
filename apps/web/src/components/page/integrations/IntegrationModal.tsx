"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Copy, Loader2, Plug, RefreshCw, Terminal } from "lucide-react";
import { Modal } from "~/components/common/Modal/Modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";
import trpc, { type RouterOutputs } from "~/lib/trpc";

type Integration = RouterOutputs["integrations"]["list"][number];
type IntegrationMode = Integration["mode"];
type CollectedLog = RouterOutputs["integrations"]["logs"][number];
type InstallStep =
  RouterOutputs["integrations"]["installScript"]["steps"][number];

interface IntegrationModalProps {
  integration: Integration | null;
  onClose: () => void;
  onChanged: () => void;
}

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-red-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-slate-400",
  debug: "text-slate-600",
};

function formatTime(iso: string): string {
  return iso.replace("T", " ").slice(0, 19);
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  integration,
  onClose,
  onChanged,
}) => {
  const { t } = useI18n();
  const showToast = useToast();

  const [baseUrl, setBaseUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [steps, setSteps] = useState<InstallStep[] | null>(null);
  const [ingestUrl, setIngestUrl] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [logs, setLogs] = useState<CollectedLog[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [mode, setMode] = useState<IntegrationMode>("API");
  const [insecureTls, setInsecureTls] = useState(false);

  const adapterKey = integration?.adapterKey;

  // Key on the adapter, not the object identity: a background list refresh
  // (onChanged after generating the script) hands us a new object for the same
  // integration, and resetting on that would wipe the script we just showed.
  useEffect(() => {
    setBaseUrl(integration?.baseUrl ?? "");
    setSecret("");
    setSteps(null);
    setIngestUrl(null);
    setLogs([]);
    if (integration) {
      // API-capable products connect over API; the rest collect by agent.
      setMode(integration.supportedModes.includes("API") ? "API" : "AGENT");
      setInsecureTls(integration.insecureTls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapterKey]);

  const loadLogs = useCallback(async () => {
    if (!adapterKey) {
      return;
    }
    try {
      setLogs(await trpc.integrations.logs.query({ adapterKey }));
    } catch {
      setLogs([]);
    }
  }, [adapterKey]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (!integration) {
    return null;
  }

  const run = async (action: string, fn: () => Promise<string>) => {
    setBusy(action);
    try {
      showToast(await fn(), { type: "success" });
      onChanged();
      await loadLogs();
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), {
        type: "error",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleSave = () =>
    run("save", async () => {
      const result = await trpc.integrations.upsert.mutate({
        adapterKey: integration.adapterKey,
        mode,
        baseUrl: baseUrl.trim() || null,
        secret: secret.trim() || undefined,
        insecureTls,
      });
      setSecret("");
      return result.message;
    });

  const handleTest = () =>
    run("test", async () => {
      const result = await trpc.integrations.testConnection.mutate({
        adapterKey: integration.adapterKey,
      });
      if (!result.ok) {
        throw new Error(result.message);
      }
      return result.message;
    });

  const handleSync = () =>
    run("sync", async () => {
      const result = await trpc.integrations.sync.mutate({
        adapterKey: integration.adapterKey,
      });
      if (!result.ok) {
        throw new Error(result.message);
      }
      return result.message;
    });

  const handleScript = () =>
    run("script", async () => {
      const result = await trpc.integrations.installScript.mutate({
        adapterKey: integration.adapterKey,
      });
      setSteps(result.steps);
      setIngestUrl(result.ingestUrl);
      return t("integrations.modal.scriptGenerated");
    });

  // navigator.clipboard only exists in a secure context (HTTPS or localhost).
  // The BAS console is reached over HTTP on a LAN/Tailscale IP, where it is
  // undefined, so fall back to a hidden textarea + execCommand.
  const copyText = async (text: string, index: number) => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        ok = document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1500);
      showToast(t("integrations.modal.copied"), { type: "success" });
    } else {
      showToast(t("integrations.modal.copyFailed"), { type: "error" });
    }
  };

  const isApi = mode === "API";

  return (
    <Modal
      open={Boolean(integration)}
      onClose={onClose}
      title={`${integration.name} — ${integration.vendor}`}
      className="lg:max-w-[820px]"
    >
      {isApi ? (
        <div className="flex flex-col gap-4">
          {integration.requiresBaseUrl && (
            <div className="space-y-2">
              <Label htmlFor="integration-baseurl">
                {t("integrations.modal.endpoint")}
              </Label>
              <Input
                id="integration-baseurl"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder={integration.baseUrlExample ?? ""}
              />
            </div>
          )}

          {integration.requiresSecret && (
            <div className="space-y-2">
              <Label htmlFor="integration-secret">
                {t("integrations.modal.secret")}
              </Label>
              <Input
                id="integration-secret"
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder={
                  integration.secretMasked ??
                  t("integrations.modal.secretPlaceholder")
                }
              />
              <p className="text-xs text-slate-500">
                {t("integrations.modal.secretHint")}
              </p>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-300 select-none">
            <input
              type="checkbox"
              checked={insecureTls}
              onChange={(event) => setInsecureTls(event.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900"
            />
            {t("integrations.modal.insecureTls")}
          </label>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={busy !== null}>
              {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("integrations.modal.save")}
            </Button>
            <Button
              variant="tinted"
              onClick={handleTest}
              disabled={busy !== null || !integration.configured}
            >
              {busy === "test" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4" />
              )}
              {t("integrations.modal.test")}
            </Button>
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={busy !== null || !integration.configured}
            >
              {busy === "sync" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {t("integrations.modal.sync")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-400">
            {t("integrations.modal.agentHint")}
          </p>

          <Button
            variant="tinted"
            onClick={handleScript}
            disabled={busy !== null}
            className="self-start"
          >
            {busy === "script" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Terminal className="h-4 w-4" />
            )}
            {t("integrations.modal.generateScript")}
          </Button>

          {ingestUrl && (
            <p className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200/80">
              {t("integrations.modal.ingestUrlNotice", { url: ingestUrl })}
            </p>
          )}

          {steps && (
            <ol className="flex flex-col gap-5">
              {steps.map((step, index) => (
                <li key={index} className="space-y-2">
                  <p className="text-sm font-bold text-slate-100">
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.body}
                  </p>
                  <div className="relative">
                    <pre className="max-h-72 overflow-auto rounded-lg border border-slate-700/50 bg-slate-950/60 p-4 pr-24 text-xs font-mono text-slate-300 whitespace-pre">
                      {step.code}
                    </pre>
                    <Button
                      variant="outline"
                      onClick={() => copyText(step.code, index)}
                      className="absolute right-3 top-3 h-8 px-2"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedIndex === index
                        ? t("integrations.modal.copied")
                        : t("integrations.modal.copy")}
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {integration.lastError && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs font-mono text-red-300">
          {integration.lastError}
        </p>
      )}

      <div className="space-y-2">
        <Label>
          {t("integrations.modal.recentLogs")} ({logs.length})
        </Label>
        <div className="max-h-64 overflow-auto rounded-lg border border-slate-700/50 bg-slate-950/40 divide-y divide-slate-800/40">
          {logs.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">
              {t("integrations.modal.noLogs")}
            </p>
          ) : (
            logs.map((log) => (
              <details key={log.id} className="group p-3 text-xs">
                <summary className="flex cursor-pointer list-none gap-3">
                  <span
                    className="shrink-0 font-mono text-slate-500 tabular-nums"
                    title={t("integrations.modal.receivedAt", {
                      time: formatTime(log.collectedAt),
                    })}
                  >
                    {formatTime(log.occurredAt ?? log.collectedAt)}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 w-14 font-mono uppercase",
                      SEVERITY_CLASS[log.severity ?? ""] ?? "text-slate-500"
                    )}
                  >
                    {log.severity ?? "-"}
                  </span>
                  <span className="shrink-0 max-w-40 truncate font-mono text-blue-400/70">
                    {log.source}
                  </span>
                  <span className="text-slate-300 break-all line-clamp-2 group-open:line-clamp-none">
                    {log.message}
                  </span>
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded border border-slate-800/60 bg-slate-950/60 p-2 text-[11px] text-slate-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(log.raw, null, 2)}
                </pre>
              </details>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
