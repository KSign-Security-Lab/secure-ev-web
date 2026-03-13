"use client";

import React, { useState } from "react";
import { mockResults, mockFiles } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { FileCode, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import ResultDetail from "./ResultDetail";
import CodeViewer from "./CodeViewer";

export default function ResultsView() {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(mockFiles[0].path);

  const selectedResult = mockResults.find((r) => r.id === selectedResultId) || null;
  const selectedFile = mockFiles.find((f) => f.path === selectedFilePath) || mockFiles[0];

  const handleResultSelect = (id: string) => {
    setSelectedResultId(id);
    const result = mockResults.find((r) => r.id === id);
    if (result) {
      setSelectedFilePath(result.filePath);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "red";
      case "Medium": return "yellow";
      case "Low": return "green";
      default: return "default";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full gap-4">
      {/* Top Bar: Vulnerability List (Horizontal scroll or compact list) */}
      <div className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-950 px-4 py-2 border-b border-gray-800 flex justify-between items-center text-sm">
           <span className="font-semibold text-gray-200">Detected Vulnerabilities ({mockResults.length})</span>
        </div>
        <div className="flex overflow-x-auto p-2 gap-2 custom-scrollbar">
          {mockResults.map((res) => {
            const isSelected = selectedResultId === res.id;
            return (
              <button
                key={res.id}
                onClick={() => handleResultSelect(res.id)}
                className={`flex flex-col flex-shrink-0 w-64 text-left p-3 rounded-md border transition-colors ${
                  isSelected ? "bg-gray-800 border-blue-500" : "bg-gray-950 border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <Badge variant={getRiskBadgeColor(res.risk) as any} className="text-[10px] px-1.5 py-0">
                    {res.risk}
                  </Badge>
                  <span className="text-xs text-gray-500 font-mono">{res.sinkKind}</span>
                </div>
                <span className="text-sm font-medium text-gray-200 truncate">{res.functionName}</span>
                <span className="text-xs text-gray-500 truncate mt-1">{res.filePath}:{res.lineInfo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden border border-gray-800 rounded-lg">

        {/* Left: File Explorer */}
        <div className="w-64 flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col">
          <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800">
            Files
          </div>
          <div className="flex-1 overflow-y-auto">
             {mockFiles.map((file) => {
               const fileVulns = mockResults.filter(r => r.filePath === file.path);
               const hasVulns = fileVulns.length > 0;
               const isSelected = selectedFilePath === file.path;

               return (
                 <button
                   key={file.path}
                   onClick={() => setSelectedFilePath(file.path)}
                   className={`w-full text-left flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                     isSelected ? "bg-gray-800 text-gray-200" : "text-gray-400 hover:bg-gray-900"
                   }`}
                 >
                   <div className="flex items-center gap-2 overflow-hidden">
                     <FileCode className={`w-4 h-4 shrink-0 ${hasVulns ? "text-red-400" : "text-gray-500"}`} />
                     <span className="truncate">{file.path.split('/').pop()}</span>
                   </div>
                   {hasVulns && (
                     <Badge variant="red" className="ml-2 shrink-0 h-4 w-4 p-0 flex items-center justify-center rounded-full text-[10px]">
                       {fileVulns.length}
                     </Badge>
                   )}
                 </button>
               );
             })}
          </div>
        </div>

        {/* Center: Code Viewer */}
        <div className="flex-1 overflow-hidden bg-[#0d1117] relative">
           <CodeViewer
             file={selectedFile}
             vulnerabilities={mockResults.filter(r => r.filePath === selectedFilePath)}
             selectedResultId={selectedResultId}
             onResultClick={handleResultSelect}
           />
        </div>

        {/* Right: Detail Panel */}
        <ResultDetail result={selectedResult} />

      </div>
    </div>
  );
}
