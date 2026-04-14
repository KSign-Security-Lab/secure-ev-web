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

  // Reset steps when opening for a new item
  useEffect(() => {
    if (open) {
      setTimeout(() => setCurrentStep(1), 0);
    }
  }, [open, item]);

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
          {/* Stepper / Tabs */}
          <div className="flex justify-center">
            <div className="bg-slate-900/50 border border-slate-800/50 p-1.5 rounded-xl flex gap-1">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all",
                      isActive
                        ? "bg-slate-800 text-white shadow-lg border border-slate-700/50"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    )}
                  >
                    <Icon size={14} className={isActive ? "text-blue-400" : "text-slate-600"} />
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scenario Diagram (Reduced Height) */}
          <div className="relative aspect-32/9 w-full bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-center overflow-hidden group shadow-2xl backdrop-blur-sm shrink-0">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="z-10 text-sm font-bold text-slate-500 uppercase tracking-[0.4em] border border-slate-800/80 px-6 py-3 bg-slate-950/80 rounded-lg backdrop-blur-md">
              {t("assessment.detail.scenarioDiagram")}
            </div>
            {/* Corner markings */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-blue-500/20" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-blue-500/20" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-blue-500/20" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-blue-500/20" />
          </div>

          {/* Detailed Config sections */}
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep === 1 ? (
              <>
                <SectionHeader 
                  title={t("assessment.detail.abilitiesConfig")} 
                  actions={
                    <div className="flex gap-2">
                       <button 
                        onClick={handleRegisterAbility}
                        className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    </div>
                  }
                />
                <div className="overflow-hidden border border-slate-800/60 rounded-xl bg-slate-900/20 shadow-xl backdrop-blur-sm">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-xs">
                      <tr>
                        <th className="p-4 w-12 text-center">#</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Source</th>
                        <th className="p-4">Param 1</th>
                        <th className="p-4">Param 2</th>
                        <th className="p-4 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-400 text-sm">
                      {abilities.map((ability, index) => (
                        <tr key={ability.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="p-4 text-center opacity-40">{index + 1}</td>
                          <td className="p-4">
                            <input 
                              type="text"
                              value={ability.name}
                              onChange={(e) => handleUpdateAbility(ability.id, "name", e.target.value)}
                              className="w-full bg-slate-800/30 border-b border-white/5 hover:border-blue-500/30 hover:bg-slate-800/50 text-slate-200 font-bold focus:ring-1 focus:ring-blue-500/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden cursor-text"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="text"
                              value={ability.source}
                              onChange={(e) => handleUpdateAbility(ability.id, "source", e.target.value)}
                              className="w-full bg-slate-800/20 border-b border-white/5 hover:border-slate-700/50 hover:bg-slate-800/40 focus:ring-1 focus:ring-slate-700/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden cursor-text"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="text"
                              value={ability.param1}
                              onChange={(e) => handleUpdateAbility(ability.id, "param1", e.target.value)}
                              className="w-full bg-slate-800/20 border-b border-white/5 hover:border-slate-700/50 hover:bg-slate-800/40 text-slate-500 focus:ring-1 focus:ring-slate-700/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden cursor-text"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="text"
                              value={ability.param2}
                              onChange={(e) => handleUpdateAbility(ability.id, "param2", e.target.value)}
                              className="w-full bg-slate-800/20 border-b border-white/5 hover:border-blue-500/30 hover:bg-slate-800/40 text-blue-400/80 font-bold focus:ring-1 focus:ring-blue-500/30 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden cursor-text"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={(e) => handleRemoveAbility(e, ability.id)}
                              className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {abilities.length === 0 && (
                    <div className="p-8 text-center text-slate-600 italic text-xs uppercase tracking-widest">
                      No abilities registered.
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <SectionHeader 
                    title={t("assessment.detail.sourceConfig")} 
                    actions={
                      <button 
                        onClick={handleRegisterSource}
                        className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    }
                  />
                  <div className="grid grid-cols-4 gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="p-4 rounded-xl border border-slate-800/80 bg-slate-800/5 hover:bg-slate-800/10 hover:border-slate-700 transition-all shadow-lg group flex items-center justify-between">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{source.id}</span>
                          <input 
                            type="text"
                            value={source.value}
                            onChange={(e) => handleUpdateSource(source.id, e.target.value)}
                            className="bg-slate-800/30 border-b border-blue-500/10 text-blue-400/90 font-mono font-bold tracking-tight focus:ring-1 focus:ring-blue-500/30 hover:bg-slate-800/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden w-full cursor-text text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => handleRemoveSource(e, source.id)}
                            className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
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
                <SectionHeader 
                  title={t("assessment.detail.targetConfig")} 
                  actions={
                    <div className="flex gap-2">
                       <button 
                        onClick={handleRegisterTarget}
                        className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    </div>
                  }
                />
                <div className="overflow-hidden border border-slate-800/60 rounded-xl bg-slate-900/20 shadow-xl backdrop-blur-sm">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-xs">
                      <tr>
                        <th className="p-4 w-12 text-center">#</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4 text-center">OS</th>
                        <th className="p-4 text-center">Agent Status</th>
                        <th className="p-4 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-400 text-sm">
                      {targets.map((target, index) => (
                        <tr key={target.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="p-4 text-center opacity-40">{index + 1}</td>
                          <td className="p-4">
                            <input 
                              type="text"
                              value={target.name}
                              onChange={(e) => handleUpdateTarget(target.id, "name", e.target.value)}
                              className="w-full bg-slate-800/30 border-b border-white/5 hover:border-blue-500/30 hover:bg-slate-800/50 text-slate-200 font-bold focus:ring-1 focus:ring-blue-500/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden cursor-text"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="text"
                              value={target.ip}
                              onChange={(e) => handleUpdateTarget(target.id, "ip", e.target.value)}
                              className="w-full bg-slate-800/20 border-b border-white/5 hover:border-slate-700/50 hover:bg-slate-800/40 text-slate-300 focus:ring-1 focus:ring-slate-700/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden cursor-text"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="text"
                              value={target.os}
                              onChange={(e) => handleUpdateTarget(target.id, "os", e.target.value)}
                              className="w-full bg-slate-800/20 border-b border-white/5 hover:border-slate-700/50 hover:bg-slate-800/40 text-slate-500 uppercase text-center focus:ring-1 focus:ring-slate-700/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden cursor-text"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <div className={cn(
                                  "px-2 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-widest bg-slate-800/20 w-36 text-center transition-all",
                                  target.status.includes("Connected") 
                                    ? "border-emerald-500/20 text-emerald-500"
                                    : "border-slate-500/20 text-slate-500"
                                )}>
                                  {target.status}
                                </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={(e) => handleRemoveTarget(e, target.id)}
                              className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {targets.length === 0 && (
                     <div className="p-8 text-center text-slate-600 italic text-xs uppercase tracking-widest">
                       No targets registered.
                     </div>
                  )}
                </div>

                <div className="space-y-4">
                  <SectionHeader 
                    title={t("assessment.detail.sourceConfig")} 
                    actions={
                      <button 
                        onClick={handleRegisterSource}
                        className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    }
                  />
                  <div className="grid grid-cols-4 gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="p-4 rounded-xl border border-slate-800/80 bg-slate-800/5 hover:bg-slate-800/10 hover:border-slate-700 transition-all shadow-lg group flex items-center justify-between">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{source.id}</span>
                          <input 
                            type="text"
                            value={source.value}
                            onChange={(e) => handleUpdateSource(source.id, e.target.value)}
                            className="bg-slate-800/30 border-b border-blue-500/10 text-blue-400/90 font-mono font-bold tracking-tight focus:ring-1 focus:ring-blue-500/30 hover:bg-slate-800/50 rounded-sm px-1.5 py-0.5 -mx-1.5 transition-all outline-hidden w-full cursor-text text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => handleRemoveSource(e, source.id)}
                            className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
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
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all bg-blue-600/90 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              {t("common.next") || "Next"}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all bg-emerald-600/90 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/30"
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
