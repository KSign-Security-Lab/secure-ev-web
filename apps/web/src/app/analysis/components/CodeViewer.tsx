"use client";

import React, { useEffect, useRef } from "react";
import { MockFile, AnalysisResult } from "./mockData";
import { FileWarning, FileQuestion, FileDigit, Code2 } from "lucide-react";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


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
      <div className="flex flex-col items-center justify-center h-full text-[#8b949e] bg-[#0d1117]">
        <FileDigit className="w-12 h-12 mb-4 text-gray-700" />
        <p>This is a binary file and cannot be previewed.</p>
      </div>
    );
  }

  if (file.type === "large") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#8b949e] bg-[#0d1117]">
        <FileWarning className="w-12 h-12 mb-4 text-yellow-600" />
        <p>This file is too large to render completely.</p>
        <button className="mt-4 px-4 py-2 bg-[#21262d] text-[#8b949e] rounded hover:bg-[#30363d] transition">
          Load Truncated Preview
        </button>
      </div>
    );
  }

  if (!file.content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#8b949e] bg-[#0d1117]">
        <FileQuestion className="w-12 h-12 mb-4 text-gray-700" />
        <p>File content unavailable.</p>
      </div>
    );
  }
  // Determine language based on file extension
  const extension = file.path.split('.').pop() || '';
  const languageMap: Record<string, string> = {
    js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
    py: 'python', c: 'c', cpp: 'cpp', java: 'java', go: 'go', rs: 'rust'
  };
  const language = languageMap[extension] || 'text';

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm sm:text-base overflow-hidden rounded-md border border-[#30363d]">
      <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#30363d] text-xs sm:text-sm text-[#8b949e] gap-2">
        <Code2 className="w-4 h-4" />
        {file.path}
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar" ref={containerRef}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const matchingVulns = vulnerabilities.filter(
              (v) => lineNumber >= v.startLine && lineNumber <= v.endLine
            );

            const isVuln = matchingVulns.length > 0;
            const isSelected = matchingVulns.some((v) => v.id === selectedResultId);

            const style: React.CSSProperties = { display: 'block', cursor: isVuln ? 'pointer' : 'text' };

            if (isSelected) {
              style.backgroundColor = 'rgba(46, 160, 67, 0.15)'; // Subtle green highlight
              style.borderLeft = '3px solid #2ea043';
            } else if (isVuln) {
              style.backgroundColor = 'rgba(248, 81, 73, 0.15)'; // Subtle red highlight
              style.borderLeft = '3px solid #f85149';
            } else {
              style.borderLeft = '3px solid transparent';
            }

            return {
              style,
              onClick: () => {
                if (isVuln) {
                  const targetId = matchingVulns.find(v => v.id === selectedResultId)?.id || matchingVulns[0].id;
                  onResultClick(targetId);
                }
              },
              ref: matchingVulns.some((v) => v.id === selectedResultId && v.startLine === lineNumber) ? (selectedLineRef as any) : null
            };
          }}
          customStyle={{
            margin: 0,
            padding: '1rem 0',
            background: 'transparent',
            fontSize: 'inherit'
          }}
        >
          {file.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );

}