"use client";

import React, { useState } from "react";
import { mockResults } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Search, Filter, SortDesc } from "lucide-react";
import ResultDetail from "./ResultDetail";

export default function ResultsView() {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = mockResults.filter((r) =>
    r.functionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.filePath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedResult = mockResults.find((r) => r.id === selectedResultId);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "red";
      case "Medium": return "yellow";
      case "Low": return "green";
      default: return "default";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "New": return "blue";
      case "Open": return "cyan";
      case "Fixed": return "green";
      default: return "default";
    }
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="flex space-x-4">
          <Badge variant="secondary" className="px-3 py-1">Total: {mockResults.length}</Badge>
          <Badge variant="red" className="px-3 py-1">High Risk: 1</Badge>
          <Badge variant="yellow" className="px-3 py-1">Medium Risk: 1</Badge>
          <Badge variant="blue" className="px-3 py-1">Supported: COPY_FUNC, INDEX_WRITE</Badge>
        </div>
      </div>

      <div className="flex h-[calc(100vh-180px)] gap-4">
        {/* Left Side: Master List */}
        <div className="flex flex-col w-1/3 min-w-[350px] border border-gray-800 rounded-lg bg-gray-900 overflow-hidden">
          <div className="p-3 border-b border-gray-800 bg-gray-950 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search function or file..."
                className="pl-9 bg-gray-900 border-gray-700 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center text-xs text-gray-400 bg-gray-800 px-2 py-1.5 rounded hover:bg-gray-700 transition">
                <Filter className="w-3 h-3 mr-1" /> Filter
              </button>
              <button className="flex items-center text-xs text-gray-400 bg-gray-800 px-2 py-1.5 rounded hover:bg-gray-700 transition">
                <SortDesc className="w-3 h-3 mr-1" /> Sort
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredResults.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResultId(res.id)}
                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedResultId === res.id ? "bg-gray-800 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getRiskBadgeColor(res.risk) as any}>{res.risk}</Badge>
                    <Badge variant={getStatusBadgeColor(res.status) as any}>{res.status}</Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-300">{res.sinkKind}</Badge>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-200 text-sm mb-1 font-mono truncate">{res.functionName}</h4>
                <p className="text-xs text-gray-500 truncate">{res.filePath}:{res.lineInfo}</p>
              </div>
            ))}
            {filteredResults.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">No results found</div>
            )}
          </div>
        </div>

        {/* Right Side: Detail View */}
        <div className="flex-1 border border-gray-800 rounded-lg bg-gray-900 overflow-hidden flex flex-col">
          {selectedResult ? (
            <ResultDetail result={selectedResult} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
              <Search className="w-12 h-12 mb-4 text-gray-700" />
              <p>Select a finding from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
