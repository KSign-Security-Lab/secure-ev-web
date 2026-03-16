"use client";

import React from "react";
import { AnalysisResult } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ChevronRight, AlertTriangle, Info, GitCompare } from "lucide-react";
import DFInfoCards from "./DFInfoCards";
import ExplainabilityPanels from "./ExplainabilityPanels";
import SimilarSignatures from "./SimilarSignatures";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

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
          <TooltipProvider delayDuration={300}>
            <div className="space-y-3">
               <div className="bg-gray-950 border border-gray-800 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                     {isDangerous ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> : <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                     <div>
                       <span className="text-sm font-semibold text-gray-200 block mb-1">
                         {result.dfInfo.diagnostics.class}
                       </span>
                       <p className="text-sm text-gray-400 leading-relaxed">
                         {result.dfInfo.diagnostics.notes}.
                         The
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <span className="border-b border-dashed border-gray-500 cursor-help mx-1 hover:text-gray-200 transition">request basis</span>
                           </TooltipTrigger>
                           <TooltipContent><p className="max-w-xs text-center">The variable or value controlling the size of the incoming data</p></TooltipContent>
                         </Tooltip>
                         is <span className="text-yellow-400 font-mono">{result.dfInfo.request.length_basis}</span> against
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <span className="border-b border-dashed border-gray-500 cursor-help mx-1 hover:text-gray-200 transition">capacity</span>
                           </TooltipTrigger>
                           <TooltipContent><p className="max-w-xs text-center">The allocated size of the destination buffer</p></TooltipContent>
                         </Tooltip>
                         <span className="text-green-400 font-mono">{result.dfInfo.capacity.value}</span>.
                       </p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-950 p-3 rounded-md border border-gray-800">
                  <span className="text-gray-500">Root Cause:</span>
                  <span className="text-orange-400 font-medium">{result.dfInfo.root_cause.kind}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 text-gray-600 cursor-help hover:text-gray-300 transition" />
                    </TooltipTrigger>
                    <TooltipContent><p className="max-w-xs text-center">The fundamental reason why this vulnerability exists (e.g. missing bounds check before a copy)</p></TooltipContent>
                  </Tooltip>
               </div>
            </div>
          </TooltipProvider>


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
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                  <div className="flex items-center justify-between">
                    <DialogTitle>Full Data Flow Analysis</DialogTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-gray-500 mr-8 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent><p className="max-w-sm text-center">This modal explains the path data takes from source to sink, and why the analysis flagged it as dangerous.</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </DialogHeader>
                <div className="flex-1 overflow-hidden mt-4">
                  <Tabs defaultValue="explanation" className="h-full flex flex-col">
                    <TabsList className="shrink-0 grid w-full grid-cols-2 max-w-[400px]">
                      <TabsTrigger value="explanation">Explanation</TabsTrigger>
                      <TabsTrigger value="raw">Raw Data Flow Nodes</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 pr-2">
                      <TabsContent value="explanation" className="m-0 space-y-4">
                        <ExplainabilityPanels result={result} />
                      </TabsContent>
                      <TabsContent value="raw" className="m-0 space-y-4">
                        <DFInfoCards dfInfo={result.dfInfo} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
                <DialogFooter className="shrink-0 border-t border-gray-800 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
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

                <DialogFooter className="mt-6 border-t border-gray-800 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
</div>
              </DialogContent>
            </Dialog>

          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
