import React from "react";
import { Info } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { Switch } from "~/components/ui/switch";

/**
 * Execution flags familiar from Caldera. The current engine runs each step
 * once per agent and never deletes payloads, so the switches reflect that and
 * are read-only until the engine supports them.
 */
const FLAGS = [
  { key: "singleton", value: false },
  { key: "repeatable", value: false },
  { key: "deletePayload", value: false },
] as const;

export const ConfigurationTab = () => {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {t("abilities.configuration.notice")}
      </p>
      <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
        {FLAGS.map(({ key, value }) => (
          <li key={key} className="flex items-start justify-between gap-6 px-4 py-3">
            <div>
              <p id={`flag-${key}`} className="text-sm font-semibold text-neutral-900">
                {t(`abilities.configuration.${key}` as "abilities.configuration.singleton")}
              </p>
              <p className="mt-0.5 text-sm text-neutral-500">
                {t(`abilities.configuration.${key}Desc` as "abilities.configuration.singletonDesc")}
              </p>
            </div>
            <Switch checked={value} disabled aria-labelledby={`flag-${key}`} className="mt-0.5" />
          </li>
        ))}
      </ul>
    </div>
  );
};
