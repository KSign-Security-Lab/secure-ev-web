"use client";

import React, { useState } from "react";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import AbilityModal from "./AbilityModal";
import type { AbilitiesListResponse } from "~/app/playground/abilities/page";
import { useI18n } from "~/i18n/I18nProvider";
import { Search } from "lucide-react";
import { display, tacticLabel } from "~/lib/format";
import trpc from "~/lib/trpc";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import type { AbilityForm } from "./AbilityModal/form";

interface AbilitiesTableProps {
  data: AbilitiesListResponse["abilities"];
  isLoading?: boolean;
  /** Called after an ability is saved so the page can refetch. */
  onUpdated?: () => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount: number;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
  };
  selection?: {
    selected: Set<string>;
    onChange: (next: Set<string>) => void;
  };
}

export const AbilitiesTable: React.FC<AbilitiesTableProps> = ({ 
  data, 
  isLoading = false,
  onUpdated,
  pagination,
  selection,
}) => {
  const { t } = useI18n();
  const showToast = useToast();
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
          type="button"
          className="text-left font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
        >
          {item.ability_name}
        </button>
      ),
    },
    {
      label: t("abilities.table.tactics"),
      nowrap: true,
      render: (item) => (
        <span className="text-neutral-600 text-sm">
            {tacticLabel(item.tactic, (k) => t(k as Parameters<typeof t>[0]))}
        </span>
      ),
    },
    {
      label: t("abilities.table.techniqueId"),
      nowrap: true,
      render: (item) => (
        <code className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200 text-neutral-700 font-mono text-xs">
            {display(item.technique_id)}
        </code>
      ),
    },
    {
      label: t("abilities.table.techniqueName"),
      render: (item) => (
        <span className="text-neutral-600">
            {display(item.technique_name)}
        </span>
      ),
    },
    {
      label: t("abilities.table.type"),
      nowrap: true,
      render: (item) => (
        <span className="text-sm text-neutral-600">
            {display(item.type)}
        </span>
      ),
    },
  ];

  const onOpen = (item: AbilitiesListResponse["abilities"][number]) => {
    setModalData(item);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    // Keep the data mounted until the close animation finishes.
    setTimeout(() => setModalData(null), 300);
  };

  const onSave = async (form: AbilityForm) => {
    if (!modalData) return;
    const updated = await trpc.abilities.update.mutate({ id: modalData.id, ...form });
    setModalData(updated);
    showToast(t("abilities.modal.saved"), { type: "success" });
    onUpdated?.();
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
        rowKey={(item) => item.id}
        selection={selection}
      />
      {modalData ? (
        <AbilityModal
          key={`${modalData.id}:${modalData.updatedAt}`}
          open={open}
          onClose={onClose}
          onSave={onSave}
          modalData={modalData}
        />
      ) : null}
    </>
  );
};
