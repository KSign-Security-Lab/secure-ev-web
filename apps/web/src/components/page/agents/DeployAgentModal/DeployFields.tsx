"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useI18n } from "~/i18n/I18nProvider";

/** `#{agent.extensions}` has no value in app_config, so it gets a hint instead. */
const EXTENSIONS_FIELD = "agent.extensions";

interface DeployFieldsProps {
  /** Placeholder keys, in the order they first appear in the commands. */
  fields: string[];
  values: Record<string, string>;
  defaults: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export const DeployFields: React.FC<DeployFieldsProps> = ({
  fields,
  values,
  defaults,
  onChange,
}) => {
  const { t } = useI18n();

  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {t("deploy.fields.label")}
      </span>

      <div className="space-y-2">
        {fields.map((field) => {
          const value = values[field] ?? "";
          const fallback = defaults[field] ?? "";
          const isDirty = value !== fallback;

          return (
            <div
              key={field}
              className="flex items-center gap-3 flex-wrap sm:flex-nowrap"
            >
              <label
                htmlFor={`deploy-field-${field}`}
                className="w-full sm:w-48 shrink-0 font-mono text-xs text-neutral-500"
              >
                {field}
              </label>

              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Input
                  id={`deploy-field-${field}`}
                  value={value}
                  spellCheck={false}
                  placeholder={
                    field === EXTENSIONS_FIELD
                      ? t("deploy.fields.extensionsHint")
                      : undefined
                  }
                  onChange={(event) => onChange(field, event.target.value)}
                  className="font-mono text-xs"
                />
                <button
                  type="button"
                  title={t("deploy.fields.reset")}
                  aria-label={t("deploy.fields.reset")}
                  disabled={!isDirty}
                  onClick={() => onChange(field, fallback)}
                  className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:text-neutral-700 hover:border-neutral-300 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
