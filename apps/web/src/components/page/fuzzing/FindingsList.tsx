"use client";

import React, { useState, useMemo } from "react";
import { Table, type TableColumn } from "~/components/common/Table/Table";
import { Tag, TAG_COLOR_MAP } from "~/components/common/Tag/Tag";
import type { FuzzingFinding } from "~/types/fuzzing";
import {
  getSeverityColor,
  getCategoryLabel,
} from "~/server/trpc/utils/fuzzing";
import { FindingDetail } from "./FindingDetail";

interface FindingsListProps {
  findings: FuzzingFinding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  const [selectedFinding, setSelectedFinding] =
    useState<FuzzingFinding | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique severities and categories for filters
  const severities = useMemo(
    () => Array.from(new Set(findings.map((f) => f.severity))),
    [findings]
  );
  const categories = useMemo(
    () => Array.from(new Set(findings.map((f) => f.category))),
    [findings]
  );

  // Filter findings
  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      if (severityFilter !== "all" && finding.severity !== severityFilter) {
        return false;
      }
      if (categoryFilter !== "all" && finding.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [findings, severityFilter, categoryFilter]);

  const columns: TableColumn<FuzzingFinding>[] = [
    {
      label: "Severity",
      render: (finding) => (
        <Tag
          label={finding.severity.toUpperCase()}
          color={getSeverityColor(finding.severity)}
          size="sm"
        />
      ),
    },
    {
      label: "Title",
      render: (finding) => (
        <button
          onClick={() => setSelectedFinding(finding)}
          className="text-primary-300 hover:text-primary-400 hover:underline text-left"
        >
          {finding.title}
        </button>
      ),
    },
    {
      label: "Category",
      render: (finding) => (
        <span className="text-neutral-200">
          {getCategoryLabel(finding.category)}
        </span>
      ),
    },
    {
      label: "Description",
      render: (finding) => (
        <span className="text-neutral-200 line-clamp-2">
          {finding.description}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">Findings</h2>
             <div className="text-sm text-neutral-400">
                Showing {filteredFindings.length} of {findings.length} findings
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Filter by Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table data={filteredFindings} columns={columns} striped />
      </div>

      {selectedFinding && (
        <FindingDetail
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </>
  );
}

