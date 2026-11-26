"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, Loader2 } from "lucide-react";
import { GeneralTab } from "./GeneralTab";
import { ExecutorsTab } from "./ExecutorsTab";
import { RequirementTab } from "./RequirementTab";
import { ConfigurationTab } from "./ConfigurationTab";
import { AttackDataItem } from "~/types/defend";
import { Modal } from "~/components/common/Modal/Modal";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";
import { ModalButton } from "~/components/common/Modal/ModalButton";
import { AbilityForm, executorsOf, isFormDirty, toAbilityForm } from "./form";

enum AbilityModalTabs {
  General = "General",
  Executors = "Executors",
  Requirement = "Requirement",
  Configuration = "Configuration",
}

interface AbilityModalProps {
  open: boolean;
  onClose: () => void;
  modalData: AttackDataItem;
  onSave: (form: AbilityForm) => Promise<void>;
}


const AbilityModal: React.FC<AbilityModalProps> = ({ open, onClose, modalData, onSave }) => {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<AbilityModalTabs>(AbilityModalTabs.General);
  const initialForm = useMemo(() => toAbilityForm(modalData), [modalData]);
  const [form, setForm] = useState<AbilityForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const executors = useMemo(() => executorsOf(modalData), [modalData]);

  const dirty = isFormDirty(form, initialForm);

  const runAbility = () => {
    const query = new URLSearchParams({
      ability: modalData.ability_id,
      name: modalData.ability_name,
      platform: modalData.platform ?? "",
    });
    router.push(`/playground/operations?${query.toString()}`);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(form);
    } catch {
      setSaveError(t("abilities.modal.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const tabLabel: Record<AbilityModalTabs, string> = {
    [AbilityModalTabs.General]: t("abilities.modal.general"),
    [AbilityModalTabs.Executors]: t("abilities.modal.executors"),
    [AbilityModalTabs.Requirement]: t("abilities.modal.requirement"),
    [AbilityModalTabs.Configuration]: t("abilities.modal.configuration"),
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      confirmOnClose={dirty && !saving}
      title={modalData.ability_name || modalData.technique_name}
      bodyClassName="h-[min(64vh,600px)]"
      subHeader={
        <div role="tablist" className="flex gap-1 border-b border-neutral-200">
          {Object.values(AbilityModalTabs).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === value
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              )}
              onClick={() => setTab(value)}
            >
              {tabLabel[value]}
            </button>
          ))}
        </div>
      }
      footer={
        <>
          <ModalButton variant="success" className="mr-auto" onClick={runAbility}>
            <Crosshair className="h-4 w-4" />
            {t("abilities.modal.runOnAgent")}
          </ModalButton>
          {saveError && <p className="text-sm text-rose-600">{saveError}</p>}
          <ModalButton onClick={onClose}>{t("abilities.modal.cancel")}</ModalButton>
          <ModalButton
            variant="primary"
            onClick={handleSave}
            disabled={!dirty || saving || !form.ability_name.trim()}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("abilities.modal.save")}
          </ModalButton>
        </>
      }
    >
      {tab === AbilityModalTabs.General && (
        <GeneralTab
          data={modalData}
          form={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        />
      )}
      {tab === AbilityModalTabs.Executors && <ExecutorsTab data={executors} />}
      {tab === AbilityModalTabs.Requirement && <RequirementTab abilityId={modalData.ability_id} />}
      {tab === AbilityModalTabs.Configuration && <ConfigurationTab />}
    </Modal>
  );
};

export default AbilityModal;
