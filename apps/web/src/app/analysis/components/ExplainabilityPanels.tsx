"use client";

import React from "react";
import { AnalysisResult } from "./mockData";
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, DownloadCloud, HardDrive } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface ExplainabilityPanelsProps {
  result: AnalysisResult;
}

export default function ExplainabilityPanels({ result }: ExplainabilityPanelsProps) {
  const { dfInfo } = result;
  const isDangerous = dfInfo.validation.upper_vs_capacity === "Unbounded" || dfInfo.validation.upper === "None";

  return (
    <div className="space-y-6 w-full">

      {/* Overview Status Banner */}
      <div className={`w-full flex items-center justify-between p-4 rounded-lg border ${isDangerous ? 'bg-[rgba(248,81,73,0.05)] border-[rgba(248,81,73,0.4)]' : 'bg-[rgba(63,185,80,0.05)] border-[rgba(63,185,80,0.4)]'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isDangerous ? 'bg-[rgba(248,81,73,0.1)]' : 'bg-[rgba(63,185,80,0.1)]'}`}>
             {isDangerous ? <AlertTriangle className="w-6 h-6 text-[#f85149]" /> : <CheckCircle2 className="w-6 h-6 text-[#3fb950]" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#c9d1d9]">
               {isDangerous ? "Vulnerability Confirmed: Unsafe Data Flow" : "Flow Verified: Bounds Checked"}
            </h3>
            <p className="text-sm text-[#8b949e] mt-1">
               {isDangerous ? `The requested size (${dfInfo.request.length_basis}) can exceed the destination buffer capacity (${dfInfo.capacity.value}).` : "The destination buffer is protected against overflow."}
            </p>
          </div>
        </div>
        <div className="text-right">
           <span className="text-xs uppercase tracking-wider text-[#8b949e] block mb-1">Root Cause</span>
           <Badge variant={isDangerous ? "red" : "green"} className="font-mono">{dfInfo.root_cause.kind}</Badge>
        </div>
      </div>

      {/* Visual Data Flow Diagram */}
      <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-6 relative">
        <h4 className="text-sm font-semibold text-[#8b949e] mb-6 uppercase tracking-wider">Visual Data Flow Path</h4>

        {/* Connection Line (Background) */}
        <div className="absolute top-[50%] left-0 right-0 h-0.5 bg-[#21262d] -z-10 hidden md:block"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-0">

          {/* Step 1: Source (Request) */}
          <div className="flex flex-col relative">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col h-full shadow-lg overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[rgba(88,166,255,0.15)] p-2 rounded-md">
                  <DownloadCloud className="w-5 h-5 text-[#79c0ff]" />
                </div>
                <h5 className="font-bold text-[#c9d1d9]">1. Data Source</h5>
              </div>
              <div className="space-y-3 flex-1">
                 <div>
                   <span className="text-xs text-[#8b949e] block mb-1">Expression</span>
                   <code className="text-xs bg-[#0d1117] px-2 py-1 rounded text-[#a5d6ff] font-mono block w-full truncate border border-[#30363d]">{dfInfo.request.bytes.expr}</code>
                 </div>
                 <div>
                   <span className="text-xs text-[#8b949e] block mb-1">Requested Size</span>
                   <code className="text-xs bg-[#0d1117] px-2 py-1 rounded text-[#d29922] font-mono block w-full truncate border border-[#30363d] font-bold">{dfInfo.request.length_basis}</code>
                 </div>
              </div>
            </div>
            {/* Arrow indicator for mobile */}
            <div className="flex justify-center md:hidden my-4"><ArrowRight className="w-6 h-6 text-[#8b949e] rotate-90" /></div>
          </div>

          {/* Step 2: Validation (Bounds) */}
          <div className="flex flex-col relative">
            <div className={`border rounded-lg p-4 flex flex-col h-full shadow-lg overflow-hidden ${isDangerous ? 'bg-[#0d1117] border-[rgba(248,81,73,0.4)]' : 'bg-[#0d1117] border-[rgba(63,185,80,0.4)]'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-md ${isDangerous ? 'bg-[rgba(248,81,73,0.15)]' : 'bg-[rgba(63,185,80,0.15)]'}`}>
                  {isDangerous ? <ShieldAlert className={`w-5 h-5 ${isDangerous ? 'text-[#ff7b72]' : 'text-[#56d364]'}`} /> : <ShieldCheck className="w-5 h-5 text-[#56d364]" />}
                </div>
                <h5 className="font-bold text-[#c9d1d9]">2. Bounds Check</h5>
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                 <div className="flex justify-between items-center border-b border-[#30363d]/50 pb-2">
                   <span className="text-xs text-[#8b949e]">Lower Bound:</span>
                   <code className="text-xs font-mono text-[#8b949e]">{dfInfo.validation.lower}</code>
                 </div>
                 <div className="flex justify-between items-center border-b border-[#30363d]/50 pb-2">
                   <span className="text-xs text-[#8b949e]">Upper Bound:</span>
                   <code className={`text-xs font-mono font-bold ${isDangerous ? 'text-[#ff7b72]' : 'text-[#56d364]'}`}>{dfInfo.validation.upper}</code>
                 </div>
                 <div className="mt-2 text-center">
                    <Badge variant={isDangerous ? "red" : "green"} className="uppercase text-[10px] tracking-wider px-2">
                      {dfInfo.validation.upper_vs_capacity}
                    </Badge>
                 </div>
              </div>
            </div>
            {/* Arrow indicator for mobile */}
            <div className="flex justify-center md:hidden my-4"><ArrowRight className="w-6 h-6 text-[#8b949e] rotate-90" /></div>
          </div>

          {/* Step 3: Sink (Capacity) */}
          <div className="flex flex-col relative">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col h-full shadow-lg overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[rgba(188,140,255,0.15)] p-2 rounded-md">
                  <HardDrive className="w-5 h-5 text-[#bc8cff]" />
                </div>
                <h5 className="font-bold text-[#c9d1d9]">3. Data Destination</h5>
              </div>
              <div className="space-y-3 flex-1">
                 <div>
                   <span className="text-xs text-[#8b949e] block mb-1">Target Buffer</span>
                   <code className="text-xs bg-[#0d1117] px-2 py-1 rounded text-[#d2a8ff] font-mono block w-full truncate border border-[#30363d]">{dfInfo.destination.expr}</code>
                 </div>
                 <div>
                   <span className="text-xs text-[#8b949e] block mb-1">Max Capacity</span>
                   <code className="text-xs bg-[#0d1117] px-2 py-1 rounded text-[#56d364] font-mono block w-full truncate border border-[#30363d] font-bold">{dfInfo.capacity.value}</code>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
