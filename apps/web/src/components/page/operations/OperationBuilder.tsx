"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, ArrowUp, ArrowDown, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "~/components/common/Modal/Modal";
import { ModalButton } from "~/components/common/Modal/ModalButton";
import { Checkbox } from "~/components/ui/checkbox";
import { AbilityPicker, type PickedAbility } from "~/components/page/abilities/AbilityPicker";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { platformLabel } from "~/lib/format";

type AgentList = RouterOutputs["agents"]["list"];
type PreviewFacts = RouterOutputs["operations"]["previewFacts"];

interface StepDraft {
  abilityId: string;
  abilityName: string;
  platform: string;
  captures: { fact: string; regex: string }[];
}

interface OperationBuilderProps {
  open: boolean;
  onClose: () => void;
  onCreated: (operationId: string) => void;
  /**
   * Pre-seed the builder: one ability ("Run" from the ability modal) or a
   * whole saved assessment plan.
   */
  initialPlan?: BuilderPreset | null;
}

export interface BuilderPreset {
  name: string;
  abilities: { abilityId: string; abilityName: string; platform: string }[];
  paws?: string[];
}

const inputClass =
  "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none";

export const OperationBuilder: React.FC<OperationBuilderProps> = ({
  open,
  onClose,
  onCreated,
  initialPlan,
}) => {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [agents, setAgents] = useState<AgentList>([]);
  const [selectedPaws, setSelectedPaws] = useState<Set<string>>(new Set());
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [stopOnError, setStopOnError] = useState(false);


  const [preview, setPreview] = useState<PreviewFacts | null>(null);
  const [factValues, setFactValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when (re)opened; seed with the initial ability if given.
  useEffect(() => {
    if (!open) return;
    setName(initialPlan?.name ?? "");
    setSteps(initialPlan ? initialPlan.abilities.map((a) => ({ ...a, captures: [] })) : []);
    setSelectedPaws(new Set(initialPlan?.paws ?? []));
    setStopOnError(false);
    setFactValues({});
    setError(null);
    void trpc.agents.list.query().then(setAgents).catch(() => setAgents([]));
  }, [open, initialPlan]);

  const stepIds = useMemo(() => steps.map((step) => step.abilityId), [steps]);

  // Refresh the required-facts / payload preview whenever the plan changes.
  useEffect(() => {
    if (!open || stepIds.length === 0) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    trpc.operations.previewFacts
      .query({ abilityIds: stepIds })
      .then((res) => {
        if (!cancelled) setPreview(res);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [stepIds, open]);

  const addStep = useCallback((ability: PickedAbility) => {
    setSteps((prev) =>
      prev.some((step) => step.abilityId === ability.ability_id)
        ? prev
        : [
            ...prev,
            {
              abilityId: ability.ability_id,
              abilityName: ability.ability_name,
              platform: ability.platform,
              captures: [],
            },
          ]
    );
  }, []);

  const removeStep = (idx: number) => setSteps((prev) => prev.filter((_, i) => i !== idx));
  const moveStep = (idx: number, dir: -1 | 1) =>
    setSteps((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });

  const addCapture = (idx: number) =>
    setSteps((prev) =>
      prev.map((step, i) =>
        i === idx ? { ...step, captures: [...step.captures, { fact: "", regex: "" }] } : step
      )
    );
  const updateCapture = (idx: number, cIdx: number, field: "fact" | "regex", value: string) =>
    setSteps((prev) =>
      prev.map((step, i) =>
        i === idx
          ? {
              ...step,
              captures: step.captures.map((c, j) => (j === cIdx ? { ...c, [field]: value } : c)),
            }
          : step
      )
    );
  const removeCapture = (idx: number, cIdx: number) =>
    setSteps((prev) =>
      prev.map((step, i) =>
        i === idx ? { ...step, captures: step.captures.filter((_, j) => j !== cIdx) } : step
      )
    );

  const togglePaw = (paw: string) =>
    setSelectedPaws((prev) => {
      const next = new Set(prev);
      if (next.has(paw)) next.delete(paw);
      else next.add(paw);
      return next;
    });

  const missingPayloads = useMemo(() => {
    if (!preview) return [];
    const names = new Set<string>();
    for (const ability of preview.abilities) {
      if (!ability.found) continue;
      for (const payload of ability.payloads) {
        if (payload.available === false) names.add(payload.name);
      }
    }
    return [...names];
  }, [preview]);

  const canSubmit =
    name.trim().length > 0 && selectedPaws.size > 0 && steps.length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const facts: Record<string, string> = {};
      for (const key of preview?.requiredFacts ?? []) {
        if (factValues[key]?.trim()) facts[key] = factValues[key];
      }
      const { id } = await trpc.operations.create.mutate({
        name: name.trim(),
        targetPaws: [...selectedPaws],
        steps: steps.map((step) => ({
          abilityId: step.abilityId,
          captures: step.captures.filter((c) => c.fact.trim() && c.regex.trim()),
        })),
        facts,
        stopOnError,
      });
      onCreated(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("operations.builder.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("operations.builder.title")}
      className="max-w-5xl"
      bodyClassName="h-[min(66vh,640px)]"
      confirmOnClose={steps.length > 0 && !submitting}
      footer={
        <>
          {error && <span className="mr-auto text-sm text-rose-600">{error}</span>}
          <ModalButton onClick={onClose}>{t("operations.builder.cancel")}</ModalButton>
          <ModalButton variant="primary" onClick={submit} disabled={!canSubmit}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("operations.builder.launch")}
          </ModalButton>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: targeting + abilities */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">{t("operations.builder.name")}</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("operations.builder.namePlaceholder")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-600">
                {t("operations.builder.targets", { count: selectedPaws.size })}
              </label>
            </div>
            <div className="border border-neutral-200 rounded max-h-40 overflow-y-auto divide-y divide-neutral-100">
              {agents.length === 0 && (
                <p className="text-xs text-neutral-400 p-3">{t("operations.builder.noAgents")}</p>
              )}
              {agents.map((agent) => (
                <label
                  key={agent.paw}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPaws.has(agent.paw)}
                    onCheckedChange={() => togglePaw(agent.paw)}
                  />
                  <span className="font-mono text-xs text-neutral-700">{agent.paw}</span>
                  <span className="text-neutral-500">{agent.host || agent.display_name}</span>
                  <span className="ml-auto text-xs text-neutral-500">
                    {platformLabel(agent.platform)}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${agent.trusted ? "bg-green-500" : "bg-neutral-300"}`}
                    title={agent.trusted ? t("operations.builder.trusted") : t("operations.builder.stale")}
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">{t("operations.builder.addAbilities")}</label>
            <AbilityPicker selectedIds={stepIds} onPick={addStep} />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <Checkbox
              checked={stopOnError}
              onCheckedChange={(checked) => setStopOnError(checked === true)}
            />
            {t("operations.builder.stopOnError")}
          </label>
        </div>

        {/* Right: plan + facts */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              {t("operations.builder.plan", { count: steps.length })}
            </label>
            {steps.length === 0 && (
              <p className="text-xs text-neutral-400 border border-dashed border-neutral-200 rounded p-3">
                {t("operations.builder.planEmpty")}
              </p>
            )}
            <ol className="space-y-2">
              {steps.map((step, idx) => (
                <li key={step.abilityId} className="border border-neutral-200 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 w-5">{idx + 1}</span>
                    <span className="text-sm truncate flex-1">{step.abilityName}</span>
                    <span className="shrink-0 text-xs text-neutral-500">{platformLabel(step.platform)}</span>
                    <button type="button" onClick={() => moveStep(idx, -1)} aria-label={t("operations.builder.moveUp")} title={t("operations.builder.moveUp")} className="text-neutral-400 hover:text-neutral-700">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => moveStep(idx, 1)} aria-label={t("operations.builder.moveDown")} title={t("operations.builder.moveDown")} className="text-neutral-400 hover:text-neutral-700">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removeStep(idx)} aria-label={t("operations.builder.remove")} title={t("operations.builder.remove")} className="text-rose-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {step.captures.map((capture, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-1 mt-1 pl-7">
                      <input
                        className="w-28 rounded border border-neutral-200 px-1.5 py-1 text-xs"
                        placeholder={t("operations.builder.factName")}
                        value={capture.fact}
                        onChange={(e) => updateCapture(idx, cIdx, "fact", e.target.value)}
                      />
                      <input
                        className="flex-1 rounded border border-neutral-200 px-1.5 py-1 text-xs font-mono"
                        placeholder={t("operations.builder.regex")}
                        value={capture.regex}
                        onChange={(e) => updateCapture(idx, cIdx, "regex", e.target.value)}
                      />
                      <button
                        onClick={() => removeCapture(idx, cIdx)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addCapture(idx)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 pl-7"
                  >
                    {t("operations.builder.addCapture")}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {preview && preview.requiredFacts.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                {t("operations.builder.requiredFacts")}
              </label>
              <div className="space-y-1">
                {preview.requiredFacts.map((fact) => (
                  <div key={fact} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-500 w-40 truncate">#{`{${fact}}`}</span>
                    <input
                      className="flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
                      value={factValues[fact] ?? ""}
                      onChange={(e) =>
                        setFactValues((prev) => ({ ...prev, [fact]: e.target.value }))
                      }
                      placeholder={t("operations.builder.factValue")}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {t("operations.builder.factHint")}
              </p>
            </div>
          )}

          {missingPayloads.length > 0 && (
            <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {t("operations.builder.missingPayloads", { files: missingPayloads.join(", ") })}
              </span>
            </div>
          )}
          {preview && !preview.payloadListingAvailable && (
            <p className="text-xs text-neutral-400">
              {t("operations.builder.payloadCheckUnavailable")}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
