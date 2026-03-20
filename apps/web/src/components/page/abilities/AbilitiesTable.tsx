import React, { useState } from "react";
import { Table, TableColumn } from "~/components/common/Table/Table";
import AbilityModal from "./AbilityModal";
import type { AbilitiesListResponse } from "~/app/abilities/page";
import { useI18n } from "~/i18n/I18nProvider";

export const AbilitiesTable: React.FC<{
  data: AbilitiesListResponse["abilities"];
}> = ({ data }) => {
  const { t } = useI18n();
  const [modalData, setModalData] = useState<
    AbilitiesListResponse["abilities"][number] | null
  >(null);
  const [open, setOpen] = useState(false);

  const columns: TableColumn<AbilitiesListResponse["abilities"][number]>[] = [
    {
      label: t("abilities.table.abilityName"),
      render: (item) => (
        <button onClick={() => onOpen(item)}>{item.ability_name}</button>
      ),
    },
    {
      label: t("abilities.table.tactics"),
      render: (item) => item.tactic,
    },
    {
      label: t("abilities.table.techniqueId"),
      render: (item) => item.technique_id,
    },
    {
      label: t("abilities.table.techniqueName"),
      render: (item) => item.technique_name,
    },
    {
      label: t("abilities.table.type"),
      render: (item) => item.type,
    },
  ];

  const onOpen = (item: AbilitiesListResponse["abilities"][number]) => {
    setModalData(item);
    const timeout = setTimeout(() => setOpen(true), 100); // match animation duration
    return () => clearTimeout(timeout);
  };

  const onClose = () => {
    setOpen(false);
    const timeout = setTimeout(() => setModalData(null), 500); // match animation duration
    return () => clearTimeout(timeout);
  };

  return (
    <>
      {data ? (
        <Table data={data} columns={columns} />
      ) : (
        <span className="text-center">{t("abilities.page.empty")}</span>
      )}
      {modalData ? (
        <AbilityModal
          open={open}
          onClose={onClose}
          onSave={() => {}}
          modalData={modalData}
        />
      ) : null}
    </>
  );
};
