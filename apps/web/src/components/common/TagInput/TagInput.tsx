"use client";

import React, { useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Normalises a raw entry (e.g. upper-casing); return "" to drop it. */
  normalize?: (raw: string) => string;
  /** Returns an error message for an invalid entry, or null when valid. */
  validate?: (value: string) => string | null;
  removeLabel?: (value: string) => string;
  className?: string;
}

/** Chip-style multi-value input: Enter / comma / paste adds, × or Backspace removes. */
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  normalize = (raw) => raw.trim(),
  validate,
  removeLabel = (v) => `Remove ${v}`,
  className,
}: TagInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commit = (raw: string) => {
    const parts = raw.split(/[,\n]/).map(normalize).filter(Boolean);
    if (!parts.length) return true;
    const next = [...value];
    for (const part of parts) {
      const message = validate?.(part) ?? null;
      if (message) {
        setError(message);
        return false;
      }
      if (!next.includes(part)) next.push(part);
    }
    setError(null);
    onChange(next);
    return true;
  };

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  return (
    <div className={className}>
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-neutral-50 px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
          error ? "border-rose-400" : "border-neutral-200"
        )}
        onClick={() => document.getElementById(inputId)?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-sm text-neutral-800 ring-1 ring-neutral-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={removeLabel(tag)}
              className="rounded text-neutral-400 hover:text-neutral-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          value={draft}
          placeholder={value.length ? undefined : placeholder}
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (commit(draft)) setDraft("");
            } else if (e.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => {
            if (draft && commit(draft)) setDraft("");
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/[,\n]/.test(text)) {
              e.preventDefault();
              if (commit(text)) setDraft("");
            }
          }}
          className="min-w-[10rem] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-neutral-400"
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
