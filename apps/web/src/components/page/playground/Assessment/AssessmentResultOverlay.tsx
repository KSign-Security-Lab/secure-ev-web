"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentItem } from "./AssessmentTable";
import { cn } from "~/lib/utils";
import { 
  ShieldAlert, 
  X,
  ChevronRight,
  ChevronLeft,
  Activity,
  ShieldCheck
} from "lucide-react";

interface SimulationHistory {
  id: string;
  source: string;
  attack: string;
  status: "Success" | "Failed" | "Processing";
  time: string;
}

interface ProcessStep {
  title: string;
  description: string;
  status: "Completed" | "Processing" | "Pending";
}

interface AssessmentResultOverlayProps {
  item: AssessmentItem | null;
  open: boolean;
  onClose: () => void;
}

export const AssessmentResultOverlay: React.FC<AssessmentResultOverlayProps> = ({
  item,
  open,
  onClose,
}) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(3);

  // Reset steps ONLY when opening for a new item or initial open
  useEffect(() => {
    if (open) {
      setTimeout(() => setCurrentStep(3), 0);
    }
  }, [open, item]); // Correct dependency


  const simulationHistory: SimulationHistory[] = [
    { id: "1", source: "External", attack: "CSMS Brute Force", status: "Success", time: "14:20:11" },
    { id: "2", source: "Internal", attack: "CP Command Injection", status: "Processing", time: "14:22:05" },
    { id: "3", source: "Internal", attack: "Lateral Movement Alpha", status: "Failed", time: "14:25:00" },
    { id: "4", source: "External", attack: "Data Exfiltration Test", status: "Success", time: "14:30:12" },
  ];

  const processSteps: ProcessStep[] = [
    { title: "Initialization", description: "Securing connection to target sensors...", status: "Completed" },
    { title: "Target Recognition", description: "Identifying CP and SCMS assets in network segment...", status: "Completed" },
    { title: "Vector Selection", description: "Selecting optimal attack pattern based on target OS...", status: "Processing" },
    { title: "Payload Delivery", description: "Encrypting and transmitting exploitation buffer...", status: "Pending" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      hideHeader={true}
      disableDefaultStyles={true}
      className="max-w-5xl bg-slate-950 border border-slate-800 shadow-2xl p-0 overflow-hidden"
    >
      <div className="flex flex-col h-[880px] max-h-[95vh]">
        {/* Top Dynamic Progress Bar */}
        <div className="absolute top-0 left-0 bg-red-600 h-[2px] shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-700 ease-out z-50 rounded-full" 
          style={{ width: currentStep === 3 ? '50%' : '100%' }}
        />
        <div className="relative w-full h-[2px] bg-slate-800 shrink-0" />

        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl flex justify-between items-center shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-white tracking-tight uppercase leading-none">
              {item ? item.name : t("assessment.detail.newAssessment")}
            </h1>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
              <span className="flex items-center gap-1.5 opacity-60"><ShieldAlert size={12} className="text-orange-500" /> ID: {item?.id}</span>
              <span className="w-1 h-1 rounded-full bg-slate-900" />
              <span className="text-[10px] opacity-40 italic lowercase">v1.2.4-stable</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </header>
        

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Minimalist Phase Header */}
          <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center",
                currentStep === 3 ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-slate-800 text-slate-400 bg-slate-900"
              )}>
                {currentStep === 3 ? <Activity size={18} /> : <ShieldCheck size={18} />}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest leading-none">
                  PHASE 0{currentStep === 3 ? 1 : 2}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest leading-none">
                  {currentStep === 3 ? t("assessment.detail.step3") : t("assessment.detail.step4")}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className={cn("h-1 w-6 rounded-full", currentStep >= 3 ? "bg-red-500" : "bg-slate-800")} />
                <div className={cn("h-1 w-6 rounded-full", currentStep >= 4 ? "bg-red-500" : "bg-slate-800")} />
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep === 3 ? (
              <div className="space-y-10">
                {/* Reverting to Stacked Layout: Simulation History (Full Width) */}
                <div className="space-y-4">
                  <header className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-red-500/80 rounded-full" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t("assessment.result.simulationHistory")}</span>
                  </header>
                  <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-900/30 shadow-2xl backdrop-blur-sm">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[10px]">
                        <tr>
                          <th className="p-5 w-12 text-center opacity-40 italic">#</th>
                          <th className="p-5">{t("assessment.result.source")}</th>
                          <th className="p-5">{t("assessment.result.attack")}</th>
                          <th className="p-5 text-center">{t("assessment.result.status")}</th>
                          <th className="p-5 text-right font-sans">E_TIMESTAMP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-400">
                        {simulationHistory.map((sim, idx) => (
                          <tr key={idx} className="transition-colors group">
                            <td className="p-5 text-center font-bold text-slate-600 italic">#{sim.id.padStart(2, '0')}</td>
                            <td className="p-5">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold border",
                                sim.source === "External" ? "border-red-500/20 text-red-500/70 bg-red-500/5" : "border-slate-800 text-slate-500 font-mono"
                              )}>
                                {sim.source}
                              </span>
                            </td>
                            <td className="p-5">
                              <div className="flex flex-col">
                                <span className="text-slate-200 font-bold group-hover:text-white transition-colors uppercase tracking-tight">{sim.attack}</span>
                                <span className="text-[10px] text-slate-600 uppercase tracking-widest leading-none mt-1">VECTOR_ID: {sim.id}</span>
                              </div>
                            </td>
                            <td className="p-5 text-center">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                sim.status === "Success" 
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" 
                                  : sim.status === "Failed"
                                    ? "bg-red-500/5 border-red-500/20 text-red-500"
                                    : "bg-blue-500/5 border-blue-500/20 text-blue-400 animate-pulse"
                              )}>
                                <div className={cn("w-1 h-1 rounded-full", sim.status === "Success" ? "bg-emerald-500" : sim.status === "Failed" ? "bg-red-500" : "bg-blue-400")} />
                                {sim.status}
                              </span>
                            </td>
                            <td className="p-5 text-right font-mono text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-widest">
                              {sim.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Reverting to Stacked Layout: Process View (Full Width) */}
                <div className="space-y-4">
                  <header className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{t("assessment.result.processView")}</span>
                  </header>
                  <div className="p-8 border border-slate-800/60 rounded-2xl bg-slate-950 shadow-2xl relative min-h-[300px]">
                    {/* Vertical line with subtle gradient */}
                    <div className="absolute left-[41px] top-12 bottom-12 w-[2px] bg-linear-to-b from-red-500/30 via-slate-800 to-slate-800" />
                    
                    <div className="space-y-10 relative z-10">
                      {processSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-8 group">
                          <div className="relative shrink-0 flex items-center justify-center">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 z-10 transition-all duration-500",
                              step.status === "Completed" ? "bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : 
                              step.status === "Processing" ? "bg-orange-500 animate-pulse border-orange-400" : "bg-slate-900 border-slate-800"
                            )} />
                            {step.status === "Processing" && (
                              <div className="absolute inset-0 w-4 h-4 rounded-full bg-orange-500 animate-ping opacity-20" />
                            )}
                          </div>
                          <div className="flex-1 pb-6 border-b border-white/5">
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className={cn(
                                    "text-xs font-black uppercase tracking-[0.15em] transition-colors",
                                    step.status === "Completed" ? "text-white" : step.status === "Processing" ? "text-orange-400" : "text-slate-500"
                                  )}>
                                    {step.title}
                                  </h4>
                                  <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">
                                      {step.status === "Completed" ? "ACT_LOG_" + (idx+1) : "RT_PEND"}
                                  </span>
                              </div>
                              <p className="text-sm text-slate-400 leading-relaxed font-medium transition-colors group-hover:text-slate-300">
                                {step.description}
                              </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                {/* Summary Diagram (Full Width or smaller centering) - MOVED UP */}
                <div className="space-y-4">
                  <header className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">VISUAL_EVIDENCE_MAP</span>
                  </header>
                  <div className="relative aspect-4/1 w-full bg-slate-950 border border-slate-800/60 rounded-xl flex items-center justify-center overflow-hidden group shadow-2xl backdrop-blur-sm shrink-0">
                      {/* More complex SVG grid overlay (less intense) */}
                      <div className="absolute inset-0 opacity-5" 
                        style={{ 
                          backgroundImage: `linear-gradient(#ff4400 1px, transparent 1px), linear-gradient(90deg, #ff4400 1px, transparent 1px)`,
                          backgroundSize: '40px 40px'
                        }} 
                      />
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-red-500/2 to-transparent pointer-events-none" />
                      
                      <div className="z-10 text-center space-y-4 px-12">
                          <div className="w-16 h-1 max-w-[120px] bg-red-600/20 mx-auto rounded-full" />
                          <div className="text-sm font-bold text-slate-500 uppercase tracking-[0.4em] leading-relaxed">
                              {t("assessment.detail.scenarioDiagram")}
                          </div>
                          <p className="text-[10px] text-slate-700 font-mono uppercase tracking-widest max-w-[300px] mx-auto opacity-50">
                              Layered topology visualization rendering in secondary buffer...
                          </p>
                      </div>
                  </div>
                </div>

                {/* Result Confirmation (Full Width) */}
                <div className="space-y-4">
                     <header className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-red-600/80 rounded-full" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">CAPABILITY_RESULT_ANALYSIS</span>
                    </header>
                    <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-900/30 shadow-2xl backdrop-blur-sm">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[10px]">
                          <tr>
                            <th className="p-5">ID</th>
                            <th className="p-5">{t("assessment.result.capabilityName")}</th>
                            <th className="p-5 text-center">{t("assessment.result.confirmStatus")}</th>
                            <th className="p-5 text-right">{t("assessment.result.riskLevel")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-400">
                          {simulationHistory.map((sim) => (
                            <tr key={sim.id} className="transition-colors group">
                              <td className="p-5 text-slate-600 italic">#{sim.id.padStart(3, '0')}</td>
                              <td className="p-5">
                                <div className="flex flex-col">
                                    <span className="text-slate-200 font-bold group-hover:text-white transition-all uppercase tracking-tight">{sim.attack}</span>
                                    <span className="text-[9px] text-slate-700 uppercase tracking-[0.3em] font-black mt-1">SIG_MATCH: 0x82{sim.id}</span>
                                </div>
                              </td>
                              <td className="p-5 text-center">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest transition-all",
                                  sim.status === "Success" 
                                    ? "bg-slate-800 border-slate-700 text-slate-500" 
                                    : "bg-red-500/80 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                )}>
                                  {sim.status === "Success" ? "Bypassed" : "Alert Triggered"}
                                </span>
                              </td>
                              <td className="p-5 text-right">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded inline-block",
                                  sim.status === "Success" ? "text-red-500 bg-red-500/5 border border-red-500/20" : "text-amber-500 bg-amber-500/5 border border-amber-500/20"
                                )}>
                                  {sim.status === "Success" ? "Critical" : "High"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="px-6 py-4 bg-slate-900/30 border-t border-slate-800/50 flex justify-between items-center shrink-0">
          <button
            onClick={() => setCurrentStep(3)}
            disabled={currentStep === 3}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all",
              currentStep === 3
                ? "text-slate-700 cursor-not-allowed"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/50"
            )}
          >
            <ChevronLeft size={16} />
            {t("common.previous")}
          </button>
          
          {currentStep === 3 ? (
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all bg-red-600/80 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            >
              {t("common.next")}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all bg-red-600/80 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] active:scale-95"
            >
              <X size={14} />
              {t("common.close")}
            </button>
          )}
        </footer>
      </div>
    </Modal>
  );
};
