"use client";

import React from "react";
import { AlertTriangle, Download, Loader2, Rocket, X } from "lucide-react";
import { Modal } from "~/components/common/Modal/Modal";
import { EmptyState } from "~/components/common/EmptyState/EmptyState";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { cn } from "~/lib/utils";
import { extractPlaceholders, substitute } from "~/utils/deployCommand";
import { CommandBlock } from "./CommandBlock";
import { VariationsList } from "./VariationsList";
import { DeployFields } from "./DeployFields";
import { CallbackWatcher } from "./CallbackWatcher";
import { AgentConfigPanel, type AgentConfig } from "./AgentConfigPanel";
import { PLATFORM_GLYPHS } from "./platformIcons";

type DeployResponse = RouterOutputs["agents"]["deployCommands"];
type Deployment = DeployResponse["deployments"][number];
type Platform = Deployment["platform"];
type Tab = "deploy" | "config";

/** darwin ships separate AMD64 and ARM64 binaries. */
const ARCHITECTURES = ["amd64", "arm64"] as const;

interface DeployAgentModalProps {
  open: boolean;
  onClose: () => void;
  /** Lets the Agents table refresh once an agent checks in. */
  onAgentDeployed?: () => void;
}

export const DeployAgentModal: React.FC<DeployAgentModalProps> = ({
  open,
  onClose,
  onAgentDeployed,
}) => {
  const { t } = useI18n();
  const showToast = useToast();

  const [deployData, setDeployData] = React.useState<DeployResponse | null>(null);
  const [agentConfig, setAgentConfig] = React.useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [tab, setTab] = React.useState<Tab>("deploy");
  const [platform, setPlatform] = React.useState<Platform>("linux");
  const [architecture, setArchitecture] =
    React.useState<(typeof ARCHITECTURES)[number]>("amd64");
  const [fieldValues, setFieldValues] = React.useState<Record<string, string>>({});

  const [knownPaws, setKnownPaws] = React.useState<Set<string>>(new Set());
  const [armed, setArmed] = React.useState(false);
  const [watchNonce, setWatchNonce] = React.useState(0);
  const [isDownloadingBinary, setIsDownloadingBinary] = React.useState(false);

  const loadDeployCommands = React.useCallback(async () => {
    const data = await trpc.agents.deployCommands.query();
    setDeployData(data);
    return data;
  }, []);

  // Load everything the modal needs the first time it opens.
  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const load = async () => {
      try {
        const [deploy, config, agents] = await Promise.all([
          trpc.agents.deployCommands.query(),
          trpc.agents.config.query(),
          trpc.agents.list.query(),
        ]);
        if (cancelled) return;

        setDeployData(deploy);
        setAgentConfig(config);
        setKnownPaws(new Set(agents.map((agent) => agent.paw)));

        if (deploy.deployments.length > 0) {
          setPlatform(deploy.deployments[0].platform);
        }
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Reset the watch whenever the modal is dismissed.
  React.useEffect(() => {
    if (open) return;
    setArmed(false);
    setTab("deploy");
  }, [open]);

  const deployments = React.useMemo(
    () => deployData?.deployments ?? [],
    [deployData]
  );
  const appConfig = React.useMemo(
    () => deployData?.appConfig ?? {},
    [deployData]
  );

  /**
   * Placeholders are collected across every platform, not just the selected one,
   * so edits survive switching tabs.
   */
  const fields = React.useMemo(
    () =>
      extractPlaceholders(
        deployments.flatMap((deployment) => [
          deployment.command,
          ...deployment.variations.map((variation) => variation.command),
        ])
      ),
    [deployments]
  );

  const fieldDefaults = React.useMemo(() => {
    const defaults: Record<string, string> = {};
    for (const field of fields) defaults[field] = appConfig[field] ?? "";
    return defaults;
  }, [fields, appConfig]);

  // Seed the editable values once the defaults are known.
  React.useEffect(() => {
    setFieldValues(fieldDefaults);
  }, [fieldDefaults]);

  const active = deployments.find((item) => item.platform === platform);

  const handleCommandTaken = React.useCallback(() => setArmed(true), []);

  const handleDownloadBinary = async () => {
    setIsDownloadingBinary(true);
    try {
      const params = new URLSearchParams({ platform });
      if (platform === "darwin") params.set("architecture", architecture);

      const extensions = fieldValues["agent.extensions"]?.trim();
      if (extensions) params.set("extensions", extensions);

      const response = await fetch(`/api/agent/download?${params}`);
      if (!response.ok) throw new Error(await response.text());

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        platform === "windows" ? "sandcat.exe" : `sandcat-${platform}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      handleCommandTaken();
    } catch {
      showToast(t("deploy.binary.failed"), { type: "error" });
    } finally {
      setIsDownloadingBinary(false);
    }
  };

  const handleAgentFound = React.useCallback(() => {
    onAgentDeployed?.();
  }, [onAgentDeployed]);

  const handleConfigSaved = React.useCallback(
    async (config: AgentConfig) => {
      setAgentConfig(config);
      // `implant_name` is the default for `#{agents.implant_name}`.
      try {
        await loadDeployCommands();
      } catch {
        // The saved config still stands; the commands refresh on next open.
      }
    },
    [loadDeployCommands]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      className="max-w-4xl bg-slate-900 border border-slate-800 shadow-2xl p-0! overflow-hidden [&>div:first-child]:hidden space-y-0!"
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
              <Rocket className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-white">
                {t("deploy.modal.title")}
              </h2>
              <p className="text-xs text-slate-500">
                {t("deploy.modal.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("deploy.modal.close")}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(["deploy", "config"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "px-4 py-2 rounded-t-lg text-[11px] font-bold uppercase tracking-widest transition-colors",
                tab === value
                  ? "bg-slate-800/60 text-white"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t(value === "deploy" ? "deploy.tab.deploy" : "deploy.tab.config")}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
          {isLoading && (
            <p className="flex items-center gap-2 text-xs text-slate-500 py-8 justify-center">
              <Loader2 size={14} className="animate-spin" />
              {t("deploy.state.loading")}
            </p>
          )}

          {!isLoading && loadError && (
            <EmptyState
              icon={AlertTriangle}
              title={t("deploy.state.errorTitle")}
              description={loadError}
            />
          )}

          {!isLoading && !loadError && tab === "deploy" && (
            deployments.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title={t("deploy.state.emptyTitle")}
                description={t("deploy.state.emptyDescription")}
              />
            ) : (
              <>
                {/* Platform tiles */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {t("deploy.platform.label")}
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {deployments.map((deployment) => {
                      const Glyph = PLATFORM_GLYPHS[deployment.platform];
                      const selected = deployment.platform === platform;
                      return (
                        <button
                          key={deployment.platform}
                          type="button"
                          onClick={() => setPlatform(deployment.platform)}
                          aria-pressed={selected}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all duration-200",
                            selected
                              ? "border-blue-500/50 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                              : "border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                          )}
                        >
                          {Glyph && <Glyph className="w-6 h-6" />}
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {t(`deploy.platform.${deployment.platform}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <DeployFields
                  fields={fields}
                  values={fieldValues}
                  defaults={fieldDefaults}
                  onChange={(field, value) =>
                    setFieldValues((current) => ({ ...current, [field]: value }))
                  }
                />

                {active && (
                  <>
                    <CommandBlock
                      platform={active.platform}
                      executor={active.executor}
                      description={active.description}
                      command={substitute(active.command, fieldValues)}
                      onCommandTaken={handleCommandTaken}
                    />

                    <VariationsList
                      platform={active.platform}
                      executor={active.executor}
                      variations={active.variations.map((variation) => ({
                        description: variation.description,
                        command: substitute(variation.command, fieldValues),
                      }))}
                      onCommandTaken={handleCommandTaken}
                    />

                    {/* Direct binary download */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          {t("deploy.binary.label")}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {t("deploy.binary.description")}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {platform === "darwin" && (
                          <div className="flex items-center gap-1">
                            {ARCHITECTURES.map((arch) => (
                              <button
                                key={arch}
                                type="button"
                                onClick={() => setArchitecture(arch)}
                                className={cn(
                                  "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors",
                                  architecture === arch
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-500 hover:text-slate-300"
                                )}
                              >
                                {arch}
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleDownloadBinary}
                          disabled={isDownloadingBinary}
                          className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isDownloadingBinary ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          {isDownloadingBinary
                            ? t("deploy.binary.downloading")
                            : t("deploy.binary.download")}
                        </button>
                      </div>
                    </div>

                    <CallbackWatcher
                      knownPaws={knownPaws}
                      armed={armed}
                      watchNonce={watchNonce}
                      onAgentFound={handleAgentFound}
                      onRearm={() => setWatchNonce((value) => value + 1)}
                    />
                  </>
                )}
              </>
            )
          )}

          {!isLoading && !loadError && tab === "config" && agentConfig && (
            <AgentConfigPanel
              config={agentConfig}
              onSaved={handleConfigSaved}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
