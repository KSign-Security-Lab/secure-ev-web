"use client";

import React, { useState, useMemo } from "react";
import { Table, type TableColumn } from "~/components/common/Table/Table";
import { Tag } from "~/components/common/Tag/Tag";
import type { FuzzingRun } from "~/types/fuzzing";
import { getRunResultColor, getRunResultLabel } from "~/utils/fuzzing.client";
import { FindingDetail } from "./FindingDetail";
import { Search, ChevronDown, Filter } from "lucide-react";
import clsx from "clsx";

interface InteractionLogTableProps {
  runs: FuzzingRun[];
}

type SortField = "type" | "result" | "input" | "none";
type SortDirection = "asc" | "desc";

export function InteractionLogTable({ runs }: InteractionLogTableProps) {
  const [selectedRun, setSelectedRun] = useState<FuzzingRun | null>(null);
  
  // Filters
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>("none");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Derived Data Options
  const resultsPoints = useMemo(() => Array.from(new Set(runs.map((r) => r.result))), [runs]);
  const typesPoints = useMemo(() => Array.from(new Set(runs.map((r) => r.type))), [runs]);

  // Filtering Logic
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      // Result Filter
      if (resultFilter !== "all" && run.result !== resultFilter) return false;
      // Type Filter
      if (typeFilter !== "all" && run.type !== typeFilter) return false;
      
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
            run.type.toLowerCase().includes(query) ||
            run.input.toLowerCase().includes(query) ||
            run.output.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [runs, resultFilter, typeFilter, searchQuery]);

  // Sorting Logic
  const sortedRuns = useMemo(() => {
    if (sortField === "none") return filteredRuns;

    return [...filteredRuns].sort((a, b) => {
      let valA = "";
      let valB = "";

      switch (sortField) {
        case "type":
          valA = a.type;
          valB = b.type;
          break;
        case "result":
          valA = a.result;
          valB = b.result;
          break;
        case "input":
          valA = a.input; // Simple string sort, maybe length? sticking to alphabetical for now
          valB = b.input;
          break;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRuns, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedRuns.length / pageSize);
  const currentRuns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRuns.slice(start, start + pageSize);
  }, [sortedRuns, currentPage, pageSize]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Reset page when filters change
  React.useEffect(() => {
      setCurrentPage(1);
  }, [resultFilter, typeFilter, searchQuery, pageSize]);


  const columns: TableColumn<FuzzingRun>[] = [
    {
      label: "Type",
      render: (run) => (
        <span className="text-neutral-400 font-mono text-xs">
          {run.type}
        </span>
      ),
      // Custom header render logic would be ideal in Table component, 
      // but assuming we can't change Table easily, we stick to basic headers or wrap Table?
      // For now, simpler implementation: sort buttons are external or just inferred?
      // The Table component accepts 'label' as string. 
      // If we want clickable headers, we might need to modify Table or just put controls above.
      // Let's rely on Table's standard rendering for now and add Sort controls in the toolbar if headers aren't interactive.
    },
    {
      label: "Input",
      render: (run) => (
        <button
          onClick={() => setSelectedRun(run)}
          className="text-primary-300 hover:text-primary-400 hover:underline text-left font-mono text-xs truncate max-w-[300px]"
        >
          {run.input}
        </button>
      ),
    },
    {
      label: "Output",
      render: (run) => (
        <span className="text-neutral-200 font-mono text-xs truncate max-w-[300px] block">
          {run.output}
        </span>
      ),
    },
    {
      label: "Result",
      render: (run) => (
        <Tag
          label={getRunResultLabel(run.result)}
          color={getRunResultColor(run.result)}
          size="sm"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-none flex flex-col gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
             {/* Left: Search */}
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                   type="text"
                   placeholder="Search logs..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
             </div>
             
             {/* Right: Filters & Sort */}
             <div className="flex flex-wrap gap-2">
                 <select
                    value={resultFilter}
                    onChange={(e) => setResultFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-300 outline-none focus:border-primary-500"
                 >
                    <option value="all">All Results</option>
                    {resultsPoints.map(r => <option key={r} value={r}>{getRunResultLabel(r)}</option>)}
                 </select>

                 <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-300 outline-none focus:border-primary-500"
                 >
                    <option value="all">All Types</option>
                    {typesPoints.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
                 
                 {/* Explicit Sort Control since Table headers might not be clickable */}
                 <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-2">
                    <span className="text-xs text-slate-500 px-1">Sort by:</span>
                    <select
                        value={sortField}
                        onChange={(e) => handleSort(e.target.value as SortField)}
                        className="bg-transparent text-sm text-slate-300 outline-none py-2"
                    >
                        <option value="none">Default</option>
                        <option value="type">Type</option>
                        <option value="result">Result</option>
                        <option value="input">Input</option>
                    </select>
                    <button 
                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Toggle Sort Direction"
                    >
                        <ChevronDown className={clsx("w-4 h-4 transition-transform", sortDirection === 'desc' && "rotate-180")} />
                    </button>
                 </div>
             </div>
          </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/30">
        <Table data={currentRuns} columns={columns} striped />
      </div>
      
      {/* Pagination Controls */}
      <div className="flex-none flex justify-between items-center px-2 py-2">
          <div className="text-sm text-slate-400">
              Showing {Math.min(filteredRuns.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredRuns.length, currentPage * pageSize)} of {filteredRuns.length} entries
          </div>
          
          <div className="flex gap-2 items-center">
             <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none mr-4"
             >
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
             </select>

             <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
             >
                Previous
             </button>
             <span className="text-sm text-white px-2">
                 Page {currentPage} of {totalPages || 1}
             </span>
             <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
             >
                 Next
             </button>
          </div>
      </div>

      {selectedRun && (
        <FindingDetail
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
        />
      )}
    </div>
  );
}
