"use client";

import React, { useState } from "react";
import { useI18n } from "~/i18n/I18nProvider";

interface FactModule {
  module: string;
  source: string;
  edge?: string;
  target?: string;
}

export const RequirementTab = () => {
  const { t } = useI18n();
  const [modules, setModules] = useState<FactModule[]>([
    {
      module: "plugins.stockpile.app.requirements.paw_provenance",
      source: "host.user.name",
      edge: "undefined",
      target: "undefined",
    },
  ]);

  const handleChange = (
    index: number,
    field: keyof FactModule,
    value: string
  ) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        module: "plugins.stockpile.app.requirements.paw_provenance",
        source: "host.user.name",
        edge: "undefined",
        target: "undefined",
      },
    ]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">{t("abilities.requirement.title")}</h2>
      <div className="grid grid-cols-1 gap-4">
        {modules.map((mod, index) => (
          <div
            key={index}
            className="border border-neutral-600 p-4 rounded space-y-4 bg-base-800"
          >
            {[
              {
                label: t("abilities.requirement.module"),
                value: mod.module,
                key: "module",
              },
              {
                label: t("abilities.requirement.source"),
                value: mod.source,
                key: "source",
              },
              {
                label: t("abilities.requirement.edge"),
                value: mod.edge,
                key: "edge",
              },
              {
                label: t("abilities.requirement.targetOptional"),
                value: mod.target,
                key: "target",
              },
            ].map(({ label, value, key }) => (
              <div
                key={key}
                className="grid gap-2 items-center mb-2"
                style={{ gridTemplateColumns: "1fr 3fr" }}
              >
                <label className="font-bold">{label}</label>
                <input
                  type="text"
                  className="p-2 border border-neutral-500 rounded bg-base-800 text-white"
                  value={value}
                  onChange={(e) =>
                    handleChange(index, key as keyof FactModule, e.target.value)
                  }
                />
              </div>
            ))}

            <div className="text-right">
              <button
                onClick={() => removeModule(index)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {t("abilities.requirement.delete")}
              </button>
            </div>
          </div>
        ))}

        <div className="text-right mt-4">
          <button
            onClick={addModule}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {t("abilities.requirement.add")}
          </button>
        </div>
      </div>
    </div>
  );
};
