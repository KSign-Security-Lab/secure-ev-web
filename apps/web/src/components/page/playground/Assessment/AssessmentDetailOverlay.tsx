"use client";

import React, { useState } from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentItem } from "./AssessmentTable";
import { cn } from "~/lib/utils";
import { ChevronRight, ChevronLeft, Save, Trash2, X, Activity, Target, ShieldCheck } from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState(1);

  if (!item) return null;

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
      <div className="flex flex-col h-full">
        {/* Top Gradient Accent */}
        <div className="relative w-full h-1 bg-linear-to-r from-blue-500 via-cyan-500 to-blue-600 shrink-0" />

        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl flex justify-between items-center shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-white tracking-tight uppercase leading-none">
              {item.name}
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="text-blue-400/80">Assessment Detail</span>
              <span className="w-1 h-1 rounded-full bg-slate-800" />
              <span>ID: {item.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
          <div className="relative aspect-32/9 w-full bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-center overflow-hidden group shadow-2xl backdrop-blur-sm">
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
                       <button className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                        <Save size={12} /> {t("assessment.page.register")}
                       </button>
                       <button className="px-3 py-1 rounded bg-red-950/20 border border-red-900/30 text-xs font-bold text-red-500 hover:bg-red-900/20 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                        <Trash2 size={12} /> {t("assessment.page.delete")}
                       </button>
                    </div>
                  }
                />
                <div className="overflow-hidden border border-slate-800/60 rounded-xl bg-slate-900/20 shadow-xl backdrop-blur-sm">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[11px]">
                      <tr>
                        <th className="p-4 w-12 text-center">#</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Source</th>
                        <th className="p-4">Param 1</th>
                        <th className="p-4">Param 2</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-400">
                      <tr className="hover:bg-slate-800/30 transition-colors group">
                        <td className="p-4 text-center opacity-40">01</td>
                        <td className="p-4 font-bold text-slate-200">Scan Host</td>
                        <td className="p-4">User PC</td>
                        <td className="p-4 text-slate-500">X</td>
                        <td className="p-4 text-blue-400/80 font-bold text-xs">Host.ip</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30 transition-colors group">
                        <td className="p-4 text-center opacity-40">02</td>
                        <td className="p-4 font-bold text-slate-200">Lateral Movement</td>
                        <td className="p-4">User PC</td>
                        <td className="p-4 text-blue-400/80 font-bold text-xs">Host.ip</td>
                        <td className="p-4 text-red-400/80 font-bold text-xs">Target.ip</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4">
                  <SectionHeader title={t("assessment.detail.sourceConfig")} />
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-800/5 hover:bg-slate-800/10 hover:border-slate-700 transition-all shadow-lg group flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Source #1</span>
                        <span className="text-base font-bold text-blue-400/90 font-mono tracking-tight group-hover:text-blue-300">Host.ip</span>
                      </div>
                      <ShieldCheck size={16} className="text-blue-500/50 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <SectionHeader 
                  title={t("assessment.detail.targetConfig")} 
                  actions={
                    <div className="flex gap-2">
                       <button className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                        <Save size={12} /> {t("assessment.page.register")}
                       </button>
                       <button className="px-3 py-1 rounded bg-red-950/20 border border-red-900/30 text-xs font-bold text-red-500 hover:bg-red-900/20 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                        <Trash2 size={12} /> {t("assessment.page.delete")}
                       </button>
                    </div>
                  }
                />
                <div className="overflow-hidden border border-slate-800/60 rounded-xl bg-slate-900/20 shadow-xl backdrop-blur-sm">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[11px]">
                      <tr>
                        <th className="p-4 w-12 text-center">#</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4 text-center">OS</th>
                        <th className="p-4 text-center">Agent Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-400">
                      <tr className="hover:bg-slate-800/30 transition-colors group">
                        <td className="p-4 text-center opacity-40">01</td>
                        <td className="p-4 font-bold text-slate-200">User PC</td>
                        <td className="p-4 text-slate-300">192.168.5.88</td>
                        <td className="p-4 text-center text-slate-500 uppercase">Windows 10</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 font-bold uppercase tracking-widest">
                            #Agent_1 Connected
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4">
                  <SectionHeader title={t("assessment.detail.sourceConfig")} />
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-800/5 hover:bg-slate-800/10 hover:border-slate-700 transition-all shadow-lg group flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Source #1</span>
                        <span className="text-base font-bold text-blue-400/90 font-mono tracking-tight group-hover:text-blue-300">Host.ip</span>
                      </div>
                      <ShieldCheck size={16} className="text-blue-500/50 group-hover:text-blue-400 transition-colors" />
                    </div>
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
          <button
            onClick={() => setCurrentStep(2)}
            disabled={currentStep === 2}
            className={cn(
              "flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all",
              currentStep === 2
                ? "text-slate-700 cursor-not-allowed"
                : "bg-blue-600/90 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            )}
          >
            {t("common.next") || "Next"}
            <ChevronRight size={16} />
          </button>
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
