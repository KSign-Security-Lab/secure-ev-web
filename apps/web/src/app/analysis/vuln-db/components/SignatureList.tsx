"use client";

import { display, EMPTY, normalizePatternId } from "~/lib/format";
import React, { useState, useMemo } from "react";
import { ShieldAlert, Fingerprint, Activity } from "lucide-react";
import { 
  mockSignatures, 
  Signature 
} from "../mockData";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { FilterBar, FilterSelect } from "~/components/common/FilterBar/FilterBar";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import { StatusBadge } from "~/components/common/StatusBadge/StatusBadge";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";

interface SignatureListProps {
  onSelect: (signature: Signature) => void;
}

const PAGE_SIZE = 10;

export function SignatureList({ onSelect }: SignatureListProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState("all");
  const [cweFilter, setCweFilter] = useState("all");
  const [apiFilter, setApiFilter] = useState("all");

  const counts = useMemo(() => {
    const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const cweCounts: Record<string, number> = {};
    
    mockSignatures.forEach(s => {
        riskCounts[s.risk]++;
        cweCounts[s.cwe] = (cweCounts[s.cwe] || 0) + 1;
    });

    return { riskCounts, cweCounts, total: mockSignatures.length };
  }, []);

  const filtered = useMemo(() => {
    return mockSignatures.filter(s => {
      const matchesSearch = s.patternId.toLowerCase().includes(search.toLowerCase()) ||
                           s.api.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter === "all" || s.risk === riskFilter;
      const matchesCwe = cweFilter === "all" || s.cwe === cweFilter;
      const matchesApi = apiFilter === "all" || s.api === apiFilter;
      
      return matchesSearch && matchesRisk && matchesCwe && matchesApi;
    });
  }, [search, riskFilter, cweFilter, apiFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const columns: DataTableColumn<Signature>[] = [
    {
      label: t("vulndb.columns.patternId"),
      render: (item) => (
        <span className="font-bold font-mono text-blue-700 group-hover:text-blue-900 transition-colors">
          {normalizePatternId(item.patternId)}
        </span>
      ),
    },
    {
      label: t("vulndb.columns.cwe"),
      render: (item) => (
        <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
          {item.cwe}
        </span>
      ),
    },
    {
      label: t("vulndb.columns.risk"),
      render: (item) => (
        <StatusBadge status={item.risk} className="min-w-16 justify-center" />
      ),
    },
    {
      label: t("vulndb.columns.sinkMode"),
      render: (item) => (
        <span className="whitespace-nowrap font-mono text-xs text-neutral-600">
          {item.sinkMode}
        </span>
      ),
    },
    {
      label: t("vulndb.columns.api"),
      render: (item) =>
        display(item.api) === EMPTY ? (
          <span className="text-neutral-400">{EMPTY}</span>
        ) : (
          <code className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-neutral-700">
            {item.api}
          </code>
        ),
    },
    {
      label: t("vulndb.columns.region"),
      render: (item) => (
        <span className="text-xs font-medium text-neutral-600">
          {item.region}
        </span>
      ),
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title={t("vulndb.title")}
        subtitle={t("vulndb.signatures")}
        badge={t("vulndb.badge")}
        badgeVariant="cyan"
        actions={
          <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <dt className="font-semibold text-neutral-500">{t("vulndb.stats.byCwe")}</dt>
              <dd className="flex items-center gap-2">
                {Object.entries(counts.cweCounts).map(([cwe, count], i) => (
                  <span key={cwe} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-neutral-300">·</span>}
                    <span className="font-mono">{cwe}</span>
                    <span className="font-semibold tabular-nums text-neutral-900">{count}</span>
                  </span>
                ))}
              </dd>
            </div>
            <div className="hidden h-4 w-px bg-neutral-200 sm:block" aria-hidden />
            <div className="flex items-center gap-2">
              <dt className="font-semibold text-neutral-500">{t("vulndb.stats.byRisk")}</dt>
              <dd className="flex items-center gap-2">
                {([
                  ["HIGH", "bg-orange-500", "risk.high"],
                  ["MEDIUM", "bg-amber-500", "risk.medium"],
                  ["LOW", "bg-sky-500", "risk.low"],
                ] as const).map(([level, dot, key], i) => (
                  <span key={level} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="text-neutral-300">·</span>}
                    <span className={cn("h-2 w-2 rounded-full", dot)} aria-hidden />
                    {t(key)}
                    <span className="font-semibold tabular-nums text-neutral-900">
                      {counts.riskCounts[level]}
                    </span>
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        }
      />

      <FilterBar 
        handleSearch={handleSearch} 
        searchPlaceholder={t("vulndb.list.searchPlaceholder")}
      >
        <FilterSelect 
          label={t("vulndb.filters.cwe")}
          value={cweFilter}
          onValueChange={setCweFilter}
          options={["CWE-121", "CWE-122"]} 
          icon={Fingerprint}
        />
        <FilterSelect 
          label={t("vulndb.filters.risk")}
          value={riskFilter} 
          onValueChange={setRiskFilter} 
          options={[
            { label: t("risk.high"), value: "HIGH" },
            { label: t("risk.medium"), value: "MEDIUM" },
            { label: t("risk.low"), value: "LOW" },
          ]}
          icon={Activity}
        />
        <FilterSelect 
          label={t("vulndb.filters.api")}
          value={apiFilter}
          onValueChange={setApiFilter}
          options={["strcpy", "memcpy", "memmove", "wcscpy"]} 
          icon={ShieldAlert}
        />
      </FilterBar>

      <DataTable 
        columns={columns}
        data={pagedData}
        onRowClick={onSelect}
        rowKey={(item) => item.id}
        emptyState={{
          title: t("vulndb.list.empty"),
          icon: ShieldAlert
        }}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          totalCount: filtered.length,
          pageSize: PAGE_SIZE,
        }}
      />
    </div>
  );
}

