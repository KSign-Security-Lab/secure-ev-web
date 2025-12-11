"use client";

import React, { useState } from "react";
import { Download, Copy, Check, FileJson } from "lucide-react";
import type { FuzzingJobWithReport } from "~/types/fuzzing";

interface ConfigDownloadProps {
  job: FuzzingJobWithReport;
}

export function ConfigDownload({ job }: ConfigDownloadProps) {
  const [copied, setCopied] = useState(false);

  // Construct the configuration object
  const configObject = {
    jobId: job.id,
    targetType: job.targetType,
    environment: job.environment,
    connectionConfig: job.connectionConfig,
    fuzzingParameters: job.fuzzingParameters,
  };

  const jsonString = JSON.stringify(configObject, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const fileName = `job-config-${job.id.slice(0, 8)}.json`;

  const command = `python runner.py ${fileName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Download Configuration</h2>
      <div className="space-y-4">
        <div>
          <a
            href={downloadUrl}
            download={fileName}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition"
          >
            <FileJson size={16} />
            Download Job Config
          </a>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-2">
            Run Instructions
          </h3>
          <p className="text-sm text-slate-300 mb-3">
            1. Download the configuration file above.<br />
            2. Run the standalone python runner with this configuration:
          </p>
          <div className="bg-slate-950 p-3 rounded font-mono text-sm text-white flex items-center justify-between border border-slate-800">
            <code className="flex-1">{command}</code>
            <button
              onClick={handleCopy}
              className="ml-2 p-1 hover:bg-slate-800 rounded transition"
              title="Copy command"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-slate-400" />
              )}
            </button>
          </div>
           <p className="text-sm text-slate-300 mt-3">
            3. The runner will generate a report file (e.g., <code>report.json</code>).<br />
            4. Upload that report file in the section below.
          </p>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-2">Notes</h3>
          <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>
              The runner executes offline and does NOT communicate with the server.
            </li>
            <li>
              You must upload the results manually to see them here.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
