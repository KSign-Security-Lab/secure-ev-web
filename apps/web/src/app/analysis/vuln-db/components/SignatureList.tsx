"use client";

import React, { useState, useMemo } from "react";
import { ShieldAlert, Fingerprint, Activity, Zap } from "lucide-react";
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
        <span className="font-bold font-mono text-blue-400 group-hover:text-blue-300 transition-colors">
          {item.patternId}
        </span>
      ),
      className: "text-center"
    },
    {
      label: t("vulndb.columns.cwe"),
      render: (item) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
          {item.cwe}
        </span>
      ),
      className: "text-center"
    },
    {
      label: t("vulndb.columns.risk"),
      render: (item) => (
        <div className="flex flex-col items-center gap-1 w-24 mx-auto">
          <StatusBadge status={item.risk} className="w-full justify-center" />
          <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                item.risk === "HIGH" ? "w-full bg-red-400 shadow-[0_0_5px_rgba(239,68,68,0.5)]" : 
                item.risk === "MEDIUM" ? "w-2/3 bg-yellow-400 shadow-[0_0_5px_rgba(234,179,8,0.5)]" : 
                "w-1/3 bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
              )} 
            />
          </div>
        </div>
      ),
      className: "text-center"
    },
    {
      label: t("vulndb.columns.sinkMode"),
      render: (item) => (
        <span className="uppercase text-[10px] font-black tracking-widest text-slate-500 italic">
          {item.sinkMode}
        </span>
      ),
      className: "text-center"
    },
    {
      label: t("vulndb.columns.api"),
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
            <Zap size={10} className="text-cyan-500 opacity-50" />
            <code className="text-xs font-mono font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/50 text-slate-300">
                {item.api}
            </code>
        </div>
      ),
      className: "text-center"
    },
    {
      label: t("vulndb.columns.region"),
      render: (item) => (
        <span className="font-black text-slate-600 uppercase text-[9px] tracking-[0.2em] leading-none">
          {item.region}
        </span>
      ),
      className: "text-center"
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title={t("vulndb.title")}
        subtitle={t("vulndb.signatures")}
        badge="Vulnerability Database"
        badgeVariant="cyan"
        actions={
          <div className="flex items-center gap-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            <div className="flex items-center gap-4">
               {Object.entries(counts.cweCounts).map(([cwe, count]) => (
                 <div key={cwe} className="flex flex-col items-center">
                   <span className="text-slate-600 mb-0.5">{cwe}</span>
                   <span className="text-slate-300">{count}</span>
                 </div>
               ))}
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" /> {counts.riskCounts.HIGH}</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" /> {counts.riskCounts.MEDIUM}</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" /> {counts.riskCounts.LOW}</span>
            </div>
          </div>
        }
      />

      <FilterBar 
        handleSearch={handleSearch} 
        searchPlaceholder={t("vulndb.list.searchPlaceholder")}
      >
        <FilterSelect 
          label="CWE" 
          value={cweFilter}
          onValueChange={setCweFilter}
          options={["CWE-121", "CWE-122"]} 
          icon={Fingerprint}
        />
        <FilterSelect 
          label="Risk" 
          value={riskFilter} 
          onValueChange={setRiskFilter} 
          options={["HIGH", "MEDIUM", "LOW"]} 
          icon={Activity}
        />
        <FilterSelect 
          label="API" 
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
        emptyState={{
          title: t("vulndb.list.empty"),
          icon: ShieldAlert
        }}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          totalCount: filtered.length,
          localeLabel: t("vulndb.list.count") || "signatures"
        }}
      />
    </div>
  );
}

