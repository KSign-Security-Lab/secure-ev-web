"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentItem } from "./AssessmentTable";
import { cn } from "~/lib/utils";
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Trash2, 
  X, 
  Activity, 
  Target, 
  Plus
} from "lucide-react";
import { useToast } from "~/components/ToastProvider/ToastProvider";

interface AbilityConfig {
  id: string;
  name: string;
  source: string;
  param1: string;
  param2: string;
}

interface TargetConfig {
  id: string;
  name: string;
  ip: string;
  os: string;
  status: string;
}

interface SourceConfig {
  id: string;
  value: string;
}

interface AssessmentDetailOverlayProps {
  item: AssessmentItem | null;
  open: boolean;
  onClose: () => void;
}

export const AssessmentDetailOverlay: React.FC<AssessmentDetailOverlayProps> = ({
  item,
  open,
  onClose,
}) => {
  const { t } = useI18n();
  const showToast = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  // Local State for Configurations
  const [abilities, setAbilities] = useState<AbilityConfig[]>([
    { id: "01", name: "Scan Host", source: "User PC", param1: "X", param2: "Host.ip" },
    { id: "02", name: "Lateral Movement", source: "User PC", param1: "Host.ip", param2: "Target.ip" },
  ]);

  const [targets, setTargets] = useState<TargetConfig[]>([
    { id: "01", name: "User PC", ip: "192.168.5.88", os: "Windows 10", status: "#Agent_1 Connected" },
  ]);

  const [sources, setSources] = useState<SourceConfig[]>([
    { id: "Source #1", value: "Host.ip" },
  ]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setCurrentStep(1), 0);
    }
  }, [open, item]); // Correct dependency

  // Actions
  const handleRegisterAbility = () => {
    const nextMaxId = abilities.length > 0 
      ? Math.max(...abilities.map(a => parseInt(a.id))) + 1 
      : 1;
    const newId = nextMaxId.toString().padStart(2, '0');
    
    setAbilities([...abilities, { 
      id: newId, 
      name: "New Ability " + newId, 
      source: "Manual", 
      param1: "None", 
      param2: "None" 
    }]);
    showToast(`New ability registered: ${newId}`, { type: "info" });
  };

  const handleRemoveAbility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAbilities(prev => prev.filter(a => a.id !== id));
    showToast(`Ability ${id} removed`, { type: "warning" });
  };

  const handleUpdateAbility = (id: string, field: keyof AbilityConfig, value: string) => {
    setAbilities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleRegisterTarget = () => {
    const nextMaxId = targets.length > 0 
      ? Math.max(...targets.map(t => parseInt(t.id))) + 1 
      : 1;
    const newId = nextMaxId.toString().padStart(2, '0');

    setTargets([...targets, { 
      id: newId, 
      name: "Target PC " + newId, 
      ip: "10.0.0." + (100 + nextMaxId), 
      os: "Linux", 
      status: "Idle" 
    }]);
    showToast(`New target registered: ${newId}`, { type: "info" });
  };

  const handleRemoveTarget = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTargets(prev => prev.filter(t => t.id !== id));
    showToast(`Target ${id} removed`, { type: "warning" });
  };

  const handleUpdateTarget = (id: string, field: keyof TargetConfig, value: string) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleRegisterSource = () => {
    const nextMaxId = sources.length > 0
      ? Math.max(...sources.map(s => {
          const match = s.id.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        })) + 1
      : 1;
    const newId = `Source #${nextMaxId}`;
    setSources([...sources, { id: newId, value: "Dynamic.ip" }]);
  };

  const handleRemoveSource = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSource = (id: string, value: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  const handleSave = () => {
    showToast("Assessment configuration saved successfully.", { type: "success" });
    onClose();
  };

  const steps = [
    { id: 1, label: t("assessment.detail.step1"), icon: Activity },
    { id: 2, label: t("assessment.detail.step2"), icon: Target },
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
        {/* Top Gradient Accent */}
        <div className="relative w-full h-1 bg-linear-to-r from-blue-500 via-cyan-500 to-blue-600 shrink-0" />

        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl flex justify-between items-center shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-white tracking-tight uppercase leading-none">
              {item ? item.name : t("assessment.detail.newAssessment")}
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="text-blue-400/80">{t("assessment.detail.badge")}</span>
              <span className="w-1 h-1 rounded-full bg-slate-800" />
              <span>{item ? `ID: ${item.id}` : "Registration Mode"}</span>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Left-aligned Breadcrumb Stepper */}
          <nav className="flex items-center gap-6 py-6 px-1 border-b border-slate-900/40 shrink-0">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className="flex items-center gap-4 group transition-all"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[9px] font-mono tracking-widest transition-all",
                          isActive ? "text-blue-500 font-bold" : "text-slate-600"
                        )}>
                          {step.id.toString().padStart(2, '0')}
                        </span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                          isActive ? "text-slate-100" : "text-slate-500 group-hover:text-slate-400"
                        )}>
                          {step.label}
                        </span>
                      </div>
                      <div className={cn(
                        "h-px transition-all duration-500",
                        isActive ? "w-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "w-0 bg-transparent"
                      )} />
                    </div>
                  </button>
                  {idx < steps.length - 1 && (
                    <span className="text-slate-800 font-thin text-xs mx-1 opacity-40">/</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Scenario Diagram (Blueprint Style) */}
          <div className="relative aspect-4/1 w-full bg-slate-950 border border-slate-800/60 rounded-xl flex items-center justify-center overflow-hidden group shadow-2xl backdrop-blur-sm shrink-0">
            {/* Blueprint Grid SVG Pattern */}
            <div className="absolute inset-0 opacity-20" 
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%233b82f6' stroke-width='0.5'%3E%3Cpath d='M0 40L40 0M0 0l40 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }} 
            />
            <div className="absolute inset-0 opacity-[0.05]" 
              style={{ 
                backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} 
            />
            
            <div className="z-10 flex flex-col items-center gap-2">
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] opacity-50 bg-blue-500/5 px-4 py-1 rounded border border-blue-500/10 mb-2">
                    System Architecture Visualization
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] border border-slate-800/80 px-8 py-3 bg-slate-950/90 rounded-lg backdrop-blur-md shadow-2xl group-hover:border-blue-500/30 transition-all">
                    {t("assessment.detail.scenarioDiagram")}
                </div>
            </div>

            {/* Corner markings */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500/30" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500/30" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500/30" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500/30" />
            
            {/* Decorative technical labels */}
            <div className="absolute bottom-4 left-12 text-[8px] font-mono text-slate-600 uppercase tracking-widest">Scale: 1:1.000_VULN</div>
            <div className="absolute top-4 right-12 text-[8px] font-mono text-slate-600 uppercase tracking-widest">Layer_01: Network_Topology</div>
          </div>

          {/* Detailed Config sections */}
          <div className="grid grid-cols-1 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep === 1 ? (
              <>
                <div className="space-y-4">
                  <SectionHeader 
                    title={t("assessment.detail.abilitiesConfig")} 
                    actions={
                      <div className="flex gap-2">
                         <button 
                          onClick={handleRegisterAbility}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-[10px] font-black text-white hover:bg-blue-500 transition-all flex items-center gap-1.5 uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95"
                         >
                          <Plus size={12} /> {t("assessment.page.register")}
                         </button>
                      </div>
                    }
                  />
                  <div className="overflow-hidden border border-slate-800/60 rounded-2xl bg-slate-900/30 shadow-2xl backdrop-blur-sm">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[10px]">
                        <tr>
                          <th className="p-5 w-16 text-center opacity-40 italic">#</th>
                          <th className="p-5">Capability Name</th>
                          <th className="p-5">Namespace</th>
                          <th className="p-5">Vector Alpha</th>
                          <th className="p-5">Vector Beta</th>
                          <th className="p-5 w-16 text-center">Op</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-400 text-sm">
                        {abilities.map((ability, index) => (
                          <tr key={ability.id} className="transition-colors group">
                            <td className="p-5 text-center font-bold text-slate-600 italic">
                                {String(index + 1).padStart(2, '0')}
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={ability.name}
                                onChange={(e) => handleUpdateAbility(ability.id, "name", e.target.value)}
                                className="w-full bg-slate-800/20 border-b border-white/5 hover:border-blue-500/50 hover:bg-slate-800/40 text-slate-100 font-bold focus:border-blue-500 focus:bg-slate-800/60 rounded-md px-3 py-1.5 transition-all outline-hidden cursor-text shadow-inner"
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={ability.source}
                                onChange={(e) => handleUpdateAbility(ability.id, "source", e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-slate-500 focus:text-slate-300 focus:border-slate-600 px-2 py-1 transition-all outline-hidden"
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={ability.param1}
                                onChange={(e) => handleUpdateAbility(ability.id, "param1", e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-slate-600 focus:text-slate-400 focus:border-slate-600 px-2 py-1 transition-all outline-hidden"
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={ability.param2}
                                onChange={(e) => handleUpdateAbility(ability.id, "param2", e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-blue-500/70 font-bold focus:text-blue-400 focus:border-blue-500/50 px-2 py-1 transition-all outline-hidden"
                              />
                            </td>
                            <td className="p-5 text-center">
                              <button 
                                onClick={(e) => handleRemoveAbility(e, ability.id)}
                                className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {abilities.length === 0 && (
                      <div className="p-12 text-center text-slate-700 italic text-[10px] uppercase tracking-[0.3em]">
                        NO CAPABILITIES DEFINED IN ACTIVE BUFFER
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionHeader 
                    title={t("assessment.detail.sourceConfig")} 
                    actions={
                      <button 
                        onClick={handleRegisterSource}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 uppercase tracking-widest"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    }
                  />
                  <div className="grid grid-cols-4 gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-600 transition-all shadow-xl group flex items-center justify-between">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] leading-none mb-1">{source.id}</span>
                          <input 
                            type="text"
                            value={source.value}
                            onChange={(e) => handleUpdateSource(source.id, e.target.value)}
                            className="bg-slate-950/50 border border-slate-800/50 text-blue-400 font-mono font-bold tracking-tight focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-1.5 transition-all outline-hidden w-full cursor-text text-sm shadow-inner"
                          />
                        </div>
                        <div className="flex items-center ml-3">
                          <button 
                            onClick={(e) => handleRemoveSource(e, source.id)}
                            className="p-1.5 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <SectionHeader 
                    title={t("assessment.detail.targetConfig")} 
                    actions={
                      <div className="flex gap-2">
                         <button 
                          onClick={handleRegisterTarget}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-[10px] font-black text-white hover:bg-blue-500 transition-all flex items-center gap-1.5 uppercase tracking-widest shadow-lg shadow-blue-600/20"
                         >
                          <Plus size={12} /> {t("assessment.page.register")}
                         </button>
                      </div>
                    }
                  />
                  <div className="overflow-hidden border border-slate-800/60 rounded-2xl bg-slate-900/30 shadow-2xl backdrop-blur-sm">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[10px]">
                        <tr>
                          <th className="p-5 w-16 text-center opacity-40 italic">#</th>
                          <th className="p-5">Asset Descriptor</th>
                          <th className="p-5">Network address</th>
                          <th className="p-5 text-center">Runtime OS</th>
                          <th className="p-5 text-center">Sensor Status</th>
                          <th className="p-5 w-16 text-center">Op</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-400 text-sm">
                        {targets.map((target, index) => (
                          <tr key={target.id} className="transition-colors group">
                            <td className="p-5 text-center font-bold text-slate-600 italic">
                                {String(index + 1).padStart(2, '0')}
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={target.name}
                                onChange={(e) => handleUpdateTarget(target.id, "name", e.target.value)}
                                className="w-full bg-slate-800/20 border-b border-white/5 hover:border-blue-500/50 hover:bg-slate-800/40 text-slate-100 font-bold focus:border-blue-500 focus:bg-slate-800/60 rounded-md px-3 py-1.5 transition-all outline-hidden cursor-text"
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={target.ip}
                                onChange={(e) => handleUpdateTarget(target.id, "ip", e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-slate-400 focus:text-slate-200 focus:border-slate-600 px-2 py-1 transition-all outline-hidden font-bold"
                              />
                            </td>
                            <td className="p-5 text-center">
                              <span className="px-2 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50">
                                {target.os}
                              </span>
                            </td>
                            <td className="p-5 text-center">
                                <div className={cn(
                                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
                                  target.status.includes("Connected") 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                    : "bg-slate-800/50 border-slate-700 text-slate-500"
                                )}>
                                  <div className={cn("w-1.5 h-1.5 rounded-full", target.status.includes("Connected") ? "bg-emerald-500 animate-pulse" : "bg-slate-600")} />
                                  {target.status}
                                </div>
                            </td>
                            <td className="p-5 text-center">
                              <button 
                                onClick={(e) => handleRemoveTarget(e, target.id)}
                                className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {targets.length === 0 && (
                       <div className="p-12 text-center text-slate-700 italic text-[10px] uppercase tracking-[0.3em]">
                         NO TARGET ASSETS REGISTERED IN BUFFER
                       </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionHeader 
                    title={t("assessment.detail.sourceConfig")} 
                    actions={
                      <button 
                        onClick={handleRegisterSource}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 uppercase tracking-widest"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    }
                  />
                  <div className="grid grid-cols-4 gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-600 transition-all shadow-xl group flex items-center justify-between">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] leading-none mb-1">{source.id}</span>
                          <input 
                            type="text"
                            value={source.value}
                            onChange={(e) => handleUpdateSource(source.id, e.target.value)}
                            className="bg-slate-950/50 border border-slate-800/50 text-blue-400 font-mono font-bold tracking-tight focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-1.5 transition-all outline-hidden w-full cursor-text text-sm shadow-inner"
                          />
                        </div>
                        <div className="flex items-center ml-3">
                          <button 
                            onClick={(e) => handleRemoveSource(e, source.id)}
                            className="p-1.5 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="px-6 py-4 bg-slate-900/30 border-t border-slate-800/50 flex justify-between items-center shrink-0">
          <button
            onClick={() => setCurrentStep(1)}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all",
              currentStep === 1
                ? "text-slate-700 cursor-not-allowed"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/50"
            )}
          >
            <ChevronLeft size={16} />
            {t("common.previous") || "Back"}
          </button>
          
          {currentStep === 1 ? (
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all bg-blue-600/90 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              {t("common.next") || "Next"}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all bg-red-600/90 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-500/30"
            >
              <Save size={16} />
              {t("abilities.page.save") || "Save"}
            </button>
          )}
        </footer>
      </div>
    </Modal>
  );
};

/* --- Secondary Component: SectionHeader --- */
function SectionHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center bg-slate-950/40 backdrop-blur-sm border-b border-slate-800/60 pb-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] leading-none">
          {title}
        </h3>
      </div>
      {actions}
    </div>
  );
}
