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
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const selectedRun = runs.find(r => r.id === selectedRunId);

  // Initialize data
  useEffect(() => {
    if (open) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
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
      className="max-w-5xl bg-white border border-neutral-200 shadow-sm p-0 overflow-hidden"
    >
      <div className="flex flex-col h-[880px] max-h-[95vh]">
        <div className="relative w-full h-[2px] bg-neutral-100 shrink-0" />

        {/* Header */}
        <header className="px-6 py-4 border-b border-neutral-200 bg-white  flex justify-between items-center shrink-0">
          <div className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold text-neutral-950 tracking-tight leading-none">
              {item ? item.name : t("assessment.detail.newAssessment")}
            </h1>
            <div className="flex items-center gap-4 text-sm font-bold text-neutral-500 uppercase tracking-widest leading-none">
              <span className="flex items-center gap-2 opacity-70"><ShieldAlert size={16} className="text-amber-600" /> ID: {item?.id}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              <span className="text-xs opacity-50 italic lowercase">v1.2.4-stable</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content Area - Scrollable */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
          <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Simulation History Section */}
            <div className="space-y-4">
              <header className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                    <span className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">{t("assessment.result.simulationHistory")}</span>
                  </div>
                  <button 
                    onClick={handleRunSimulation}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-neutral-100 border border-neutral-200 text-[10px] font-black text-neutral-600 hover:text-neutral-700 hover:bg-neutral-200 transition-all uppercase tracking-widest shadow-sm active:scale-95"
                  >
                    <Play size={12} className="text-green-600" />
                    {t("assessment.detail.runSimulation")}
                  </button>
              </header>
              <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-widest font-black text-[10px]">
                    <tr>
                      <th className="px-4 py-2 w-12 text-center opacity-40 italic">#</th>
                      <th className="px-4 py-2">{t("assessment.result.attack")}</th>
                      <th className="px-4 py-2 text-center">{t("assessment.result.status")}</th>
                      <th className="px-4 py-2 text-center font-sans">E_TIMESTAMP</th>
                      <th className="px-4 py-2 w-16 text-center">OP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-500">
                    {runs.map((sim) => (
                      <tr 
                        key={sim.id} 
                        onClick={() => setSelectedRunId(sim.id)}
                        className={cn(
                          "transition-all group cursor-pointer border-l-2",
                          selectedRunId === sim.id ? "bg-blue-50" : "border-l-transparent hover:bg-neutral-50"
                        )}
                        style={selectedRunId === sim.id ? { borderLeftColor: '#3b82f6' } : {}}
                      >
                        <td className="px-4 py-2 text-center font-bold text-neutral-400 italic">#{sim.id.padStart(2, '0')}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-bold transition-colors uppercase tracking-tight",
                              selectedRunId === sim.id ? "text-blue-700" : "text-neutral-900 group-hover:text-neutral-900"
                            )}>{sim.attack}</span>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest leading-none mt-1">VECTOR_ID: {sim.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                            sim.status === "Success" 
                              ? "bg-green-50 border-green-300 text-green-700" 
                              : sim.status === "Failed"
                                ? "bg-rose-50 border-rose-300 text-rose-700"
                                : "bg-blue-50 border-blue-300 text-blue-700 animate-pulse"
                          )}>
                            <div className={cn("w-1 h-1 rounded-full", sim.status === "Success" ? "bg-green-500" : sim.status === "Failed" ? "bg-rose-500" : "bg-blue-500")} />
                            {sim.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center font-mono text-neutral-400 group-hover:text-neutral-500 transition-colors uppercase tracking-widest">
                          {sim.time}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            onClick={(e) => handleDeleteRun(e, sim.id)}
                            className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {runs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-neutral-400 italic uppercase tracking-[0.2em] text-[10px]">
                          {t("assessment.result.noHistory")}
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
                      <div className="w-1.5 h-6 bg-neutral-300 rounded-full" />
                      <span className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">{t("assessment.result.processView")}</span>
                  </header>
                  <div className="p-8 border border-neutral-200 rounded-lg bg-white shadow-sm relative min-h-[300px]">
                    <div className="absolute left-[41px] top-12 bottom-12 w-[2px] bg-neutral-200" />
                    
                    <div className="space-y-10 relative z-10">
                      {selectedRun.processSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-8 group">
                          <div className="relative shrink-0 flex items-center justify-center">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 z-10 transition-all duration-500",
                              step.status === "Completed" ? "bg-rose-500 border-rose-400" : 
                              step.status === "Processing" ? "bg-amber-500 animate-pulse border-amber-400" : 
                              step.status === "Failed" ? "bg-rose-700 border-rose-500" : "bg-neutral-100 border-neutral-300"
                            )} />
                            {step.status === "Processing" && (
                              <div className="absolute inset-0 w-4 h-4 rounded-full bg-amber-500 animate-ping opacity-20" />
                            )}
                          </div>
                          <div className="flex-1 pb-6 border-b border-neutral-200">
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className={cn(
                                    "text-xs font-black uppercase tracking-[0.15em] transition-colors",
                                    step.status === "Completed" ? "text-neutral-900" :
                                    step.status === "Processing" ? "text-amber-600" : 
                                    step.status === "Failed" ? "text-rose-600" : "text-neutral-500"
                                  )}>
                                    {step.title}
                                  </h4>
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                                      {step.status === "Completed" ? "ACT_LOG_" + (idx+1) : "RT_STATUS"}
                                  </span>
                              </div>
                              <p className="text-sm text-neutral-500 leading-relaxed font-medium transition-colors group-hover:text-neutral-700">
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
                        <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                        <span className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">{t("assessment.result.capabilityAnalysis")}</span>
                    </header>
                    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-widest font-black text-[10px]">
                          <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">{t("assessment.result.capabilityName")}</th>
                            <th className="px-4 py-2 text-right">{t("assessment.result.status")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-neutral-500">
                          {selectedRun.results.map((res) => (
                            <tr key={res.id} className="transition-colors group hover:bg-neutral-50">
                              <td className="px-4 py-2 text-neutral-400 italic">#{res.id.padStart(3, '0')}</td>
                              <td className="px-4 py-2">
                                <div className="flex flex-col">
                                    <span className="text-neutral-900 font-bold group-hover:text-neutral-900 transition-all uppercase tracking-tight">{res.name}</span>
                                    <span className="text-[9px] text-neutral-400 uppercase tracking-[0.3em] font-black mt-1">SIG_MATCH: 0x82{res.id}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest transition-all",
                                  res.status === "Success" 
                                    ? "bg-neutral-100 border-neutral-200 text-neutral-600" 
                                    : res.status === "Processing"
                                      ? "bg-blue-50 border-blue-300 text-blue-700"
                                      : "bg-rose-600 border-rose-600 text-white"
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
              <div className="h-64 flex items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
                <div className="text-center space-y-2">
                  <Activity className="w-8 h-8 text-neutral-400 mx-auto opacity-20" />
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.3em]">{t("assessment.result.selectRun")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="px-6 py-4 bg-white border-t border-neutral-200 flex justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200 shadow-sm active:scale-95"
          >
            <X size={14} />
            {t("common.close")}
          </button>
        </footer>
      </div>
    </Modal>
  );
};
