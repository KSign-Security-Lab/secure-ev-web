import React from "react";
import { Table, TableColumn } from "~/components/common/Table/Table";
import { useI18n } from "~/i18n/I18nProvider";

export interface AssessmentItem {
  id: string;
  name: string;
  target: string;
  attackCount: number;
  repeatCount: number;
  lastExecutionDate: string | null;
}

export const AssessmentTable: React.FC<{
  data: AssessmentItem[];
}> = ({ data }) => {
  const { t } = useI18n();

  const columns: TableColumn<AssessmentItem>[] = [
    {
      label: t("assessment.table.name"),
      render: (item) => (
        <button className="text-left text-primary-400 hover:text-primary-300 font-medium transition-colors">
          {item.name}
        </button>
      ),
    },
    {
      label: t("assessment.table.target"),
      render: (item) => (
        <span className="text-neutral-300 font-mono text-sm">{item.target}</span>
      ),
    },
    {
      label: t("assessment.table.attackCount"),
      render: (item) => (
        <span className="text-neutral-300">{item.attackCount}</span>
      ),
    },
    {
      label: t("assessment.table.repeatCount"),
      render: (item) => (
        <span className="text-neutral-300">{item.repeatCount}</span>
      ),
    },
    {
      label: t("assessment.table.lastDate"),
      render: (item) => (
        <span className="text-neutral-400 text-sm">
          {item.lastExecutionDate || t("assessment.table.notYet")}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table data={data} columns={columns} />
    </div>
  );
};
