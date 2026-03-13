"use client";

import React, { useState } from "react";
import { AnalysisResult } from "./mockData";
import DFInfoCards from "./DFInfoCards";
import ExplainabilityPanels from "./ExplainabilityPanels";
import SimilarSignatures from "./SimilarSignatures";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Code, Share2, Info, MessageSquare } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

interface ResultDetailProps {
  result: AnalysisResult;
}

export default function ResultDetail({ result }: ResultDetailProps) {
  const [activeTab, setActiveTab] = useState<"details" | "similar">("details");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-950 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold font-mono text-gray-100 flex items-center gap-2">
              {result.functionName}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              <span className="font-mono">{result.filePath}</span> • {result.lineInfo}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <MessageSquare className="w-4 h-4 mr-2" /> Note
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Share2 className="w-4 h-4 mr-2" /> Export
            </Button>
            <select className="bg-gray-800 border border-gray-700 text-sm rounded px-2 h-8 outline-none">
              <option>Change Triage...</option>
              <option>False Positive</option>
              <option>Fixed</option>
              <option>Review Needed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Sink: {result.sinkKind}</Badge>
          <Badge variant="outline" className="border-gray-700 text-gray-400">
            {result.evidenceRefs.join(" • ")}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800 bg-gray-900">
        <button
          onClick={() => setActiveTab("details")}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "details"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Data Flow Details
        </button>
        <button
          onClick={() => setActiveTab("similar")}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "similar"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Similar Signatures
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {activeTab === "details" ? (
            <div className="space-y-8">
              {/* Snippet */}
              <div className="border border-gray-800 rounded bg-black overflow-hidden">
                <div className="bg-gray-900 text-gray-400 text-xs px-3 py-1.5 border-b border-gray-800 flex items-center gap-2">
                  <Code className="w-3 h-3" /> Source Context
                </div>
                <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                  <code>{result.snippet}</code>
                </pre>
              </div>

              {/* Explainability Panels */}
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" /> Evidence & Reasoning
                </h4>
                <ExplainabilityPanels result={result} />
              </div>

              {/* DF Cards */}
              <div>
                <h4 className="text-md font-semibold mb-3">Raw Data Flow Properties</h4>
                <DFInfoCards dfInfo={result.dfInfo} />
              </div>
            </div>
          ) : (
            <SimilarSignatures result={result} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
