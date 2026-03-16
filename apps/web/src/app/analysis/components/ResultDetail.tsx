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


import { Button } from "~/components/ui/button";

interface ResultDetailProps {
  result: AnalysisResult | null;
}

export default function ResultDetail({ result }: ResultDetailProps) {


  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#8b949e] bg-[#0d1117] border-l border-[#30363d]">
        <p className="text-sm">Select a vulnerability or code line to view details.</p>
      </div>
    );
  }

  const isDangerous = result.dfInfo.validation.upper_vs_capacity === "Unbounded" || result.dfInfo.validation.upper === "None";

  return (
    <div className="flex flex-col h-full bg-[#161b22] border-l border-[#30363d] w-80 md:w-96 flex-shrink-0">
      <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
        <h3 className="text-sm font-semibold text-[#c9d1d9]">Issue Explanation</h3>

      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">

          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={result.risk === "High" ? "red" : result.risk === "Medium" ? "yellow" : "green" as any}>
                {result.risk} Risk
              </Badge>
              <Badge variant="outline" className="border-[#30363d] text-[#8b949e]">
                {result.sinkKind}
              </Badge>
            </div>
            <h4 className="text-lg font-bold font-mono text-[#c9d1d9] break-words">
              {result.functionName}
            </h4>
            <p className="text-sm text-[#8b949e] mt-1 font-mono break-all">
              {result.filePath}:{result.startLine}-{result.endLine}
            </p>
          </div>

          {/* Core Reasoning */}
          <div className="space-y-3">
               <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-md">
                  <div className="flex items-start gap-2">
                     {isDangerous ? <AlertTriangle className="w-4 h-4 text-[#f85149] mt-0.5 shrink-0" /> : <Info className="w-4 h-4 text-[#58a6ff] mt-0.5 shrink-0" />}
                     <div>
                       <span className="text-sm font-semibold text-[#c9d1d9] block mb-1">
                         {result.dfInfo.diagnostics.class}
                       </span>
                       <p className="text-sm text-[#8b949e] leading-relaxed">
                         {result.dfInfo.diagnostics.notes}.
                         The
                         <span className="font-semibold mx-1">request basis</span>
                         is <span className="text-[#d29922] font-mono">{result.dfInfo.request.length_basis}</span> against
                         <span className="font-semibold mx-1">capacity</span>
                         <span className="text-[#56d364] font-mono">{result.dfInfo.capacity.value}</span>.
                       </p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-sm text-[#8b949e] bg-[#0d1117] p-3 rounded-md border border-[#30363d]">
                  <span className="text-[#8b949e]">Root Cause:</span>
                  <span className="text-[#d29922] font-medium">{result.dfInfo.root_cause.kind}</span>

               </div>
            </div>


          {/* Advanced Sections (Modals) */}
          <div className="pt-4 border-t border-[#30363d] space-y-2">

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] rounded-md transition text-sm text-[#8b949e] font-medium">
                  <span className="flex items-center gap-2">
                     <Info className="w-4 h-4 text-[#8b949e]" />
                     Full Data Flow Analysis
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                  <DialogTitle>Full Data Flow Analysis</DialogTitle>
                  <p className="text-sm text-[#8b949e] mt-2">
                    Review how data travels through your code. This helps verify if a vulnerability is reachable and correctly diagnosed.
                  </p>
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
                <DialogFooter className="shrink-0 border-t border-[#30363d] pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] rounded-md transition text-sm text-[#8b949e] font-medium">
                  <span className="flex items-center gap-2">
                     <GitCompare className="w-4 h-4 text-[#8b949e]" />
                     Similar Signatures
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Similar Signatures</DialogTitle>
                  <p className="text-sm text-[#8b949e] mt-2">
                    Review other code segments in your project that share similar structural or data-flow patterns to this vulnerability.
                  </p>
                </DialogHeader>
                <div className="mt-4">
                  <SimilarSignatures result={result} />

                <DialogFooter className="mt-6 border-t border-[#30363d] pt-4">
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
