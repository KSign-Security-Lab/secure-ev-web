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
      <div className="w-80 md:w-96 shrink-0 flex items-center justify-center text-neutral-500 bg-white border-l border-neutral-200">
        <p className="text-sm text-center px-6">
          {t("analysis.resultDetail.emptyState")}
        </p>
      </div>
    );
  }

  const isDangerous = result.dfInfo.validation.upper_vs_capacity === "Unbounded" || result.dfInfo.validation.upper === "None";

  return (
    <div className="flex flex-col h-full bg-white border-l border-neutral-200 w-80 md:w-96 shrink-0 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
        <h3 className="text-sm font-semibold text-neutral-900">
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
              <Badge variant="outline" className="border-neutral-200 text-neutral-500 truncate">
                {result.sinkKind}
              </Badge>
            </div>
            <h4 className="text-lg font-bold font-mono text-neutral-900 break-all whitespace-normal">
              {result.functionName}
            </h4>
            <p className="text-sm text-neutral-500 mt-1 font-mono break-all whitespace-normal">
              {result.filePath}:{result.startLine}-{result.endLine}
            </p>
          </div>

          {/* Core Reasoning */}
          <div className="space-y-3">
               <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                     {isDangerous ? <AlertTriangle className="w-4 h-4 text-rose-700 mt-0.5 shrink-0" /> : <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />}
                     <div>
                       <span className="text-sm font-semibold text-neutral-900 block mb-1 break-all whitespace-normal">
                         {result.dfInfo.diagnostics.class}
                       </span>
                       <div className="text-sm text-neutral-500 leading-relaxed wrap-break-word whitespace-normal">
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

               <div className="flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 p-3 rounded-md border border-neutral-200">
                  <span className="text-neutral-500">
                    {t("analysis.resultDetail.rootCause")}
                  </span>
                  <span className="text-amber-700 font-medium break-all">{result.dfInfo.root_cause.kind}</span>

               </div>
            </div>


          {/* Advanced Sections (Modals) */}
          <div className="pt-4 border-t border-neutral-200 space-y-2">

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all group">
                  <span className="flex items-center gap-3">
                     <div className="p-2 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-200 border border-blue-200 transition-all">
                        <Info className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-semibold text-neutral-900 transition-colors">
                        {t("analysis.resultDetail.fullDataFlowAnalysis")}
                     </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-all" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="shrink-0">
                  <DialogTitle>
                    {t("analysis.resultDetail.fullDataFlowAnalysis")}
                  </DialogTitle>
                  <p className="text-sm text-neutral-500 mt-2 wrap-break-word">
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
                <DialogFooter className="shrink-0 border-t border-neutral-200 pt-4 mt-6">
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
                <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all group">
                  <span className="flex items-center gap-3">
                     <div className="p-2 rounded-md bg-purple-100 text-purple-700 group-hover:bg-purple-200 border border-purple-200 transition-all">
                        <GitCompare className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-semibold text-neutral-900 transition-colors">
                        {t("analysis.resultDetail.similarSignatures")}
                     </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-purple-700 group-hover:translate-x-0.5 transition-all" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {t("analysis.resultDetail.similarSignatures")}
                  </DialogTitle>
                  <p className="text-sm text-neutral-500 mt-2">
                    {t("analysis.resultDetail.similarSignaturesDescription")}
                  </p>
                </DialogHeader>
                <div className="mt-4">
                  <SimilarSignatures result={result} />

                <DialogFooter className="mt-6 border-t border-neutral-200 pt-4">
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
