"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, ArrowUp, ArrowDown, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "~/components/common/Modal/Modal";
import trpc, { type RouterOutputs } from "~/lib/trpc";

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
  /** Pre-seed the plan with one ability (e.g. "Run" from the ability modal). */
  initialAbility?: { abilityId: string; abilityName: string; platform: string } | null;
}

const inputClass =
  "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none";

export const OperationBuilder: React.FC<OperationBuilderProps> = ({
  open,
  onClose,
  onCreated,
  initialAbility,
}) => {
  const [name, setName] = useState("");
  const [agents, setAgents] = useState<AgentList>([]);
  const [selectedPaws, setSelectedPaws] = useState<Set<string>>(new Set());
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [stopOnError, setStopOnError] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RouterOutputs["abilities"]["search"]["abilities"]>([]);
  const [searching, setSearching] = useState(false);

  const [preview, setPreview] = useState<PreviewFacts | null>(null);
  const [factValues, setFactValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when (re)opened; seed with the initial ability if given.
  useEffect(() => {
    if (!open) return;
    setName(initialAbility ? `Run: ${initialAbility.abilityName}` : "");
    setSteps(initialAbility ? [{ ...initialAbility, captures: [] }] : []);
    setSelectedPaws(new Set());
    setStopOnError(false);
    setQuery("");
    setResults([]);
    setFactValues({});
    setError(null);
    void trpc.agents.list.query().then(setAgents).catch(() => setAgents([]));
  }, [open, initialAbility]);

  // Debounced ability search.
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      setSearching(true);
      trpc.abilities.search
        .query({ query: query.trim(), page: 1, pageSize: 20 })
        .then((res) => setResults(res.abilities))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open]);

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

  const addStep = useCallback((ability: (typeof results)[number]) => {
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
      setError(err instanceof Error ? err.message : "Failed to start operation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Operation"
      className="max-w-5xl"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <span className="text-xs text-rose-600">{error}</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Launch
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Left: targeting + abilities */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Name</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Discovery sweep"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-600">
                Target agents ({selectedPaws.size})
              </label>
            </div>
            <div className="border border-neutral-200 rounded max-h-40 overflow-y-auto divide-y divide-neutral-100">
              {agents.length === 0 && (
                <p className="text-xs text-neutral-400 p-3">No agents have checked in.</p>
              )}
              {agents.map((agent) => (
                <label
                  key={agent.paw}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPaws.has(agent.paw)}
                    onChange={() => togglePaw(agent.paw)}
                  />
                  <span className="font-mono text-xs text-neutral-700">{agent.paw}</span>
                  <span className="text-neutral-500">{agent.host || agent.display_name}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-neutral-400">
                    {agent.platform}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${agent.trusted ? "bg-green-500" : "bg-neutral-300"}`}
                    title={agent.trusted ? "trusted" : "stale"}
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Add abilities</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-neutral-400" />
              <input
                className={`${inputClass} pl-8`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, tactic, technique…"
              />
            </div>
            {(searching || results.length > 0) && (
              <div className="border border-neutral-200 rounded mt-1 max-h-48 overflow-y-auto divide-y divide-neutral-100">
                {searching && <p className="text-xs text-neutral-400 p-2">Searching…</p>}
                {results.map((ability) => (
                  <button
                    key={ability.ability_id}
                    onClick={() => addStep(ability)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-blue-50"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{ability.ability_name}</span>
                    <span className="ml-auto text-[10px] uppercase text-neutral-400">
                      {ability.platform}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={stopOnError}
              onChange={(e) => setStopOnError(e.target.checked)}
            />
            Stop an agent&apos;s remaining steps after a skip/failure
          </label>
        </div>

        {/* Right: plan + facts */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Plan ({steps.length} step{steps.length === 1 ? "" : "s"})
            </label>
            {steps.length === 0 && (
              <p className="text-xs text-neutral-400 border border-dashed border-neutral-200 rounded p-3">
                Add abilities from the left. They run top-to-bottom on every target agent.
              </p>
            )}
            <ol className="space-y-2">
              {steps.map((step, idx) => (
                <li key={step.abilityId} className="border border-neutral-200 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 w-5">{idx + 1}</span>
                    <span className="text-sm truncate flex-1">{step.abilityName}</span>
                    <span className="text-[10px] uppercase text-neutral-400">{step.platform}</span>
                    <button onClick={() => moveStep(idx, -1)} className="text-neutral-400 hover:text-neutral-700">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveStep(idx, 1)} className="text-neutral-400 hover:text-neutral-700">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeStep(idx)} className="text-rose-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {step.captures.map((capture, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-1 mt-1 pl-7">
                      <input
                        className="w-28 rounded border border-neutral-200 px-1.5 py-1 text-xs"
                        placeholder="fact name"
                        value={capture.fact}
                        onChange={(e) => updateCapture(idx, cIdx, "fact", e.target.value)}
                      />
                      <input
                        className="flex-1 rounded border border-neutral-200 px-1.5 py-1 text-xs font-mono"
                        placeholder="regex with (group)"
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
                    className="text-[11px] text-blue-600 hover:text-blue-800 mt-1 pl-7"
                  >
                    + capture fact from output
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {preview && preview.requiredFacts.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Required facts
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
                      placeholder="value (or capture it from an earlier step)"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Leave blank to fill it from a capture rule on an earlier step. Unfilled
                placeholders cause that step to be skipped on the agent.
              </p>
            </div>
          )}

          {missingPayloads.length > 0 && (
            <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Payload{missingPayloads.length > 1 ? "s" : ""} not present on the C2:{" "}
                <span className="font-mono">{missingPayloads.join(", ")}</span>. Drop the file
                {missingPayloads.length > 1 ? "s" : ""} into the payload directory, or these steps
                will fail on the target.
              </span>
            </div>
          )}
          {preview && !preview.payloadListingAvailable && (
            <p className="text-[11px] text-neutral-400">
              Could not reach the C2 to verify payload availability.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
