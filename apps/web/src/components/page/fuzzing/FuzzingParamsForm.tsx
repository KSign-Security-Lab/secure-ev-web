"use client";

import React, { useState } from "react";
import type { FuzzingParameters } from "~/types/fuzzing";
import { useI18n } from "~/i18n/I18nProvider";

interface FuzzingParamsFormProps {
  parameters: FuzzingParameters | null;
  onChange: (parameters: FuzzingParameters) => void;
}

export function FuzzingParamsForm({
  parameters,
  onChange,
}: FuzzingParamsFormProps) {
  const { locale } = useI18n();
  const text =
    locale === "ko"
      ? {
          duration: "지속 시간 (초)",
          durationHint: "무제한 실행하려면 비워두세요",
          maxCases: "최대 테스트 케이스",
          maxCasesHint: "무제한 케이스로 실행하려면 비워두세요",
          aggressiveness: "공격성 수준",
          low: "낮음",
          medium: "보통",
          high: "높음",
          mutate: "페이로드 필드 변형",
          jitter: "타이밍 지터",
        }
      : {
          duration: "Duration (seconds)",
          durationHint: "Leave empty for unlimited duration",
          maxCases: "Max Test Cases",
          maxCasesHint: "Leave empty for unlimited test cases",
          aggressiveness: "Aggressiveness Level",
          low: "Low",
          medium: "Medium",
          high: "High",
          mutate: "Mutate Payload Fields",
          jitter: "Timing Jitter",
        };

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
          {text.duration}
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
          {text.durationHint}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {text.maxCases}
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
          {text.maxCasesHint}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {text.aggressiveness}
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
          <option value="low">{text.low}</option>
          <option value="medium">{text.medium}</option>
          <option value="high">{text.high}</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={localParams.mutatePayloadFields || false}
          onChange={(e) => handleChange("mutatePayloadFields", e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm text-white">{text.mutate}</label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={localParams.timingJitter || false}
          onChange={(e) => handleChange("timingJitter", e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm text-white">{text.jitter}</label>
      </div>
    </div>
  );
}
