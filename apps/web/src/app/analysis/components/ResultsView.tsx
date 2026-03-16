"use client";

import React, { useState } from "react";
import { mockResults, mockFiles } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { File as FileIcon, ChevronDown, ChevronRight, Folder } from "lucide-react";
import ResultDetail from "./ResultDetail";
import CodeViewer from "./CodeViewer";

import { MockFile } from "./mockData";

interface ResultsViewProps { uploadedFiles: MockFile[] }

export default function ResultsView({ uploadedFiles }: ResultsViewProps) {


  // Generate random mock results for the uploaded files
  const [dynamicResults] = useState(() => {
    if (!uploadedFiles || uploadedFiles.length === 0) return mockResults;
    const generated: typeof mockResults = [];

    const basicMock = mockResults.find(r => r.sinkKind === "HARDCODED_SECRET");
    if (basicMock) {
        generated.push({
            ...basicMock,
            id: `dyn-basic`,
            filePath: uploadedFiles[0].path,
            functionName: "connect_to_db"
        });
    }

    uploadedFiles.forEach((file, index) => {
       if (Math.random() > 0.1) { // High chance to generate memory vulns too
          const numVulns = 1;
          for (let i = 0; i < numVulns; i++) {
             const linesCount = file.content?.split("
").length || 20;
             const maxLine = Math.min(linesCount, 20);
             const startL = Math.max(1, Math.floor(Math.random() * maxLine));

             // Clone a base mock result and adapt it to this file
             const baseRes = mockResults.find(r => r.sinkKind !== "SQL_INJECTION" && r.sinkKind !== "HARDCODED_SECRET") || mockResults[0];
             generated.push({
               ...baseRes,
               id: `dyn-${index}-${i}`,
               filePath: file.path,
               lineInfo: `${startL}-${startL+5}`,
               startLine: startL,
               endLine: startL + 5,
               functionName: `function_in_${file.path.split('/').pop()?.split('.')[0]}_${i}`
             });
          }
       }
    });

    return generated;
  });


  const activeResults = dynamicResults;

  const [selectedResultId, setSelectedResultId] = useState<string | null>(dynamicResults[0]?.id || null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["src", "src/parser", "src/core", "src/utils"]));

  // Find the selected result and its corresponding file
  const selectedResult = activeResults.find((r) => r.id === selectedResultId) || null;
  const selectedFilePath = selectedResult ? selectedResult.filePath : (uploadedFiles[0] || mockFiles[0]).path;
  const selectedFile = uploadedFiles.find((f) => f.path === selectedFilePath) || (uploadedFiles[0] || mockFiles[0]);

  const handleResultSelect = (id: string) => {
    setSelectedResultId(id);
  };

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "red";
      case "Medium": return "yellow";
      case "Low": return "green";
      default: return "default";
    }
  };

  // Build a simple tree for the mock files
  const buildTree = () => {
    const root: any = { name: "root", path: "", type: "dir", children: {}, vulns: 0, results: [] };

    uploadedFiles.forEach(file => {
      const parts = file.path.split('/');
      let current = root;

      const fileVulns = activeResults.filter(r => r.filePath === file.path);
      root.vulns += fileVulns.length;

      let currentPath = '';
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: isFile ? "file" : "dir",
            children: {},
            vulns: 0,
            fileObj: isFile ? file : null,
            results: isFile ? fileVulns : []
          };
        }
        current.children[part].vulns += fileVulns.length;
        current = current.children[part];
      });
    });
    return root;
  };

  const tree = buildTree();

  const renderTree = (node: any, level = 0) => {
    if (node.name === "root") {
      return Object.values(node.children).map((child: any) => renderTree(child, level));
    }

    const isExpanded = expandedPaths.has(node.path);
    const isFileSelected = selectedFilePath === node.path;
    const paddingLeft = `${level * 12 + 8}px`;

    return (
      <div key={node.path} className="flex flex-col">
        <button
          onClick={() => togglePath(node.path)}
          className={`flex items-center gap-2 py-2 w-full text-left rounded-md text-base transition-colors hover:bg-[#161b22] ${isFileSelected && node.type === 'file' ? 'text-[#c9d1d9] bg-[#161b22]/50' : 'text-[#8b949e]'}`}
          style={{ paddingLeft }}
        >
          {node.type === 'dir' || node.results.length > 0 ? (
            isExpanded ? <ChevronDown className="w-4 h-4 text-[#8b949e] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#8b949e] shrink-0" />
          ) : (
             <span className="w-4 h-4 shrink-0" />
          )}

          {node.type === 'dir' ? (
            <Folder className="w-4 h-4 shrink-0 text-[#79c0ff]" />
          ) : (
             <FileIcon className={`w-4 h-4 shrink-0 ${node.vulns > 0 ? 'text-[#ff7b72]' : 'text-[#8b949e]'}`} />
          )}

          <span className="truncate font-medium">{node.name}</span>

          {node.vulns > 0 && node.type === 'dir' && (
            <Badge variant="outline" className="ml-auto shrink-0 h-4 min-w-[16px] px-1 py-0 flex items-center justify-center rounded-full text-[10px] border-[#30363d] text-[#8b949e]">
              {node.vulns}
            </Badge>
          )}
          {node.vulns > 0 && node.type === 'file' && (
             <Badge variant="red" className="ml-auto shrink-0 h-4 min-w-[16px] px-1 py-0 flex items-center justify-center rounded-full text-[10px]">
               {node.vulns}
             </Badge>
          )}
        </button>

        {isExpanded && node.type === 'dir' && (
          <div className="flex flex-col">
            {Object.values(node.children).map((child: any) => renderTree(child, level + 1))}
          </div>
        )}

        {isExpanded && node.type === 'file' && node.results.length > 0 && (
          <div className="flex flex-col space-y-1 my-1 pl-4" style={{ paddingLeft: `${(level + 1) * 12 + 16}px` }}>
            <div className="border-l border-[#30363d] pl-2 space-y-1">
              {node.results.map((res: any) => {
                const isSelected = selectedResultId === res.id;
                return (
                  <button
                    key={res.id}
                    onClick={() => handleResultSelect(res.id)}
                    className={`text-left p-2 rounded-md transition-colors text-xs flex flex-col gap-1 w-full ${
                      isSelected ? "bg-blue-900/30 border border-[rgba(88,166,255,0.4)]" : "hover:bg-[#161b22] border border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <Badge variant={getRiskBadgeColor(res.risk) as any} className="text-[10px] px-1.5 py-0 leading-tight">
                        {res.risk}
                      </Badge>
                      <span className="text-xs text-[#8b949e] font-mono">L{res.lineInfo.split('-')[0]}</span>
                    </div>
                    <span className={`truncate font-mono ${isSelected ? 'text-blue-200' : 'text-[#8b949e]'}`}>
                      {res.functionName}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full gap-4">
      {/* Header Area */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-bold text-[#c9d1d9] flex items-center gap-2">
            Analysis Results
            <Badge variant="outline" className="border-[#30363d] text-[#8b949e] font-mono">
              {activeResults.length} Issues Found
            </Badge>
          </h2>
          <p className="text-sm text-[#8b949e] mt-1">Review detected issues and trace data flows.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 text-sm font-medium bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] rounded-md transition"
            onClick={() => alert("Export report feature is a placeholder and will be implemented later.")}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Main Split View: Left sidebar for Files/Issues, Center/Right for Code/Explanation */}
      <div className="flex flex-1 overflow-hidden border border-[#30363d] rounded-lg">

        {/* Left: Files & Issues Explorer */}
        <div className="w-80 flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col">
          <div className="p-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wider border-b border-[#30363d] bg-[#161b22]">
            Files & Issues
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
             {renderTree(tree)}
          </div>
        </div>

        {/* Center: Code Viewer */}
        <div className="flex-1 overflow-hidden bg-[#0d1117] relative">
           <CodeViewer
             file={selectedFile}
             vulnerabilities={activeResults.filter(r => r.filePath === selectedFilePath)}
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