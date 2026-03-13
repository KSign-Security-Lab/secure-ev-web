"use client";

import React, { useState } from "react";
import { mockResults, mockFiles } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { File as FileIcon, ChevronDown } from "lucide-react";
import ResultDetail from "./ResultDetail";
import CodeViewer from "./CodeViewer";

export default function ResultsView() {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(mockResults[0]?.id || null);

  // Find the selected result and its corresponding file
  const selectedResult = mockResults.find((r) => r.id === selectedResultId) || null;
  const selectedFilePath = selectedResult ? selectedResult.filePath : mockFiles[0].path;
  const selectedFile = mockFiles.find((f) => f.path === selectedFilePath) || mockFiles[0];

  const handleResultSelect = (id: string) => {
    setSelectedResultId(id);
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
      {/* Header Area */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            Analysis Results
            <Badge variant="outline" className="border-gray-700 text-gray-300 font-mono">
              {mockResults.length} Issues Found
            </Badge>
          </h2>
          <p className="text-sm text-gray-400 mt-1">Review detected issues and trace data flows.</p>
        </div>
      </div>

      {/* Main Split View: Left sidebar for Files/Issues, Center/Right for Code/Explanation */}
      <div className="flex flex-1 overflow-hidden border border-gray-800 rounded-lg">

        {/* Left: Files & Issues Explorer */}
        <div className="w-80 flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col">
          <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800 bg-gray-900">
            Files & Issues
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
             {mockFiles.map((file) => {
               const fileVulns = mockResults.filter(r => r.filePath === file.path);
               const hasVulns = fileVulns.length > 0;
               const isFileSelected = selectedFilePath === file.path;

               return (
                 <div key={file.path} className="flex flex-col space-y-1">
                   <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${isFileSelected ? 'text-gray-200' : 'text-gray-400'}`}>
                     <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                     <FileIcon className="w-4 h-4 shrink-0" />
                     <span className="truncate font-medium">{file.path.split('/').pop()}</span>
                     {hasVulns && (
                       <Badge variant="red" className="ml-auto shrink-0 h-4 min-w-[16px] px-1 py-0 flex items-center justify-center rounded-full text-[10px]">
                         {fileVulns.length}
                       </Badge>
                     )}
                   </div>

                   {/* Render Issues under the file */}
                   {hasVulns && (
                     <div className="flex flex-col pl-6 space-y-1 border-l border-gray-800 ml-4">
                       {fileVulns.map(res => {
                         const isSelected = selectedResultId === res.id;
                         return (
                           <button
                             key={res.id}
                             onClick={() => handleResultSelect(res.id)}
                             className={`text-left p-2 rounded-md transition-colors text-xs flex flex-col gap-1 ${
                               isSelected ? "bg-blue-900/30 border border-blue-500/50" : "hover:bg-gray-900 border border-transparent"
                             }`}
                           >
                             <div className="flex justify-between items-center w-full">
                               <Badge variant={getRiskBadgeColor(res.risk) as any} className="text-[9px] px-1 py-0 leading-tight">
                                 {res.risk}
                               </Badge>
                               <span className="text-[10px] text-gray-500 font-mono">L{res.lineInfo.split('-')[0]}</span>
                             </div>
                             <span className={`truncate font-mono ${isSelected ? 'text-blue-200' : 'text-gray-300'}`}>
                               {res.functionName}
                             </span>
                           </button>
                         )
                       })}
                     </div>
                   )}
                 </div>
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
