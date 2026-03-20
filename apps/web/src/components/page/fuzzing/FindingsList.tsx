"use client";

import React, { useState, useMemo } from "react";
import { Table, type TableColumn } from "~/components/common/Table/Table";
import { Tag } from "~/components/common/Tag/Tag";
import type { FuzzingRun } from "~/types/fuzzing";
import { getRunResultColor } from "~/utils/fuzzing.client";
import { FindingDetail } from "./FindingDetail";
import { useI18n } from "~/i18n/I18nProvider";

interface FindingsListProps {
  runs: FuzzingRun[];
}

export function FindingsList({ runs }: FindingsListProps) {
  const { t } = useI18n();
  const [selectedRun, setSelectedRun] = useState<FuzzingRun | null>(null);
  const [resultFilter, setResultFilter] = useState<string>("all");

  const getLocalizedResultLabel = (result: FuzzingRun["result"]) => {
    switch (result) {
      case "ok":
        return t("fuzzing.runResult.ok");
      case "error":
        return t("fuzzing.runResult.error");
      case "timeout":
        return t("fuzzing.runResult.timeout");
    }
  };

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
      label: t("fuzzing.logs.column.type"),
      render: (run) => (
        <span className="text-neutral-400 font-mono text-xs">
          {run.type}
        </span>
      ),
    },
    {
      label: t("fuzzing.logs.column.input"),
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
      label: t("fuzzing.logs.column.output"),
      render: (run) => (
        <span className="text-neutral-200 font-mono text-xs truncate max-w-[200px] block">
          {run.output}
        </span>
      ),
    },
    {
      label: t("fuzzing.logs.column.result"),
      render: (run) => (
        <Tag
          label={getLocalizedResultLabel(run.result)}
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
             <h2 className="text-xl font-bold text-white">
               {t("fuzzing.findings.title")}
             </h2>
             <div className="text-sm text-neutral-400">
                {t("fuzzing.findings.showing", {
                  filtered: filteredRuns.length,
                  total: runs.length,
                })}
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              {t("fuzzing.findings.filterResult")}
            </label>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{t("fuzzing.findings.allResults")}</option>
              {resultsPoints.map((r) => (
                <option key={r} value={r}>
                    {getLocalizedResultLabel(r)}
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
