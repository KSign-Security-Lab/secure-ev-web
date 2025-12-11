"use client";

import React, { useState } from "react";
import type { FuzzingParameters } from "~/types/fuzzing";

interface FuzzingParamsFormProps {
  parameters: FuzzingParameters | null;
  onChange: (parameters: FuzzingParameters) => void;
}

export function FuzzingParamsForm({
  parameters,
  onChange,
}: FuzzingParamsFormProps) {
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
          Duration (seconds)
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
          Leave empty for unlimited duration
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          Max Test Cases
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
          Leave empty for unlimited test cases
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          Aggressiveness Level
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
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={localParams.mutatePayloadFields || false}
          onChange={(e) => handleChange("mutatePayloadFields", e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm text-white">Mutate Payload Fields</label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={localParams.timingJitter || false}
          onChange={(e) => handleChange("timingJitter", e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm text-white">Timing Jitter</label>
      </div>
    </div>
  );
}

