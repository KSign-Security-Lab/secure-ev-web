"use client";

import React, { useState } from "react";
import { AnalysisResult } from "./mockData";
import { ArrowRight, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";


interface ExplainabilityPanelsProps {
  result: AnalysisResult;
}

export default function ExplainabilityPanels({ result }: ExplainabilityPanelsProps) {
  const { dfInfo } = result;
  const isDangerous = dfInfo.validation.upper_vs_capacity === "Unbounded" || dfInfo.validation.upper === "None";

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

        {/* High Level Summary (Always Visible) */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
             {isDangerous ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
             <h4 className="text-lg font-semibold text-gray-200">Analysis Summary</h4>
          </div>

          <p className="text-base text-gray-300 leading-relaxed mb-4">
            The function <code className="text-blue-400 bg-gray-900 px-1.5 py-0.5 rounded font-mono">{result.functionName}</code> performs a
            <code className="text-purple-400 bg-gray-900 px-1.5 py-0.5 mx-1 rounded font-mono">{result.sinkKind}</code>
            operation on the destination <code className="text-green-400 bg-gray-900 px-1.5 py-0.5 mx-1 rounded font-mono">{dfInfo.destination.expr}</code>.
          </p>

          <div className="bg-gray-900/50 rounded p-4 border border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center w-full sm:w-auto">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex justify-center items-center gap-1">
                  Provided Capacity

                </div>
                <div className="text-xl font-mono text-green-400 font-bold">{dfInfo.capacity.value}</div>
              </div>

              <div className="flex flex-col items-center">
                 <ArrowRight className="w-6 h-6 text-gray-600 hidden sm:block" />
                 <span className="text-[10px] text-gray-500 mt-1 uppercase">Compared To</span>
              </div>

              <div className="text-center w-full sm:w-auto">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex justify-center items-center gap-1">
                  Requested Size

                </div>
                <div className="text-xl font-mono text-yellow-400 font-bold">{dfInfo.request.length_basis}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
              <p className="text-sm">
                <span className="text-gray-400">Validation State: </span>
                <span className={`font-bold ${isDangerous ? 'text-red-400' : 'text-green-400'}`}>
                  {dfInfo.validation.upper_vs_capacity}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Progressive Disclosure: Technical Details */}
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between bg-gray-950 p-4 hover:bg-gray-900 transition-colors"
          >
            <span className="font-semibold text-gray-300">View Detailed Data Flow Reasoning</span>
            {showTechnicalDetails ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
          </button>

          {showTechnicalDetails && (
            <div className="p-4 bg-gray-900 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <h5 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-1">
                  1. Data Source (Request)

                </h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">Expression:</span> <code className="font-mono">{dfInfo.request.bytes.expr}</code>
                  </li>
                  <li className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">Value Type:</span> <code className="font-mono text-yellow-400">{dfInfo.request.value}</code>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-1">
                  2. Destination (Capacity)

                </h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">Expression:</span> <code className="font-mono">{dfInfo.destination.expr}</code>
                  </li>
                  <li className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">Region:</span> <span className="text-green-400">{dfInfo.destination.region}</span>
                  </li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <h5 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-1">
                  3. Constraint Validation

                </h5>
                <div className="bg-gray-950 p-3 rounded border border-gray-800 flex flex-col sm:flex-row gap-4 justify-around text-sm">
                  <div className="text-center">
                    <span className="text-gray-500 block mb-1">Lower Bound</span>
                    <code className="font-mono bg-gray-900 px-2 py-1 rounded">{dfInfo.validation.lower}</code>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500 block mb-1">Upper Bound</span>
                    <code className="font-mono bg-gray-900 px-2 py-1 rounded">{dfInfo.validation.upper}</code>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500 block mb-1">Origin Chain</span>
                    <code className="font-mono bg-gray-900 px-2 py-1 rounded text-orange-400">{dfInfo.validation.index_origin_chain}</code>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
  );
}
