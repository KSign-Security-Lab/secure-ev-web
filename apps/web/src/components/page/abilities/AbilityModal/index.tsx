"use client";

import React, { useState } from "react";
import { GeneralTab } from "./GeneralTab";
import { ExecutorsTab } from "./ExecutorsTab";
import { RequirementTab } from "./RequirementTab";
import { ConfigurationTab } from "./ConfigurationTab";
import { AttackDataItem } from "~/types/defend";
import { Modal } from "~/components/common/Modal/Modal";

enum AbilityModalTabs {
  General = "General",
  Executors = "Executors",
  Requirement = "Requirement",
  Configuration = "Configuration",
}

interface TabContentProps {
  tab: AbilityModalTabs;
  tabData: AttackDataItem;
}

const TabContent: React.FC<TabContentProps> = ({ tab, tabData }) => {
  switch (tab) {
    case AbilityModalTabs.General:
      return <GeneralTab data={tabData} />;
    case AbilityModalTabs.Executors:
      return <ExecutorsTab data={tabData.executors ?? []} />;
    case AbilityModalTabs.Requirement:
      return <RequirementTab />;
    case AbilityModalTabs.Configuration:
      return <ConfigurationTab />;
    default:
      return null;
  }
};

interface AbilityModalProps {
  open: boolean;
  onClose: () => void;
  modalData: AttackDataItem;
  onSave: () => void;
}

const AbilityModal: React.FC<AbilityModalProps> = ({
  open,
  onClose,
  modalData,
  onSave,
}) => {
  const [tab, setTab] = useState<AbilityModalTabs>(AbilityModalTabs.General);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Find atypical open ports"
      footer={
        <div className="flex justify-end space-x-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            onClick={onSave}
          >
            저장
          </button>
          <button
            className="bg-gray-500 hover:bg-neutral-500 px-4 py-2 rounded"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      }
    >
      <div className="flex border-b border-base-800 space-x-4 mb-4">
        {Object.values(AbilityModalTabs).map((t) => (
          <button
            key={t}
            className={`py-2 px-4 font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-blue-400 text-blue-400"
                : "text-neutral-400 hover:text-white"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <TabContent tab={tab} tabData={modalData} />
    </Modal>
  );
};

export default AbilityModal;
