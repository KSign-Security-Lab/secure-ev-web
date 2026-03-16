"use client";

import React from "react";
import { AnalysisResult } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ChevronRight, Share2, MessageSquare, AlertTriangle, Info, GitCompare } from "lucide-react";
import DFInfoCards from "./DFInfoCards";
import ExplainabilityPanels from "./ExplainabilityPanels";
import SimilarSignatures from "./SimilarSignatures";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

interface ResultDetailProps {
  result: AnalysisResult | null;
}

export default function ResultDetail({ result }: ResultDetailProps) {


  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950 border-l border-gray-800">
        <p className="text-sm">Select a vulnerability or code line to view details.</p>
      </div>
    );
  }

  const isDangerous = result.dfInfo.validation.upper_vs_capacity === "Unbounded" || result.dfInfo.validation.upper === "None";

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-80 md:w-96 flex-shrink-0">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <h3 className="text-sm font-semibold text-gray-200">Issue Explanation</h3>
        <div className="flex gap-1">
           <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded transition" title="Add Note">
             <MessageSquare className="w-4 h-4" />
           </button>
           <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded transition" title="Share/Export">
             <Share2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">

          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={result.risk === "High" ? "red" : result.risk === "Medium" ? "yellow" : "green" as any}>
                {result.risk} Risk
              </Badge>
              <Badge variant="outline" className="border-gray-700 text-gray-300">
                {result.sinkKind}
              </Badge>
            </div>
            <h4 className="text-lg font-bold font-mono text-gray-100 break-words">
              {result.functionName}
            </h4>
            <p className="text-sm text-gray-400 mt-1 font-mono break-all">
              {result.filePath}:{result.startLine}-{result.endLine}
            </p>
          </div>

          {/* Core Reasoning */}
          <div className="space-y-3">
             <div className="bg-gray-950 border border-gray-800 p-3 rounded-md">
                <div className="flex items-start gap-2">
                   {isDangerous ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> : <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                   <div>
                     <span className="text-sm font-semibold text-gray-200 block mb-1">
                       {result.dfInfo.diagnostics.class}
                     </span>
                     <p className="text-xs text-gray-400 leading-relaxed">
                       {result.dfInfo.diagnostics.notes}. The request basis is <span className="text-yellow-400 font-mono">{result.dfInfo.request.length_basis}</span> against capacity <span className="text-green-400 font-mono">{result.dfInfo.capacity.value}</span>.
                     </p>
                   </div>
                </div>
             </div>

             <div className="text-xs text-gray-400 bg-gray-950 p-2 rounded-md border border-gray-800">
                <span className="text-gray-500">Root Cause:</span> <span className="text-orange-400">{result.dfInfo.root_cause.kind}</span>
             </div>
          </div>


          {/* Advanced Sections (Modals) */}
          <div className="pt-4 border-t border-gray-800 space-y-2">

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 bg-gray-950 hover:bg-gray-900 border border-gray-800 rounded-md transition text-sm text-gray-300 font-medium">
                  <span className="flex items-center gap-2">
                     <Info className="w-4 h-4 text-gray-500" />
                     Full Data Flow Analysis
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Full Data Flow Analysis</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-6">
                  <ExplainabilityPanels result={result} />
                  <div className="pt-4 border-t border-gray-800">
                    <DFInfoCards dfInfo={result.dfInfo} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 bg-gray-950 hover:bg-gray-900 border border-gray-800 rounded-md transition text-sm text-gray-300 font-medium">
                  <span className="flex items-center gap-2">
                     <GitCompare className="w-4 h-4 text-gray-500" />
                     Similar Signatures
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Similar Signatures & Embeddings</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <SimilarSignatures result={result} />
                </div>
              </DialogContent>
            </Dialog>

          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
