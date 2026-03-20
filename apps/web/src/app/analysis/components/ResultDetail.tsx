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
import { useI18n } from "~/i18n/I18nProvider";

interface ResultDetailProps {
  result: AnalysisResult | null;
}

export default function ResultDetail({ result }: ResultDetailProps) {
  const { t } = useI18n();

  const getRiskLabel = (risk: AnalysisResult["risk"]) => {
    switch (risk) {
      case "High":
        return t("risk.high");
      case "Medium":
        return t("risk.medium");
      case "Low":
        return t("risk.low");
      default:
        return risk;
    }
  };

  if (!result) {
    return (
      <div className="w-80 md:w-96 shrink-0 flex items-center justify-center text-[#8b949e] bg-[#0d1117] border-l border-[#30363d]">
        <p className="text-sm text-center px-6">
          {t("analysis.resultDetail.emptyState")}
        </p>
      </div>
    );
  }

  const isDangerous = result.dfInfo.validation.upper_vs_capacity === "Unbounded" || result.dfInfo.validation.upper === "None";

  return (
    <div className="flex flex-col h-full bg-[#161b22] border-l border-[#30363d] w-80 md:w-96 shrink-0 overflow-hidden">
      <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
        <h3 className="text-sm font-semibold text-[#c9d1d9]">
          {t("analysis.resultDetail.title")}
        </h3>

      </div>

      <ScrollArea className="flex-1 w-full">
        <div className="p-4 space-y-6 w-full overflow-hidden">

          {/* Header Info */}
          <div className="max-w-full overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={result.risk === "High" ? "red" : result.risk === "Medium" ? "yellow" : "green" as any}>
                {t("analysis.resultDetail.riskBadge", {
                  risk: getRiskLabel(result.risk),
                })}
              </Badge>
              <Badge variant="outline" className="border-[#30363d] text-[#8b949e] truncate">
                {result.sinkKind}
              </Badge>
            </div>
            <h4 className="text-lg font-bold font-mono text-[#c9d1d9] break-all whitespace-normal">
              {result.functionName}
            </h4>
            <p className="text-sm text-[#8b949e] mt-1 font-mono break-all whitespace-normal">
              {result.filePath}:{result.startLine}-{result.endLine}
            </p>
          </div>

          {/* Core Reasoning */}
          <div className="space-y-3">
               <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-md">
                  <div className="flex items-start gap-2">
                     {isDangerous ? <AlertTriangle className="w-4 h-4 text-[#f85149] mt-0.5 shrink-0" /> : <Info className="w-4 h-4 text-[#58a6ff] mt-0.5 shrink-0" />}
                     <div>
                       <span className="text-sm font-semibold text-[#c9d1d9] block mb-1 break-all whitespace-normal">
                         {result.dfInfo.diagnostics.class}
                       </span>
                       <div className="text-sm text-[#8b949e] leading-relaxed wrap-break-word whitespace-normal">
                         <p className="inline wrap-break-word">
                           {result.dfInfo.diagnostics.notes}.{" "}
                           {t("analysis.resultDetail.requestCapacitySentence", {
                             requestBasis: result.dfInfo.request.length_basis,
                             capacity: result.dfInfo.capacity.value,
                           })}
                         </p>
                       </div>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-sm text-[#8b949e] bg-[#0d1117] p-3 rounded-md border border-[#30363d]">
                  <span className="text-[#8b949e]">
                    {t("analysis.resultDetail.rootCause")}
                  </span>
                  <span className="text-[#d29922] font-medium break-all">{result.dfInfo.root_cause.kind}</span>

               </div>
            </div>


          {/* Advanced Sections (Modals) */}
          <div className="pt-4 border-t border-[#30363d] space-y-2">

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 bg-blue-900/20 hover:bg-blue-800/30 border border-blue-500/30 hover:border-blue-500/60 rounded-lg transition-all group shadow-[0_0_15px_-5px_rgba(59,130,246,0.1)]">
                  <span className="flex items-center gap-3">
                     <div className="p-2 rounded-md bg-blue-500/20 text-[#79c0ff] group-hover:bg-blue-500/30 group-hover:text-white border border-blue-500/30 transition-all">
                        <Info className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-semibold text-[#c9d1d9] group-hover:text-white transition-colors">
                        {t("analysis.resultDetail.fullDataFlowAnalysis")}
                     </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#79c0ff]/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="shrink-0">
                  <DialogTitle>
                    {t("analysis.resultDetail.fullDataFlowAnalysis")}
                  </DialogTitle>
                  <p className="text-sm text-[#8b949e] mt-2 wrap-break-word">
                    {t("analysis.resultDetail.fullDataFlowDescription")}
                  </p>
                </DialogHeader>
                <div className="flex-1 min-h-0 mt-6 overflow-hidden">
                  <Tabs defaultValue="explanation" className="h-full flex flex-col">
                    <TabsList className="shrink-0 grid w-full grid-cols-2 max-w-[400px]">
                      <TabsTrigger value="explanation">
                        {t("analysis.resultDetail.explanation")}
                      </TabsTrigger>
                      <TabsTrigger value="raw">
                        {t("analysis.resultDetail.rawNodes")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="explanation" className="flex-1 overflow-y-auto custom-scrollbar mt-4 pr-2 focus-visible:ring-0">
                      <div className="space-y-4">
                        <ExplainabilityPanels result={result} />
                      </div>
                    </TabsContent>
                    <TabsContent value="raw" className="flex-1 overflow-y-auto custom-scrollbar mt-4 pr-2 focus-visible:ring-0">
                       <div className="space-y-4">
                        <DFInfoCards dfInfo={result.dfInfo} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <DialogFooter className="shrink-0 border-t border-[#30363d] pt-4 mt-6">
                  <DialogClose asChild>
                    <Button variant="outline">
                      {t("analysis.resultDetail.close")}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 bg-purple-900/20 hover:bg-purple-800/30 border border-purple-500/30 hover:border-purple-500/60 rounded-lg transition-all group shadow-[0_0_15px_-5px_rgba(168,85,247,0.1)]">
                  <span className="flex items-center gap-3">
                     <div className="p-2 rounded-md bg-purple-500/20 text-[#d2a8ff] group-hover:bg-purple-500/30 group-hover:text-white border border-purple-500/30 transition-all">
                        <GitCompare className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-semibold text-[#c9d1d9] group-hover:text-white transition-colors">
                        {t("analysis.resultDetail.similarSignatures")}
                     </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#d2a8ff]/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {t("analysis.resultDetail.similarSignatures")}
                  </DialogTitle>
                  <p className="text-sm text-[#8b949e] mt-2">
                    {t("analysis.resultDetail.similarSignaturesDescription")}
                  </p>
                </DialogHeader>
                <div className="mt-4">
                  <SimilarSignatures result={result} />

                <DialogFooter className="mt-6 border-t border-[#30363d] pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">
                      {t("analysis.resultDetail.close")}
                    </Button>
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
