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
      <div className={`w-full flex items-center justify-between p-4 rounded-lg border ${isDangerous ? 'bg-red-950/20 border-red-900/50' : 'bg-green-950/20 border-green-900/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isDangerous ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
             {isDangerous ? <AlertTriangle className="w-6 h-6 text-red-500" /> : <CheckCircle2 className="w-6 h-6 text-green-500" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-200">
               {isDangerous ? "Vulnerability Confirmed: Unsafe Data Flow" : "Flow Verified: Bounds Checked"}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
               {isDangerous ? `The requested size (${dfInfo.request.length_basis}) can exceed the destination buffer capacity (${dfInfo.capacity.value}).` : "The destination buffer is protected against overflow."}
            </p>
          </div>
        </div>
        <div className="text-right">
           <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Root Cause</span>
           <Badge variant={isDangerous ? "red" : "green"} className="font-mono">{dfInfo.root_cause.kind}</Badge>
        </div>
      </div>

      {/* Visual Data Flow Diagram */}
      <div className="w-full bg-gray-950 border border-gray-800 rounded-xl p-6 relative">
        <h4 className="text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">Visual Data Flow Path</h4>

        {/* Connection Line (Background) */}
        <div className="absolute top-[50%] left-0 right-0 h-0.5 bg-gray-800 -z-10 hidden md:block"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-0">

          {/* Step 1: Source (Request) */}
          <div className="flex flex-col relative">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col h-full shadow-lg overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500/20 p-2 rounded-md">
                  <DownloadCloud className="w-5 h-5 text-blue-400" />
                </div>
                <h5 className="font-bold text-gray-200">1. Data Source</h5>
              </div>
              <div className="space-y-3 flex-1">
                 <div>
                   <span className="text-xs text-gray-500 block mb-1">Expression</span>
                   <code className="text-xs bg-gray-950 px-2 py-1 rounded text-blue-300 font-mono block w-full truncate border border-gray-800">{dfInfo.request.bytes.expr}</code>
                 </div>
                 <div>
                   <span className="text-xs text-gray-500 block mb-1">Requested Size</span>
                   <code className="text-xs bg-gray-950 px-2 py-1 rounded text-yellow-400 font-mono block w-full truncate border border-gray-800 font-bold">{dfInfo.request.length_basis}</code>
                 </div>
              </div>
            </div>
            {/* Arrow indicator for mobile */}
            <div className="flex justify-center md:hidden my-4"><ArrowRight className="w-6 h-6 text-gray-600 rotate-90" /></div>
          </div>

          {/* Step 2: Validation (Bounds) */}
          <div className="flex flex-col relative">
            <div className={`border rounded-lg p-4 flex flex-col h-full shadow-lg overflow-hidden ${isDangerous ? 'bg-red-950/10 border-red-900/30' : 'bg-green-950/10 border-green-900/30'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-md ${isDangerous ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  {isDangerous ? <ShieldAlert className={`w-5 h-5 ${isDangerous ? 'text-red-400' : 'text-green-400'}`} /> : <ShieldCheck className="w-5 h-5 text-green-400" />}
                </div>
                <h5 className="font-bold text-gray-200">2. Bounds Check</h5>
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                 <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                   <span className="text-xs text-gray-400">Lower Bound:</span>
                   <code className="text-xs font-mono text-gray-300">{dfInfo.validation.lower}</code>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                   <span className="text-xs text-gray-400">Upper Bound:</span>
                   <code className={`text-xs font-mono font-bold ${isDangerous ? 'text-red-400' : 'text-green-400'}`}>{dfInfo.validation.upper}</code>
                 </div>
                 <div className="mt-2 text-center">
                    <Badge variant={isDangerous ? "red" : "green"} className="uppercase text-[10px] tracking-wider px-2">
                      {dfInfo.validation.upper_vs_capacity}
                    </Badge>
                 </div>
              </div>
            </div>
            {/* Arrow indicator for mobile */}
            <div className="flex justify-center md:hidden my-4"><ArrowRight className="w-6 h-6 text-gray-600 rotate-90" /></div>
          </div>

          {/* Step 3: Sink (Capacity) */}
          <div className="flex flex-col relative">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col h-full shadow-lg overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-500/20 p-2 rounded-md">
                  <HardDrive className="w-5 h-5 text-purple-400" />
                </div>
                <h5 className="font-bold text-gray-200">3. Data Destination</h5>
              </div>
              <div className="space-y-3 flex-1">
                 <div>
                   <span className="text-xs text-gray-500 block mb-1">Target Buffer</span>
                   <code className="text-xs bg-gray-950 px-2 py-1 rounded text-purple-300 font-mono block w-full truncate border border-gray-800">{dfInfo.destination.expr}</code>
                 </div>
                 <div>
                   <span className="text-xs text-gray-500 block mb-1">Max Capacity</span>
                   <code className="text-xs bg-gray-950 px-2 py-1 rounded text-green-400 font-mono block w-full truncate border border-gray-800 font-bold">{dfInfo.capacity.value}</code>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
