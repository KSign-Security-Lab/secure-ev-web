"use client";

import React from "react";
import { Loader2, Save } from "lucide-react";
import { Input } from "~/components/ui/input";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";

export type AgentConfig = RouterOutputs["agents"]["config"];

type Draft = {
  implant_name: string;
  sleep_min: string;
  sleep_max: string;
  watchdog: string;
  untrusted_timer: string;
};

const toDraft = (config: AgentConfig): Draft => ({
  implant_name: config.implant_name,
  sleep_min: String(config.sleep_min),
  sleep_max: String(config.sleep_max),
  watchdog: String(config.watchdog),
  untrusted_timer: String(config.untrusted_timer),
});

const NUMERIC_FIELDS = [
  "sleep_min",
  "sleep_max",
  "watchdog",
  "untrusted_timer",
] as const;

interface AgentConfigPanelProps {
  config: AgentConfig;
  /** Called after a successful save — the implant name feeds the deploy commands. */
  onSaved: (config: AgentConfig) => void;
}

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  config,
  onSaved,
}) => {
  const { t } = useI18n();
  const showToast = useToast();
  const [draft, setDraft] = React.useState<Draft>(() => toDraft(config));
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setDraft(toDraft(config));
  }, [config]);

  const set = (key: keyof Draft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // Same rules Caldera enforces in its own ConfigModal.
  const validate = (): string | null => {
    if (!draft.implant_name.trim()) return t("deploy.config.errImplant");

    for (const field of NUMERIC_FIELDS) {
      const value = Number(draft[field]);
      if (!Number.isInteger(value) || value < 0) {
        return t("deploy.config.errNegative");
      }
    }

    if (Number(draft.sleep_min) > Number(draft.sleep_max)) {
      return t("deploy.config.errBeacon");
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setIsSaving(true);
    try {
      const saved = await trpc.agents.updateConfig.mutate({
        implant_name: draft.implant_name.trim(),
        sleep_min: Number(draft.sleep_min),
        sleep_max: Number(draft.sleep_max),
        watchdog: Number(draft.watchdog),
        untrusted_timer: Number(draft.untrusted_timer),
      });
      showToast(t("deploy.config.saved"), { type: "success" });
      onSaved(saved);
    } catch {
      showToast(t("deploy.config.saveFailed"), { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const numericField = (key: (typeof NUMERIC_FIELDS)[number], label: string) => (
    <div className="space-y-1.5">
      <label
        htmlFor={`agent-config-${key}`}
        className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
      >
        {label}
      </label>
      <Input
        id={`agent-config-${key}`}
        type="number"
        min={0}
        step={1}
        value={draft[key]}
        onChange={(event) => set(key, event.target.value)}
        className="font-mono text-xs"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-tight text-white">
          {t("deploy.config.title")}
        </h3>
        <p className="text-xs text-slate-500">{t("deploy.config.description")}</p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="agent-config-implant"
          className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
        >
          {t("deploy.config.implantName")}
        </label>
        <Input
          id="agent-config-implant"
          value={draft.implant_name}
          spellCheck={false}
          onChange={(event) => set("implant_name", event.target.value)}
          className="font-mono text-xs"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {numericField("sleep_min", t("deploy.config.sleepMin"))}
        {numericField("sleep_max", t("deploy.config.sleepMax"))}
        {numericField("watchdog", t("deploy.config.watchdog"))}
        {numericField("untrusted_timer", t("deploy.config.untrustedTimer"))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none text-white px-5 py-2.5 rounded-lg transition-all duration-300 font-bold uppercase text-[11px] tracking-widest"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {isSaving ? t("deploy.config.saving") : t("deploy.config.save")}
      </button>
    </div>
  );
};
