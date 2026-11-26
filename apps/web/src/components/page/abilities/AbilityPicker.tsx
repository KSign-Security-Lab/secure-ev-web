"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Check, Loader2, Plus, Search } from "lucide-react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { platformLabel } from "~/lib/format";
import { cn } from "~/lib/utils";

export type PickedAbility = RouterOutputs["abilities"]["search"]["abilities"][number];

interface AbilityPickerProps {
  /** ability_id values already in the plan (shown as added). */
  selectedIds: string[];
  onPick: (ability: PickedAbility) => void;
  placeholder?: string;
}

/**
 * Ability search with results in a floating dropdown, so the surrounding
 * modal doesn't change height (and jump) while the user types.
 */
export function AbilityPicker({ selectedIds, onPick, placeholder }: AbilityPickerProps) {
  const { t } = useI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedAbility[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const handle = setTimeout(() => {
      setSearching(true);
      trpc.abilities.search
        .query({ query: q, page: 1, pageSize: 20 })
        .then((res) => setResults(res.abilities))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const showList = open && query.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (e.target.value.trim().length < 2) setResults([]);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && showList) {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setOpen(false);
          }
        }}
        placeholder={placeholder ?? t("operations.builder.searchPlaceholder")}
        className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {searching && (
        <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
      )}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {!searching && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-neutral-500">{t("common.noDataAvailable")}</li>
          )}
          {results.map((ability) => {
            const added = selectedIds.includes(ability.ability_id);
            return (
              <li key={ability.ability_id} role="option" aria-selected={added}>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => onPick(ability)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    added ? "cursor-default text-neutral-400" : "hover:bg-blue-50"
                  )}
                >
                  {added ? (
                    <Check className="h-4 w-4 shrink-0 text-green-600" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-blue-600" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{ability.ability_name}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{platformLabel(ability.platform)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
