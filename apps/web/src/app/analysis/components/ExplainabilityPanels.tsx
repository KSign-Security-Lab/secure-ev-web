"use client";

import React from "react";
import { AnalysisResult } from "./mockData";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ExplainabilityPanelsProps {
  result: AnalysisResult;
}

export default function ExplainabilityPanels({ result }: ExplainabilityPanelsProps) {
  const { dfInfo } = result;

  const isDangerous = dfInfo.validation.upper_vs_capacity === "Unbounded" || dfInfo.validation.upper === "None";

  return (
    <div className="space-y-4">
      {/* Natural Language Explanation */}
      <div className="bg-gray-950 border border-gray-800 rounded p-4">
        <h5 className="font-semibold text-sm mb-2 text-gray-300">Analysis Summary</h5>
        <p className="text-sm text-gray-400 leading-relaxed">
          The function <code className="text-blue-400 bg-gray-900 px-1 rounded">{result.functionName}</code> performs a
          <code className="text-purple-400 bg-gray-900 px-1 mx-1 rounded">{result.sinkKind}</code> operation on
          <code className="text-green-400 bg-gray-900 px-1 mx-1 rounded">{dfInfo.destination.expr}</code>.
          The requested size relies on <code className="text-yellow-400 bg-gray-900 px-1 rounded">{dfInfo.request.length_basis}</code>,
          but the validation state is <strong>{dfInfo.validation.upper_vs_capacity}</strong>.
          {isDangerous ? " This indicates a potential risk because the request can exceed the capacity without bounds checking." : " The bounds appear to be correctly checked."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Capacity vs Request Comparison */}
        <div className="bg-gray-950 border border-gray-800 rounded p-4 flex flex-col items-center justify-center text-center">
          <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-4 w-full text-left">Capacity vs Request</h5>

          <div className="flex items-center justify-center space-x-6 w-full px-4">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-mono text-green-400 mb-1">{dfInfo.capacity.value}</div>
              <div className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Capacity</div>
            </div>

            <div className="text-gray-600">
              {isDangerous ? <AlertTriangle className="w-6 h-6 text-red-500" /> : <CheckCircle2 className="w-6 h-6 text-green-500" />}
            </div>

            <div className="flex flex-col items-center">
              <div className={`text-2xl font-mono mb-1 ${isDangerous ? 'text-red-400' : 'text-green-400'}`}>
                {dfInfo.request.value}
              </div>
              <div className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Request</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Validation State: <span className={`font-semibold ${isDangerous ? 'text-red-400' : 'text-green-400'}`}>{dfInfo.validation.upper_vs_capacity}</span>
          </div>
        </div>

        {/* Origin Flow Visualizations */}
        <div className="bg-gray-950 border border-gray-800 rounded p-4">
          <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-4">Origin Chains</h5>

          <div className="space-y-4">
            {/* length_basis flow */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Length Basis Flow:</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="bg-gray-900 px-2 py-1 rounded text-blue-400 font-mono text-xs">{dfInfo.request.token}</span>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <span className="bg-gray-900 px-2 py-1 rounded text-purple-400 font-mono text-xs">{dfInfo.request.length_basis}</span>
              </div>
            </div>

            {/* index_origin_chain flow */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Index Origin Chain:</div>
              <div className="text-sm bg-gray-900 p-2 rounded border border-gray-800">
                <code className="text-xs text-orange-400 break-words">{dfInfo.validation.index_origin_chain}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
