"use client";

import React, { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import type { FuzzingJobWithReport } from "~/types/fuzzing";

interface ConfigDownloadProps {
  job: FuzzingJobWithReport;
}

export function ConfigDownload({ job }: ConfigDownloadProps) {
  const [copied, setCopied] = useState(false);

  // Placeholder binary URL - in production this would be a real endpoint
  const downloadUrl = "/downloads/fuzzer";
  const fileName = "fuzzer";

  const command = `./fuzzer`;

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <a
            href={downloadUrl}
            download={fileName}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition w-full justify-center"
          >
            <Download size={16} />
            Download Fuzzer Binary
          </a>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3">
            Instructions
          </h3>
          
          <div className="space-y-4 text-sm text-slate-300">
             <p>
                <span className="font-bold text-white mr-2">1.</span> 
                Click the button above to download the <code>fuzzer</code> binary.
             </p>

             <div>
                <p className="mb-2">
                   <span className="font-bold text-white mr-2">2.</span> 
                   Make the binary executable and run it:
                </p>
                <div className="bg-slate-950 p-3 rounded font-mono text-sm text-white flex items-center justify-between border border-slate-800 ml-5">
                    <code className="flex-1 overflow-x-auto">chmod +x fuzzer && {command}</code>
                    <button
                      onClick={() => {
                         navigator.clipboard.writeText("chmod +x fuzzer && ./fuzzer");
                         setCopied(true);
                         setTimeout(() => setCopied(false), 2000);
                      }}
                      className="ml-2 p-1 hover:bg-slate-800 rounded transition shrink-0"
                      title="Copy command"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-slate-400" />
                      )}
                    </button>
                </div>
             </div>

             <p>
                <span className="font-bold text-white mr-2">3.</span> 
                Wait for the fuzzer to complete. It will generate a <code>report.json</code> file.
             </p>

             <p>
                 <span className="font-bold text-white mr-2">4.</span> 
                 Upload the <code>report.json</code> file in the section below to view the analysis.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
