"use client";

import React, { useState } from "react";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import AbilityModal from "./AbilityModal";
import type { AbilitiesListResponse } from "~/app/playground/abilities/page";
import { useI18n } from "~/i18n/I18nProvider";
import { Search } from "lucide-react";

interface AbilitiesTableProps {
  data: AbilitiesListResponse["abilities"];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount: number;
    localeLabel?: string;
  };
}

export const AbilitiesTable: React.FC<AbilitiesTableProps> = ({ 
  data, 
  isLoading = false,
  pagination 
}) => {
  const { t } = useI18n();
  const [modalData, setModalData] = useState<
    AbilitiesListResponse["abilities"][number] | null
  >(null);
  const [open, setOpen] = useState(false);

  const columns: DataTableColumn<AbilitiesListResponse["abilities"][number]>[] = [
    {
      label: t("abilities.table.abilityName"),
      render: (item) => (
        <button 
          onClick={() => onOpen(item)}
          className="text-blue-400 hover:text-blue-300 font-bold transition-colors mx-auto"
        >
          {item.ability_name}
        </button>
      ),
    },
    {
      label: t("abilities.table.tactics"),
      render: (item) => (
        <span className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
            {item.tactic}
        </span>
      ),
    },
    {
      label: t("abilities.table.techniqueId"),
      render: (item) => (
        <code className="bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50 text-slate-300 font-mono text-xs">
            {item.technique_id}
        </code>
      ),
    },
    {
      label: t("abilities.table.techniqueName"),
      render: (item) => (
        <span className="text-slate-300 font-medium italic">
            {item.technique_name}
        </span>
      ),
    },
    {
      label: t("abilities.table.type"),
      render: (item) => (
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
            {item.type}
        </span>
      ),
    },
  ];

  const onOpen = (item: AbilitiesListResponse["abilities"][number]) => {
    setModalData(item);
    const timeout = setTimeout(() => setOpen(true), 100);
    return () => clearTimeout(timeout);
  };

  const onClose = () => {
    setOpen(false);
    const timeout = setTimeout(() => setModalData(null), 500);
    return () => clearTimeout(timeout);
  };

  return (
    <>
      <DataTable 
        data={data} 
        columns={columns} 
        isLoading={isLoading}
        emptyState={{
          title: t("abilities.page.empty"),
          icon: Search
        }}
        pagination={pagination}
      />
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
