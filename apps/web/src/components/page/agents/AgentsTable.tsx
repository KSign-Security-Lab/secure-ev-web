import React from "react";
import { AgentsListResponse } from "~/app/agents/page";
import { Table, TableColumn } from "~/components/common/Table/Table";
import { Tag } from "~/components/common/Tag/Tag";
import { useI18n } from "~/i18n/I18nProvider";

interface AgentsTableProps {
  data: AgentsListResponse;
}

export const AgentsTable: React.FC<AgentsTableProps> = ({ data }) => {
  const { t } = useI18n();
  const columns: TableColumn<AgentsListResponse[number]>[] = [
    {
      label: t("agents.table.idPaw"),
      render: (item) => item.paw,
    },
    {
      label: t("agents.table.host"),
      render: (item) => item.host,
    },
    {
      label: t("agents.table.group"),
      render: (item) => item.group,
    },
    {
      label: t("agents.table.platform"),
      render: (item) => item.platform,
    },
    {
      label: t("agents.table.contact"),
      render: (item) => item.contact,
    },
    {
      label: t("agents.table.pid"),
      render: (item) => item.pid,
    },
    {
      label: t("agents.table.privilege"),
      render: (item) => item.privilege,
    },
    {
      label: t("agents.table.status"),
      render: (item) =>
        item.trusted ? (
          <Tag label={t("agents.table.trusted")} color="green" />
        ) : (
          <Tag label={t("agents.table.untrusted")} color="red" />
        ),
    },
    {
      label: t("agents.table.lastSeen"),
      render: (item) => item.last_seen,
      className: "w-1/4",
    },
  ];

  return <Table data={data} columns={columns} />;
};
