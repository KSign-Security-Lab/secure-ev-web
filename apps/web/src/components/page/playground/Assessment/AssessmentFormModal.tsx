"use client";

import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { Modal } from "~/components/common/Modal/Modal";
import { Checkbox } from "~/components/ui/checkbox";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { AbilityPicker, type PickedAbility } from "~/components/page/abilities/AbilityPicker";
import { platformLabel } from "~/lib/format";
import { ModalButton } from "~/components/common/Modal/ModalButton";

type AgentList = RouterOutputs["agents"]["list"];

interface AssessmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const label = "mb-1.5 block text-sm font-semibold text-neutral-800";
const input =
  "h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function AssessmentFormModal({ open, onClose, onSaved }: AssessmentFormModalProps) {
  const { t } = useI18n();
  const showToast = useToast();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [repeat, setRepeat] = useState(1);
  const [abilities, setAbilities] = useState<PickedAbility[]>([]);
  const [agents, setAgents] = useState<AgentList>([]);
  const [paws, setPaws] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Reset on open and load the real agent list.
  useEffect(() => {
    if (!open) return;
    let active = true;
    trpc.agents.list
      .query()
      .then((res) => active && setAgents(res))
      .catch(() => active && setAgents([]));
    return () => {
      active = false;
      setName("");
      setTarget("");
      setRepeat(1);
      setAbilities([]);
      setPaws(new Set());
    };
  }, [open]);

  const dirty = Boolean(name || target || abilities.length || paws.size || repeat !== 1);

  const move = (idx: number, dir: -1 | 1) =>
    setAbilities((prev) => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      await trpc.assessments.create.mutate({
        name: name.trim(),
        target: target.trim(),
        repeatCount: repeat,
        abilityIds: abilities.map((a) => a.ability_id),
        agentPaws: [...paws],
      });
      showToast(t("assessment.form.saved"), { type: "success" });
      onSaved();
    } catch {
      showToast(t("assessment.form.saveFailed"), { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      confirmOnClose={dirty && !saving}
      title={t("assessment.form.title")}
      className="lg:max-w-[880px]"
      bodyClassName="h-[min(64vh,620px)]"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            {t("assessment.form.cancel")}
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={save}
            disabled={!name.trim() || saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("assessment.form.save")}
          </ModalButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_8rem]">
        <div>
          <label htmlFor="assessment-name" className={label}>
            {t("assessment.form.name")}
          </label>
          <input
            id="assessment-name"
            className={input}
            value={name}
            placeholder={t("assessment.form.namePlaceholder")}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="assessment-target" className={label}>
            {t("assessment.form.target")}
          </label>
          <input
            id="assessment-target"
            className={input}
            value={target}
            placeholder={t("assessment.form.targetPlaceholder")}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="assessment-repeat" className={label}>
            {t("assessment.form.repeat")}
          </label>
          <input
            id="assessment-repeat"
            type="number"
            min={1}
            max={100}
            className={`${input} tabular-nums`}
            value={repeat}
            onChange={(e) => setRepeat(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          />
        </div>
      </div>

      <div>
        <span className={label}>{t("assessment.form.abilities", { count: abilities.length })}</span>
        <AbilityPicker
          selectedIds={abilities.map((a) => a.ability_id)}
          onPick={(ability) => setAbilities((prev) => [...prev, ability])}
          placeholder={t("assessment.form.abilitySearch")}
        />
        {abilities.length === 0 ? (
          <p className="mt-2 rounded-md border border-dashed border-neutral-200 p-3 text-sm text-neutral-500">
            {t("assessment.form.abilitiesEmpty")}
          </p>
        ) : (
          <ol className="mt-2 divide-y divide-neutral-100 rounded-md border border-neutral-200">
            {abilities.map((ability, idx) => (
              <li key={ability.ability_id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="w-6 text-right text-xs tabular-nums text-neutral-400">{idx + 1}</span>
                <span className="min-w-0 flex-1 truncate">{ability.ability_name}</span>
                <span className="shrink-0 text-xs text-neutral-500">{platformLabel(ability.platform)}</span>
                <button type="button" onClick={() => move(idx, -1)} aria-label={t("operations.builder.moveUp")} className="rounded p-1 text-neutral-400 hover:text-neutral-700">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(idx, 1)} aria-label={t("operations.builder.moveDown")} className="rounded p-1 text-neutral-400 hover:text-neutral-700">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAbilities((prev) => prev.filter((a) => a.ability_id !== ability.ability_id))}
                  aria-label={t("assessment.form.remove")}
                  className="rounded p-1 text-rose-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div>
        <span className={label}>{t("assessment.form.agents", { count: paws.size })}</span>
        {agents.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-200 p-3 text-sm text-neutral-500">
            {t("assessment.form.agentsEmpty")}
          </p>
        ) : (
          <div className="max-h-40 divide-y divide-neutral-100 overflow-y-auto rounded-md border border-neutral-200">
            {agents.map((agent) => (
              <label key={agent.paw} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-50">
                <Checkbox
                  checked={paws.has(agent.paw)}
                  onCheckedChange={() =>
                    setPaws((prev) => {
                      const next = new Set(prev);
                      if (next.has(agent.paw)) next.delete(agent.paw);
                      else next.add(agent.paw);
                      return next;
                    })
                  }
                />
                <span className="font-mono text-xs text-neutral-700">{agent.paw}</span>
                <span className="text-neutral-500">{agent.host}</span>
                <span className="ml-auto text-xs text-neutral-500">{platformLabel(agent.platform)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
