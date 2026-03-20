"use client";

import React, { useState } from "react";
import type { FuzzingParameters } from "~/types/fuzzing";
import { useLocalI18n } from "~/i18n/I18nProvider";
import { fuzzingParamsMessages } from "./FuzzingParamsForm.messages";

interface FuzzingParamsFormProps {
  parameters: FuzzingParameters | null;
  onChange: (parameters: FuzzingParameters) => void;
}

export function FuzzingParamsForm({
  parameters,
  onChange,
}: FuzzingParamsFormProps) {
  const t = useLocalI18n(fuzzingParamsMessages);

  const [localParams, setLocalParams] = useState<FuzzingParameters>(
    parameters || {
      aggressivenessLevel: "medium",
      mutatePayloadFields: true,
      timingJitter: false,
    }
  );

  const handleChange = (field: string, value: unknown) => {
    const updated = { ...localParams, [field]: value };
    setLocalParams(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {t("duration")}
        </label>
        <input
          type="number"
          value={localParams.duration || ""}
          onChange={(e) =>
            handleChange("duration", e.target.value ? parseInt(e.target.value) : undefined)
          }
          className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
          placeholder="3600"
          min="1"
        />
        <p className="text-xs text-neutral-400 mt-1">
          {t("durationHint")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {t("maxCases")}
        </label>
        <input
          type="number"
          value={localParams.maxTestCases || ""}
          onChange={(e) =>
            handleChange(
              "maxTestCases",
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
          className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
          placeholder="10000"
          min="1"
        />
        <p className="text-xs text-neutral-400 mt-1">
          {t("maxCasesHint")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {t("aggressiveness")}
        </label>
        <select
          value={localParams.aggressivenessLevel || "medium"}
          onChange={(e) =>
            handleChange(
              "aggressivenessLevel",
              e.target.value as "low" | "medium" | "high"
            )
          }
          className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
        >
          <option value="low">{t("low")}</option>
          <option value="medium">{t("medium")}</option>
          <option value="high">{t("high")}</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={localParams.mutatePayloadFields || false}
          onChange={(e) => handleChange("mutatePayloadFields", e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm text-white">{t("mutate")}</label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={localParams.timingJitter || false}
          onChange={(e) => handleChange("timingJitter", e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm text-white">{t("jitter")}</label>
      </div>
    </div>
  );
}
