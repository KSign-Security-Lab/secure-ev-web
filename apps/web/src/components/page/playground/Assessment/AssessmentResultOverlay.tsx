"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentItem } from "./AssessmentTable";
import { cn } from "~/lib/utils";
import { 
  ShieldAlert, 
  X,
  Activity,
  Trash2,
  Play
} from "lucide-react";

interface AbilityResult {
  id: string;
  name: string;
  status: "Success" | "Failed" | "Processing";
}

interface ProcessStep {
  title: string;
  description: string;
  status: "Completed" | "Processing" | "Pending" | "Failed";
}

interface SimulationRun {
  id: string;
  attack: string;
  status: "Success" | "Failed" | "Processing";
  time: string;
  processSteps: ProcessStep[];
  results: AbilityResult[];
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
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const selectedRun = runs.find(r => r.id === selectedRunId);

  // Initialize data
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const initialRuns: SimulationRun[] = [
          { 
            id: "1", attack: "CSMS Brute Force", status: "Success", time: "14:20:11",
            processSteps: [
              { title: "Initialization", description: "Securing connection to target sensors...", status: "Completed" },
              { title: "Target Recognition", description: "Identifying CP and SCMS assets in network segment...", status: "Completed" },
              { title: "Vector Selection", description: "Selecting optimal attack pattern based on target OS...", status: "Completed" },
              { title: "Payload Delivery", description: "Exploit execution successful.", status: "Completed" },
            ],
            results: [
              { id: "01", name: "Scan Host", status: "Success" },
              { id: "02", name: "Auth Bypass", status: "Success" },
            ]
          },
          { 
            id: "2", attack: "CP Command Injection", status: "Processing", time: "14:22:05",
            processSteps: [
              { title: "Initialization", description: "Establishing local agent tunnel...", status: "Completed" },
              { title: "Target Recognition", description: "Probing OCPP port 8080...", status: "Completed" },
              { title: "Vector Selection", description: "Injecting malicious heartbeat payload...", status: "Processing" },
              { title: "Payload Delivery", description: "Awaiting shell callback...", status: "Pending" },
            ],
            results: [
              { id: "01", name: "OCPP Probe", status: "Success" },
              { id: "02", name: "Command Inj", status: "Processing" },
            ]
          },
          { 
            id: "3", attack: "Lateral Movement Alpha", status: "Failed", time: "14:25:00",
            processSteps: [
              { title: "Initialization", description: "Securing connection to target sensors...", status: "Completed" },
              { title: "Target Recognition", description: "Identifying CP and SCMS assets in network segment...", status: "Completed" },
              { title: "Vector Selection", description: "No viable path found to secondary segment.", status: "Failed" },
              { title: "Payload Delivery", description: "Process aborted.", status: "Pending" },
            ],
            results: [
              { id: "01", name: "Pivot Scan", status: "Failed" },
            ]
          },
        ];
        setRuns(initialRuns);
        setSelectedRunId(initialRuns[0].id);
      }, 0);
    }
  }, [open, item]);

  const handleDeleteRun = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRuns(prev => {
      const next = prev.filter(r => r.id !== id);
      if (selectedRunId === id) {
        setSelectedRunId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const handleRunSimulation = () => {
    const maxId = runs.length > 0 ? Math.max(...runs.map(r => parseInt(r.id))) : 0;
    const newId = (maxId + 1).toString();
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                    now.getMinutes().toString().padStart(2, '0') + ":" + 
                    now.getSeconds().toString().padStart(2, '0');

    const newRun: SimulationRun = {
      id: newId,
      attack: "Dynamic Assessment Task",
      status: "Processing",
      time: timeStr,
      processSteps: [
        { title: "Initialization", description: "Spinning up dynamic assessment container...", status: "Processing" },
        { title: "Target Recognition", description: "Pending network discovery...", status: "Pending" },
        { title: "Vector Selection", description: "Awaiting recognition results...", status: "Pending" },
        { title: "Payload Delivery", description: "Queueing execution unit...", status: "Pending" },
      ],
      results: []
    };

    setRuns(prev => [...prev, newRun]);
    setSelectedRunId(newId);

    // Mock completion after 3 seconds
    setTimeout(() => {
      setRuns(prev => prev.map(r => r.id === newId ? {
        ...r,
        status: "Success",
        processSteps: r.processSteps.map(s => ({ ...s, status: "Completed" })),
        results: [
          { id: "R1", name: "Dynamic Probe", status: "Success" }
        ]
      } : r));
    }, 3000);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      hideHeader={true}
      disableDefaultStyles={true}
      className="max-w-5xl bg-slate-900 border border-slate-800 shadow-2xl p-0 overflow-hidden"
    >
      <div className="flex flex-col h-[880px] max-h-[95vh]">
        <div className="relative w-full h-[2px] bg-slate-800 shrink-0" />

        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-xl flex justify-between items-center shrink-0">
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
          <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Simulation History Section */}
            <div className="space-y-4">
              <header className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-red-500/80 rounded-full" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t("assessment.result.simulationHistory")}</span>
                  </div>
                  <button 
                    onClick={handleRunSimulation}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-700 transition-all uppercase tracking-widest shadow-lg active:scale-95"
                  >
                    <Play size={12} className="text-emerald-500" />
                    {t("assessment.detail.runSimulation")}
                  </button>
              </header>
              <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-900/30 shadow-2xl backdrop-blur-sm">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-slate-900/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[10px]">
                    <tr>
                      <th className="p-5 w-12 text-center opacity-40 italic">#</th>
                      <th className="p-5">{t("assessment.result.attack")}</th>
                      <th className="p-5 text-center">{t("assessment.result.status")}</th>
                      <th className="p-5 text-center font-sans">E_TIMESTAMP</th>
                      <th className="p-5 w-16 text-center">OP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-400">
                    {runs.map((sim) => (
                      <tr 
                        key={sim.id} 
                        onClick={() => setSelectedRunId(sim.id)}
                        className={cn(
                          "transition-all group cursor-pointer border-l-2",
                          selectedRunId === sim.id ? "bg-blue-500/5" : "border-l-transparent hover:bg-slate-800/20"
                        )}
                        style={selectedRunId === sim.id ? { borderLeftColor: '#3b82f6' } : {}}
                      >
                        <td className="p-5 text-center font-bold text-slate-600 italic">#{sim.id.padStart(2, '0')}</td>
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-bold transition-colors uppercase tracking-tight",
                              selectedRunId === sim.id ? "text-white" : "text-slate-200 group-hover:text-white"
                            )}>{sim.attack}</span>
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
                        <td className="p-5 text-center font-mono text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-widest">
                          {sim.time}
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={(e) => handleDeleteRun(e, sim.id)}
                            className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {runs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-600 italic uppercase tracking-[0.2em] text-[10px]">
                          No simulation history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRun ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                {/* Process View Section */}
                <div className="space-y-4">
                  <header className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{t("assessment.result.processView")}</span>
                  </header>
                  <div className="p-8 border border-slate-800/60 rounded-2xl bg-slate-900/40 shadow-2xl relative min-h-[300px]">
                    <div className="absolute left-[41px] top-12 bottom-12 w-[2px] bg-linear-to-b from-red-500/30 via-slate-800 to-slate-800" />
                    
                    <div className="space-y-10 relative z-10">
                      {selectedRun.processSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-8 group">
                          <div className="relative shrink-0 flex items-center justify-center">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 z-10 transition-all duration-500",
                              step.status === "Completed" ? "bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : 
                              step.status === "Processing" ? "bg-orange-500 animate-pulse border-orange-400" : 
                              step.status === "Failed" ? "bg-red-900 border-red-500" : "bg-slate-900 border-slate-800"
                            )} />
                            {step.status === "Processing" && (
                              <div className="absolute inset-0 w-4 h-4 rounded-full bg-orange-500 animate-ping opacity-20" />
                            )}
                          </div>
                          <div className="flex-1 pb-6 border-b border-white/5">
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className={cn(
                                    "text-xs font-black uppercase tracking-[0.15em] transition-colors",
                                    step.status === "Completed" ? "text-white" : 
                                    step.status === "Processing" ? "text-orange-400" : 
                                    step.status === "Failed" ? "text-red-500" : "text-slate-500"
                                  )}>
                                    {step.title}
                                  </h4>
                                  <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">
                                      {step.status === "Completed" ? "ACT_LOG_" + (idx+1) : "RT_STATUS"}
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

                {/* Capability Results Section */}
                <div className="space-y-4">
                     <header className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-red-600/80 rounded-full" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">CAPABILITY_RESULT_ANALYSIS</span>
                    </header>
                    <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-900/30 shadow-2xl backdrop-blur-sm">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead className="bg-slate-900/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[10px]">
                          <tr>
                            <th className="p-5">ID</th>
                            <th className="p-5">{t("assessment.result.capabilityName")}</th>
                            <th className="p-5 text-right">{t("assessment.result.status")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-400">
                          {selectedRun.results.map((res) => (
                            <tr key={res.id} className="transition-colors group hover:bg-white/5">
                              <td className="p-5 text-slate-600 italic">#{res.id.padStart(3, '0')}</td>
                              <td className="p-5">
                                <div className="flex flex-col">
                                    <span className="text-slate-200 font-bold group-hover:text-white transition-all uppercase tracking-tight">{res.name}</span>
                                    <span className="text-[9px] text-slate-700 uppercase tracking-[0.3em] font-black mt-1">SIG_MATCH: 0x82{res.id}</span>
                                </div>
                              </td>
                              <td className="p-5 text-right">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest transition-all",
                                  res.status === "Success" 
                                    ? "bg-slate-800 border-slate-700 text-slate-500" 
                                    : res.status === "Processing"
                                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                      : "bg-red-500/80 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                )}>
                                  {res.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
                <div className="text-center space-y-2">
                  <Activity className="w-8 h-8 text-slate-700 mx-auto opacity-20" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-[0.3em]">Select a run to view detailed process analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="px-6 py-4 bg-slate-900/30 border-t border-slate-800/50 flex justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 shadow-xl active:scale-95"
          >
            <X size={14} />
            {t("common.close")}
          </button>
        </footer>
      </div>
    </Modal>
  );
};
