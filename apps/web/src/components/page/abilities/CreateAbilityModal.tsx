"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import trpc from "~/lib/trpc";
import { Modal } from "~/components/common/Modal/Modal";
import { ModalButton } from "~/components/common/Modal/ModalButton";
import { NativeSelect } from "~/components/common/Select/NativeSelect";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { TACTIC_KEYS, tacticLabel } from "~/lib/format";

interface CreateAbilityModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY_FORM = {
  ability_name: "",
  description: "",
  tactic: "discovery",
  technique_id: "",
  technique_name: "",
  platform: "linux",
  shell_type: "sh",
  command: "",
};

const SHELLS: Record<string, string[]> = {
  linux: ["sh", "bash"],
  darwin: ["sh", "zsh"],
  windows: ["psh", "cmd"],
};

const label = "mb-1.5 block text-sm font-semibold text-neutral-800";
const input =
  "h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function CreateAbilityModal({ open, onClose, onCreated }: CreateAbilityModalProps) {
  const { t } = useI18n();
  const translate = (key: string) => t(key as Parameters<typeof t>[0]);
  const showToast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    return () => setForm(EMPTY_FORM);
  }, [open]);

  const set = (patch: Partial<typeof EMPTY_FORM>) => setForm((prev) => ({ ...prev, ...patch }));
  const techniqueValid = /^T\d{4}(\.\d{3})?$/i.test(form.technique_id.trim());
  const valid = form.ability_name.trim() && form.command.trim() && techniqueValid;
  const dirty = JSON.stringify(form) !== JSON.stringify(EMPTY_FORM);

  const save = async () => {
    setSaving(true);
    try {
      await trpc.abilities.create.mutate(form);
      showToast(t("abilities.create.saved"), { type: "success" });
      onCreated();
    } catch {
      showToast(t("abilities.create.failed"), { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      confirmOnClose={dirty && !saving}
      title={t("abilities.create.title")}
      className="lg:max-w-[880px]"
      bodyClassName="h-[min(64vh,620px)]"
      footer={
        <>
          <ModalButton onClick={onClose}>{t("abilities.modal.cancel")}</ModalButton>
          <ModalButton variant="primary" onClick={save} disabled={!valid || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("abilities.modal.save")}
          </ModalButton>
        </>
      }
    >
      <div>
        <label htmlFor="new-ability-name" className={label}>
          {t("abilities.general.name")}
        </label>
        <input
          id="new-ability-name"
          className={input}
          value={form.ability_name}
          onChange={(e) => set({ ability_name: e.target.value })}
          placeholder={t("abilities.create.namePlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_10rem_1fr]">
        <div>
          <label htmlFor="new-ability-tactic" className={label}>
            {t("abilities.table.tactics")}
          </label>
          <NativeSelect id="new-ability-tactic" value={form.tactic} onChange={(e) => set({ tactic: e.target.value })}>
            {TACTIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {tacticLabel(key, translate)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <label htmlFor="new-ability-technique" className={label}>
            {t("abilities.general.techniqueId")}
          </label>
          <input
            id="new-ability-technique"
            className={`${input} font-mono`}
            value={form.technique_id}
            aria-invalid={Boolean(form.technique_id) && !techniqueValid}
            onChange={(e) => set({ technique_id: e.target.value.toUpperCase() })}
            placeholder="T1082"
          />
        </div>
        <div>
          <label htmlFor="new-ability-technique-name" className={label}>
            {t("abilities.table.techniqueName")}
          </label>
          <input
            id="new-ability-technique-name"
            className={input}
            value={form.technique_name}
            onChange={(e) => set({ technique_name: e.target.value })}
            placeholder="System Information Discovery"
          />
        </div>
      </div>
      {form.technique_id && !techniqueValid && (
        <p className="-mt-2 text-xs text-rose-600">{t("abilities.create.techniqueInvalid")}</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="new-ability-platform" className={label}>
            {t("abilities.executors.platform")}
          </label>
          <NativeSelect
            id="new-ability-platform"
            value={form.platform}
            onChange={(e) => set({ platform: e.target.value, shell_type: SHELLS[e.target.value][0] })}
          >
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
            <option value="darwin">macOS</option>
          </NativeSelect>
        </div>
        <div>
          <label htmlFor="new-ability-shell" className={label}>
            {t("abilities.executors.shell")}
          </label>
          <NativeSelect id="new-ability-shell" value={form.shell_type} onChange={(e) => set({ shell_type: e.target.value })}>
            {SHELLS[form.platform].map((shell) => (
              <option key={shell} value={shell}>
                {shell}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div>
        <label htmlFor="new-ability-command" className={label}>
          {t("abilities.executors.command")}
        </label>
        <textarea
          id="new-ability-command"
          rows={5}
          className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 font-mono text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500/30"
          value={form.command}
          onChange={(e) => set({ command: e.target.value })}
          placeholder="uname -a"
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-neutral-500">{t("abilities.create.commandHint")}</p>
      </div>

      <div>
        <label htmlFor="new-ability-description" className={label}>
          {t("abilities.general.description")}
        </label>
        <textarea
          id="new-ability-description"
          rows={3}
          className="w-full rounded-md border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder={t("abilities.general.placeholderContent")}
        />
      </div>
    </Modal>
  );
}
