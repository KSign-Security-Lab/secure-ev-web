import React, { useState } from "react";
import { Table, TableColumn } from "~/components/common/Table/Table";
import AbilityModal from "./AbilityModal";
import type { AbilitiesListResponse } from "~/app/abilities/page";

export const AbilitiesTable: React.FC<{
  data: AbilitiesListResponse["abilities"];
}> = ({ data }) => {
  const [modalData, setModalData] = useState<
    AbilitiesListResponse["abilities"][number] | null
  >(null);
  const [open, setOpen] = useState(false);

  const columns: TableColumn<AbilitiesListResponse["abilities"][number]>[] = [
    {
      label: "Ability Name",
      render: (item) => (
        <button onClick={() => onOpen(item)}>{item.ability_name}</button>
      ),
    },
    {
      label: "Tactics",
      render: (item) => item.tactic,
    },
    {
      label: "Technique ID",
      render: (item) => item.technique_id,
    },
    {
      label: "Technique Name",
      render: (item) => item.technique_name,
    },
    {
      label: "Type",
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
        <span className="text-center">No Data Available</span>
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
