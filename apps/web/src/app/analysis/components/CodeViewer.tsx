"use client";

import React, { useEffect, useRef } from "react";
import { MockFile, AnalysisResult } from "./mockData";
import { FileWarning, FileQuestion, FileDigit, Code2 } from "lucide-react";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useI18n } from "~/i18n/I18nProvider";


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
  const { t } = useI18n();
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
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 bg-neutral-950">
        <FileDigit className="w-12 h-12 mb-4 text-neutral-600" />
        <p>{t("analysis.codeViewer.binaryUnavailable")}</p>
      </div>
    );
  }

  if (file.type === "large") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 bg-neutral-950">
        <FileWarning className="w-12 h-12 mb-4 text-amber-500" />
        <p>{t("analysis.codeViewer.largeUnavailable")}</p>
        <button className="mt-4 px-4 py-2 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700 transition">
          {t("analysis.codeViewer.loadTruncatedPreview")}
        </button>
      </div>
    );
  }

  if (!file.content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 bg-neutral-950">
        <FileQuestion className="w-12 h-12 mb-4 text-neutral-600" />
        <p>{t("analysis.codeViewer.contentUnavailable")}</p>
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
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 font-mono text-sm sm:text-base overflow-hidden rounded-md border border-neutral-800">
      <div className="flex items-center px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-xs sm:text-sm text-neutral-400 gap-2">
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
