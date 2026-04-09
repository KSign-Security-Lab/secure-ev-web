"use client";

import React, { useState, useMemo } from "react";
import { 
  mockSignatures, 
  Signature, 
  RiskLevel 
} from "../mockData";
import { Badge } from "~/components/ui/badge";
import SearchInput from "~/components/common/SearchInput/SearchInput";
import { Pagination } from "~/components/common/Pagination/Pagination";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

interface SignatureListProps {
  onSelect: (signature: Signature) => void;
}

const riskVariants: Record<RiskLevel, "red" | "yellow" | "blue" | "green"> = {
  HIGH: "red",
  MEDIUM: "yellow",
  LOW: "green",
};

const PAGE_SIZE = 10;

export function SignatureList({ onSelect }: SignatureListProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState("all");
  const [cweFilter, setCweFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
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
      const matchesRegion = regionFilter === "all" || s.region === regionFilter;
      const matchesApi = apiFilter === "all" || s.api === apiFilter;
      
      return matchesSearch && matchesRisk && matchesCwe && matchesRegion && matchesApi;
    });
  }, [search, riskFilter, cweFilter, regionFilter, apiFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };


  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 bg-base-900 p-8 rounded-xl border border-base-800">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white italic">
            Signature Database
          </h1>
          <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono tracking-tighter">
            <span>{counts.total} signatures</span>
            <span className="opacity-30">·</span>
            {Object.entries(counts.cweCounts).map(([cwe, count], idx) => (
                <React.Fragment key={cwe}>
                    <span>{cwe}: {count}</span>
                    {idx < Object.entries(counts.cweCounts).length - 1 && <span className="opacity-30">·</span>}
                </React.Fragment>
            ))}
            <span className="opacity-30">·</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#ff7b72]" /> HIGH: {counts.riskCounts.HIGH}</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#d29922]" /> MED: {counts.riskCounts.MEDIUM}</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#56d364]" /> LOW: {counts.riskCounts.LOW}</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex justify-between items-center w-full gap-4">
        <div className="flex-1 max-w-xl">
          <SearchInput onSearch={handleSearch} placeholder="Search pattern, API, variant ID..." />
        </div>
        <div className="flex items-center gap-2">
            <FilterSelect 
                label="CWE" 
                value={cweFilter}
                onValueChange={setCweFilter}
                options={["CWE-121", "CWE-122"]} 
                showAll
            />
            <FilterSelect 
                label="Risk" 
                value={riskFilter} 
                onValueChange={setRiskFilter} 
                options={["HIGH", "MEDIUM", "LOW"]} 
                showAll 
            />
            <FilterSelect 
                label="Region" 
                value={regionFilter}
                onValueChange={setRegionFilter}
                options={["STACK", "HEAP", "STRUCT"]} 
                showAll
            />
            <FilterSelect 
                label="API" 
                value={apiFilter}
                onValueChange={setApiFilter}
                options={["strcpy", "memcpy", "memmove", "wcscpy"]} 
                showAll
            />
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-2 flex flex-col flex-1 min-h-0">
        <div className="rounded-md border border-slate-800/50 overflow-hidden bg-slate-900/50">
          <table className="w-full table-fixed text-sm text-left">
            <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-700/50">
              <tr>
                <th className="p-4 font-semibold text-center uppercase tracking-wider text-xs">Pattern ID</th>
                <th className="p-4 font-semibold text-center uppercase tracking-wider text-xs">CWE</th>
                <th className="p-4 font-semibold text-center uppercase tracking-wider text-xs">Risk</th>
                <th className="p-4 font-semibold text-center uppercase tracking-wider text-xs">Sink Mode</th>
                <th className="p-4 font-semibold text-center uppercase tracking-wider text-xs">API</th>
                <th className="p-4 font-semibold text-center uppercase tracking-wider text-xs">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {pagedData.map((item, idx) => (
                <tr 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className={cn(
                    "cursor-pointer transition-colors duration-150 group",
                    idx % 2 === 0 ? "bg-slate-800/30" : "bg-transparent",
                    "hover:bg-blue-500/10"
                  )}
                >
                  <td className="p-4 font-mono text-center text-blue-400 group-hover:text-blue-300">
                    {item.patternId}
                  </td>
                  <td className="p-4 font-medium text-slate-300 text-center">
                    <Badge variant="outline" className="border-slate-700 font-mono text-[10px] text-slate-400">
                      {item.cwe}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1 w-24 mx-auto">
                        <Badge variant={riskVariants[item.risk]} className="justify-center w-full text-[10px] py-0">
                            {item.risk}
                        </Badge>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    item.risk === "HIGH" ? "w-full bg-red-400" : 
                                    item.risk === "MEDIUM" ? "w-2/3 bg-yellow-400" : 
                                    "w-1/3 bg-green-400"
                                )} 
                            />
                        </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-400 text-center uppercase text-[11px] tracking-tight">
                    {item.sinkMode}
                  </td>
                  <td className="p-4 text-center">
                    <code className="text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                      {item.api}
                    </code>
                  </td>
                  <td className="p-4 font-medium text-slate-500 text-center uppercase text-[10px] tracking-widest">
                    {item.region}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagedData.length === 0 && (
            <div className="p-12 text-center text-slate-500">
                No signatures found matching your criteria.
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="mt-6 flex justify-between items-center px-2">
            <div className="text-xs text-neutral-500 font-medium">
                Showing <span className="text-neutral-300 font-bold">{pagedData.length}</span> of <span className="text-neutral-400">{filtered.length} signatures</span>
            </div>
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                />
            )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ 
    label, 
    value, 
    onValueChange, 
    options, 
    showAll 
}: { 
    label: string, 
    value?: string, 
    onValueChange?: (v: string) => void, 
    options: string[], 
    showAll?: boolean 
}) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger size="sm" className="min-w-[110px] border-slate-700 bg-slate-800/50 text-[10px] font-bold uppercase text-slate-400 hover:border-slate-500 transition-all">
                <SelectValue placeholder={`[${label}]`} />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
                {showAll && <SelectItem value="all" className="text-xs uppercase font-bold text-slate-500 italic">All {label}s</SelectItem>}
                {options.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs font-mono">{opt}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

