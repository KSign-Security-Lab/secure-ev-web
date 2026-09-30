"use client";

import React, { useState } from "react";
import { Cable, Plug, Terminal } from "lucide-react";
import { Modal } from "~/components/common/Modal/Modal";
import { Button } from "~/components/ui/button";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/lib/trpc";

type Integration = RouterOutputs["integrations"]["list"][number];
type IntegrationMode = Integration["mode"];

interface AddIntegrationModalProps {
  open: boolean;
  integrations: Integration[];
  onClose: () => void;
  /** Hands the picked product and route to the connect dialog. */
  onPick: (integration: Integration, mode: IntegrationMode) => void;
}

export const AddIntegrationModal: React.FC<AddIntegrationModalProps> = ({
  open,
  integrations,
  onClose,
  onPick,
}) => {
  const { t } = useI18n();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selected =
    integrations.find((item) => item.adapterKey === selectedKey) ?? null;
  // API-capable products are added over their API; the rest collect by agent.
  // The route follows the product, so the operator does not choose.
  const mode: IntegrationMode | null = selected
    ? selected.supportedModes.includes("API")
      ? "API"
      : "AGENT"
    : null;

  const handleSelect = (integration: Integration) => {
    setSelectedKey(integration.adapterKey);
  };

  const handleClose = () => {
    setSelectedKey(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("integrations.add.title")}
      className="lg:max-w-[720px]"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            {t("integrations.add.cancel")}
          </Button>
          <Button
            disabled={!selected || !mode}
            onClick={() => {
              if (selected && mode) {
                onPick(selected, mode);
                handleClose();
              }
            }}
          >
            {t("integrations.add.next")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-neutral-500">{t("integrations.add.hint")}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {integrations.map((integration) => {
          const isSelected = integration.adapterKey === selectedKey;
          return (
            <button
              key={integration.adapterKey}
              type="button"
              onClick={() => handleSelect(integration)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                isSelected
                  ? "border-blue-300 bg-blue-50"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Plug className="h-3.5 w-3.5 text-blue-700" />
                {integration.name}
                {integration.configured && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-700">
                    {t("integrations.add.alreadyConfigured")}
                  </span>
                )}
              </span>
              <span className="text-xs text-neutral-500">
                {integration.vendor} · {integration.category}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="space-y-2 border-t border-neutral-200 pt-4">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
            {t("integrations.add.method")}
          </p>

          <div className="flex items-center gap-2 text-sm text-neutral-700">
            {mode === "API" ? (
              <Cable className="h-4 w-4 text-blue-700" />
            ) : (
              <Terminal className="h-4 w-4 text-blue-700" />
            )}
            <span>
              {t(
                mode === "API"
                  ? "integrations.add.onlyApi"
                  : "integrations.add.onlyAgent",
                { product: selected.name }
              )}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
};
