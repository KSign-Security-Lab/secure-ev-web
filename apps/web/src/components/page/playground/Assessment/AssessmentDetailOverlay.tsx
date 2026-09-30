"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentItem } from "./AssessmentTable";
import { cn } from "~/lib/utils";
import { 
  ShieldAlert,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  X,
  Sliders,
  Crosshair
} from "lucide-react";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { AssessmentTopology } from "./AssessmentTopology";

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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [assessmentName, setAssessmentName] = useState(item?.name || "");

  useEffect(() => {
    setAssessmentName(item?.name || "");
  }, [item]);

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
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
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


  return (
    <Modal
      open={open}
      onClose={onClose}
      hideHeader={true}
      disableDefaultStyles={true}
      className="max-w-5xl bg-white border border-neutral-200 shadow-sm p-0 overflow-hidden"
    >
      <div className="flex flex-col h-[880px] max-h-[95vh]">
        {/* Top Dynamic Progress Bar */}
        <div className="absolute top-0 left-0 bg-blue-600 h-[2px] transition-all duration-700 ease-out z-50 rounded-full" 
          style={{ width: currentStep === 1 ? '50%' : '100%' }}
        />
        <div className="relative w-full h-[2px] bg-neutral-100 shrink-0" />

        {/* Header */}
        <header className="px-6 py-4 border-b border-neutral-200 bg-white  flex justify-between items-center shrink-0">
          <div className="flex flex-col gap-5 flex-1 mr-8">
            <input
              type="text"
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              placeholder={t("assessment.detail.newAssessment")}
              className="bg-transparent text-2xl font-bold text-neutral-950 tracking-tight leading-none border-none outline-hidden focus:ring-0 w-full hover:bg-neutral-100 rounded px-2 -ml-2 transition-colors cursor-text"
            />
            <div className="flex items-center gap-4 text-sm font-bold text-neutral-500 uppercase tracking-widest leading-none">
              <span className="flex items-center gap-2 opacity-70"><ShieldAlert size={16} className="text-amber-600" /> ID: {item?.id}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              <span className="text-xs opacity-50 italic lowercase">{item ? t("assessment.detail.inspectionMode") : t("assessment.detail.creationMode")}</span>
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
          {/* Minimalist Phase Header */}
          <div className="sticky top-0 z-40 bg-white  border-b border-neutral-200 px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center",
                currentStep === 1 ? "border-blue-200 text-blue-700 bg-blue-50" : "border-neutral-200 text-neutral-500 bg-white"
              )}>
                {currentStep === 1 ? <Sliders size={18} /> : <Crosshair size={18} />}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest leading-none">
                  PHASE 0{currentStep}
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest leading-none">
                  {currentStep === 1 ? t("assessment.detail.step1") : t("assessment.detail.step2")}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className={cn("h-1 w-6 rounded-full", currentStep >= 1 ? "bg-blue-500" : "bg-neutral-100")} />
                <div className={cn("h-1 w-6 rounded-full", currentStep >= 2 ? "bg-blue-500" : "bg-neutral-100")} />
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-8">

          {/* Scenario Diagram (Topology) */}
          <AssessmentTopology />

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
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-[10px] font-black text-white hover:bg-blue-700 transition-all flex items-center gap-1.5 uppercase tracking-widest  active:scale-95"
                         >
                          <Plus size={12} /> {t("assessment.page.register")}
                         </button>
                      </div>
                    }
                  />
                  <div className="overflow-hidden border border-neutral-200 rounded-lg bg-white shadow-sm">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-widest font-black text-[10px]">
                        <tr>
                          <th className="px-4 py-3 w-16 text-center opacity-40 italic">#</th>
                          <th className="px-4 py-3">{t("assessment.detail.capabilityName")}</th>
                          <th className="px-4 py-3">{t("assessment.detail.namespace")}</th>
                          <th className="px-4 py-3">{t("assessment.detail.vectorAlpha")}</th>
                          <th className="px-4 py-3">{t("assessment.detail.vectorBeta")}</th>
                          <th className="px-4 py-3 w-16 text-center">{t("assessment.detail.op")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-neutral-500 text-sm">
                        {abilities.map((ability, index) => (
                          <tr key={ability.id} className="transition-colors group">
                            <td className="px-4 py-2 text-center font-bold text-neutral-400 italic">
                                {String(index + 1).padStart(2, '0')}
                            </td>
                            <td className="px-4 py-2">
                              <input 
                                type="text"
                                value={ability.name}
                                onChange={(e) => handleUpdateAbility(ability.id, "name", e.target.value)}
                                className="w-full bg-neutral-50 border-b border-neutral-200 hover:border-blue-300 hover:bg-neutral-100 text-neutral-900 font-bold focus:border-blue-500 focus:bg-white rounded-md px-3 py-1.5 transition-all outline-hidden cursor-text "
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={ability.source}
                                onChange={(e) => handleUpdateAbility(ability.id, "source", e.target.value)}
                                className="w-full bg-transparent border-b border-neutral-200 text-neutral-500 focus:text-neutral-700 focus:border-neutral-400 px-2 py-1 transition-all outline-hidden"
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={ability.param1}
                                onChange={(e) => handleUpdateAbility(ability.id, "param1", e.target.value)}
                                className="w-full bg-transparent border-b border-neutral-200 text-neutral-400 focus:text-neutral-600 focus:border-neutral-400 px-2 py-1 transition-all outline-hidden"
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={ability.param2}
                                onChange={(e) => handleUpdateAbility(ability.id, "param2", e.target.value)}
                                className="w-full bg-transparent border-b border-neutral-200 text-blue-700 font-bold focus:text-blue-800 focus:border-blue-500 px-2 py-1 transition-all outline-hidden"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button 
                                onClick={(e) => handleRemoveAbility(e, ability.id)}
                                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {abilities.length === 0 && (
                      <div className="p-12 text-center text-neutral-400 italic text-[10px] uppercase tracking-[0.3em]">
                        {t("assessment.detail.noCapabilities")}
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
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-[10px] font-black text-neutral-600 hover:text-neutral-700 hover:bg-neutral-200 transition-all flex items-center gap-1.5 uppercase tracking-widest"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    }
                  />
                  <div className="grid grid-cols-4 gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="p-5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm group flex items-center justify-between">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none mb-1">{source.id}</span>
                          <input 
                            type="text"
                            value={source.value}
                            onChange={(e) => handleUpdateSource(source.id, e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 text-blue-700 font-mono font-bold tracking-tight focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-1.5 transition-all outline-hidden w-full cursor-text text-sm "
                          />
                        </div>
                        <div className="flex items-center ml-3">
                          <button 
                            onClick={(e) => handleRemoveSource(e, source.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
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
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-[10px] font-black text-white hover:bg-blue-700 transition-all flex items-center gap-1.5 uppercase tracking-widest "
                         >
                          <Plus size={12} /> {t("assessment.page.register")}
                         </button>
                      </div>
                    }
                  />
                  <div className="overflow-hidden border border-neutral-200 rounded-lg bg-white shadow-sm">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-widest font-black text-[10px]">
                        <tr>
                          <th className="px-4 py-3 w-16 text-center opacity-40 italic">#</th>
                          <th className="px-4 py-3">Asset Descriptor</th>
                          <th className="px-4 py-3">Network address</th>
                          <th className="px-4 py-3 text-center">Runtime OS</th>
                          <th className="px-4 py-3 text-center">Sensor Status</th>
                          <th className="px-4 py-3 w-16 text-center">Op</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-neutral-500 text-sm">
                        {targets.map((target, index) => (
                          <tr key={target.id} className="transition-colors group">
                            <td className="px-4 py-2 text-center font-bold text-neutral-400 italic">
                                {String(index + 1).padStart(2, '0')}
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={target.name}
                                onChange={(e) => handleUpdateTarget(target.id, "name", e.target.value)}
                                className="w-full bg-neutral-50 border-b border-neutral-200 hover:border-blue-300 hover:bg-neutral-100 text-neutral-900 font-bold focus:border-blue-500 focus:bg-white rounded-md px-3 py-1.5 transition-all outline-hidden cursor-text"
                              />
                            </td>
                            <td className="p-5">
                              <input 
                                type="text"
                                value={target.ip}
                                onChange={(e) => handleUpdateTarget(target.id, "ip", e.target.value)}
                                className="w-full bg-transparent border-b border-neutral-200 text-neutral-500 focus:text-neutral-700 focus:border-neutral-400 px-2 py-1 transition-all outline-hidden font-bold"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="px-2 py-0.5 rounded border border-neutral-200 text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-50">
                                {target.os}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                                <div className={cn(
                                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
                                  target.status.includes("Connected") 
                                    ? "bg-green-50 border-green-300 text-green-700"
                                    : "bg-neutral-50 border-neutral-200 text-neutral-500"
                                )}>
                                  <div className={cn("w-1.5 h-1.5 rounded-full", target.status.includes("Connected") ? "bg-green-500 animate-pulse" : "bg-neutral-400")} />
                                  {target.status}
                                </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button 
                                onClick={(e) => handleRemoveTarget(e, target.id)}
                                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {targets.length === 0 && (
                       <div className="p-12 text-center text-neutral-400 italic text-[10px] uppercase tracking-[0.3em]">
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
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-[10px] font-black text-neutral-600 hover:text-neutral-700 hover:bg-neutral-200 transition-all flex items-center gap-1.5 uppercase tracking-widest"
                       >
                        <Plus size={12} /> {t("assessment.page.register")}
                       </button>
                    }
                  />
                  <div className="grid grid-cols-4 gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="p-5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm group flex items-center justify-between">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none mb-1">{source.id}</span>
                          <input 
                            type="text"
                            value={source.value}
                            onChange={(e) => handleUpdateSource(source.id, e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 text-blue-700 font-mono font-bold tracking-tight focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-1.5 transition-all outline-hidden w-full cursor-text text-sm "
                          />
                        </div>
                        <div className="flex items-center ml-3">
                          <button 
                            onClick={(e) => handleRemoveSource(e, source.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
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
          </div> {/* Close grid grid-cols-1 ... */}
        </div> {/* Close p-6 space-y-8 */}
      </div> {/* Close overflow-y-auto scrollable area */}

        {/* Footer Navigation */}
        <footer className="px-6 py-4 bg-white border-t border-neutral-200 flex justify-between items-center shrink-0">
          <button
            onClick={() => setCurrentStep(1)}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
              currentStep === 1
                ? "text-neutral-400 cursor-not-allowed"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            )}
          >
            <ChevronLeft size={16} />
            {t("common.previous") || "Back"}
          </button>
          
          {currentStep === 1 ? (
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700"
            >
              {t("common.next") || "Next"}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all bg-rose-600 text-white hover:bg-rose-700"
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
    <div className="flex justify-between items-center bg-white  border-b border-neutral-200 pb-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 bg-blue-500 rounded-full" />
        <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em] leading-none">
          {title}
        </h3>
      </div>
      {actions}
    </div>
  );
}
