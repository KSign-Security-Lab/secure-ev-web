"use client";

import React, { useState, useMemo } from "react";
import { Table, type TableColumn } from "~/components/common/Table/Table";
import { Tag } from "~/components/common/Tag/Tag";
import type { FuzzingRun } from "~/types/fuzzing";
import { getRunResultColor, getRunResultLabel } from "~/utils/fuzzing.client";
import { FindingDetail } from "./FindingDetail";

interface FindingsListProps {
  runs: FuzzingRun[];
}

export function FindingsList({ runs }: FindingsListProps) {
  const [selectedRun, setSelectedRun] = useState<FuzzingRun | null>(null);
  const [resultFilter, setResultFilter] = useState<string>("all");

  // Get unique results for filter
  const resultsPoints = useMemo(
    () => Array.from(new Set(runs.map((r) => r.result))),
    [runs]
  );

  // Filter runs
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      if (resultFilter !== "all" && run.result !== resultFilter) {
        return false;
      }
      return true;
    });
  }, [runs, resultFilter]);

  const columns: TableColumn<FuzzingRun>[] = [
    {
      label: "Type",
      render: (run) => (
        <span className="text-neutral-400 font-mono text-xs">
          {run.type}
        </span>
      ),
    },
    {
      label: "Input",
      render: (run) => (
        <button
          onClick={() => setSelectedRun(run)}
          className="text-primary-300 hover:text-primary-400 hover:underline text-left font-mono text-xs truncate max-w-[200px]"
        >
          {run.input}
        </button>
      ),
    },
    {
      label: "Output",
      render: (run) => (
        <span className="text-neutral-200 font-mono text-xs truncate max-w-[200px] block">
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
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">Interaction Log</h2>
             <div className="text-sm text-neutral-400">
                Showing {filteredRuns.length} of {runs.length} interactions
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Filter by Result
            </label>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Results</option>
              {resultsPoints.map((r) => (
                <option key={r} value={r}>
                    {getRunResultLabel(r)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table data={filteredRuns} columns={columns} striped />
      </div>

      {selectedRun && (
        <FindingDetail
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
        />
      )}
    </>
  );
}

