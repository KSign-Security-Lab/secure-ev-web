"use client";

import React, { useEffect, useRef } from "react";
import { MockFile, AnalysisResult } from "./mockData";
import { FileWarning, FileQuestion, FileDigit, Code2 } from "lucide-react";

interface CodeViewerProps {
  file: MockFile;
  vulnerabilities: AnalysisResult[];
  selectedResultId: string | null;
  onResultClick: (id: string) => void;
}

export default function CodeViewer({
  file,
  vulnerabilities,
  selectedResultId,
  onResultClick,
}: CodeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected vulnerability
  useEffect(() => {
    if (selectedResultId && selectedLineRef.current && containerRef.current) {
      selectedLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedResultId]);

  if (file.type === "binary") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-950">
        <FileDigit className="w-12 h-12 mb-4 text-gray-700" />
        <p>This is a binary file and cannot be previewed.</p>
      </div>
    );
  }

  if (file.type === "large") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-950">
        <FileWarning className="w-12 h-12 mb-4 text-yellow-600" />
        <p>This file is too large to render completely.</p>
        <button className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition">
          Load Truncated Preview
        </button>
      </div>
    );
  }

  if (!file.content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-950">
        <FileQuestion className="w-12 h-12 mb-4 text-gray-700" />
        <p>File content unavailable.</p>
      </div>
    );
  }

  const lines = file.content.split("\n");

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-[#e6edf3] font-mono text-sm overflow-hidden rounded-md border border-gray-800">
      <div className="flex items-center px-4 py-2 bg-[#161b22] border-b border-gray-800 text-xs text-gray-400 gap-2">
        <Code2 className="w-4 h-4" />
        {file.path}
      </div>
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;

              // Find if this line belongs to any vulnerability
              const matchingVulns = vulnerabilities.filter(
                (v) => lineNum >= v.startLine && lineNum <= v.endLine
              );

              const isVuln = matchingVulns.length > 0;
              const isSelected = matchingVulns.some((v) => v.id === selectedResultId);

              // Determine line styling based on selection and vulnerability state
              let rowClass = "group hover:bg-[#161b22] transition-colors";
              let numClass = "pr-4 pl-4 text-right select-none text-gray-600 border-r border-gray-800 w-12 cursor-pointer";
              let contentClass = "pl-4 pr-4 whitespace-pre cursor-text";

              if (isSelected) {
                rowClass = "bg-[#2ea0431a]"; // Subtle green/highlight for selected block
                numClass = "pr-4 pl-4 text-right select-none text-green-500 border-r border-green-500 w-12";
                contentClass = "pl-4 pr-4 whitespace-pre";
              } else if (isVuln) {
                rowClass = "bg-[#f851491a] hover:bg-[#f851492a] cursor-pointer"; // Subtle red for unselected vulnerability
                numClass = "pr-4 pl-4 text-right select-none text-red-400 border-r border-red-500 w-12";
                contentClass = "pl-4 pr-4 whitespace-pre";
              }

              // Set ref for the top line of the selected block to scroll to
              const isStartOfSelectedBlock = matchingVulns.some((v) => v.id === selectedResultId && v.startLine === lineNum);

              return (
                <tr
                  key={lineNum}
                  className={rowClass}
                  ref={isStartOfSelectedBlock ? (selectedLineRef as any) : null}
                  onClick={() => {
                    if (isVuln) {
                       // Prefer clicking the selected one if multiple overlap, otherwise just pick the first matching one
                       const targetId = matchingVulns.find(v => v.id === selectedResultId)?.id || matchingVulns[0].id;
                       onResultClick(targetId);
                    }
                  }}
                >
                  <td className={numClass}>{lineNum}</td>
                  <td className={contentClass}>
                     {line || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
