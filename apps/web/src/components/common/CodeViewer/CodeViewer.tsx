"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileCode, Copy, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeViewer({
  code,
  language = "cpp",
  filename,
  className,
}: CodeViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 flex flex-col h-full", className)}>
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-3">
          <FileCode size={16} className="text-blue-500" />
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
            {filename || language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 gap-2"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">
            {copied ? "Copied" : "Copy"}
          </span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto bg-neutral-950">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
          codeTagProps={{ className: "font-mono" }}
          showLineNumbers
          lineNumberStyle={{
            minWidth: "3.5em",
            paddingRight: "1rem",
            color: "#4b5563",
            fontSize: "11px",
            textAlign: "right",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            marginRight: "1rem"
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
