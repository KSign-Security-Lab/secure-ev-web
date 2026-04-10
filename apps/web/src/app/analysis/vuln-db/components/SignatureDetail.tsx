"use client";

import React from "react";
import { 
  ArrowRight, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Code2, 
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  X,
  FileCode,
  ListTree,
  Terminal,
  Zap,
  Lock,
  Unlock,
  ShieldX
} from "lucide-react";
import { SignatureDetail as SignatureDetailType } from "../mockData";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Tag } from "~/components/common/Tag/Tag";
import { useI18n } from "~/i18n/I18nProvider";

interface SignatureDetailProps {
  data: SignatureDetailType;
  onClose?: () => void;
}

export function SignatureDetail({ data, onClose }: SignatureDetailProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col bg-slate-950 text-slate-300 w-full h-full overflow-hidden animate-in fade-in duration-500">
      
      {/* 1. Integrated Header */}
      <header className="px-8 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex justify-between items-center shrink-0 shadow-lg">
        <div className="flex flex-col">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none uppercase italic">{data.patternId}</h1>
                <span className="px-3 py-1 rounded-sm bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] leading-none">
                    {t("vulndb.detail.criticalAnalysis")}
                </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-mono text-slate-500 uppercase tracking-widest font-bold mt-1.5">
                <span>SID: {data.sid}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <span>CWE: {data.cwe}</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <button className="px-5 py-2 rounded bg-slate-900 border border-slate-800 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-sm">{t("vulndb.detail.edit")}</button>
            <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          
          {/* 2. Top-Level Metrics Row */}
          <div className="grid grid-cols-4 gap-4">
              <DashMetric label={t("vulndb.detail.metrics.cweClass")} value={data.cwe} icon={ShieldCheck} color="blue" />
              <DashMetric label={t("vulndb.detail.metrics.region")} value={data.region} icon={Activity} color="slate" />
              <DashMetric label={t("vulndb.detail.metrics.vector")} value={data.sinkMode} icon={Cpu} color="purple" />
              <DashMetric label={t("vulndb.detail.metrics.risk")} value={data.risk} icon={ShieldAlert} color="red" />
          </div>

          {/* 3. Primary Analysis Dashboard: STRICTLY HORIZONTAL PACKING */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              
              {/* Technical Verdict Banner (Forced full width at top only) */}
              <div className="p-6 bg-red-500/5 border-b border-slate-800">
                  <div className="flex items-start gap-5">
                      <div className="w-11 h-11 rounded-lg bg-red-600 border border-red-500 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                          <ShieldX size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                              <span className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">{t("vulndb.detail.violation.detected")}</span>
                              <div className="flex-1 h-px bg-red-500/10" />
                          </div>
                          <p className="text-xl font-bold text-red-100 leading-tight mb-2">
                              {t("vulndb.detail.violation.description", { sinkMode: data.sinkMode, region: data.region })}
                          </p>
                      </div>
                  </div>
              </div>

              {/* FORCED 2-COLUMN GRID (Analysis | Evidence) - NO VERTICAL STACKING CONTAINERS */}
              <div className="grid grid-cols-[1fr_450px] divide-x divide-slate-800">
                  
                  {/* LEFT COLUMN: Technical Flow (Sink -> Memory) */}
                  <div className="divide-y divide-slate-800/50">
                      {/* Sink Statement Segment */}
                      <div className="p-6">
                          <header className="flex items-center gap-3 mb-4">
                              <Code2 size={16} className="text-blue-500 opacity-50" />
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("vulndb.detail.execution.sink")}</span>
                          </header>
                          <div className="bg-slate-950/50 p-6 rounded-lg border border-slate-800/30">
                              <code className="text-xl font-mono font-bold text-blue-400 block tracking-tight">
                                  {data.sinkStatement}
                              </code>
                          </div>
                      </div>

                      {/* Memory Row: STRICTLY HORIZONTAL (Bar | Pointers) */}
                      <div className="p-6">
                           <header className="flex items-center gap-3 mb-6">
                              <Activity size={16} className="text-blue-500 opacity-50" />
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">{t("vulndb.detail.analysis.integrity")}</span>
                          </header>
                          
                          {/* THE ZERO-VOID PACKING ROW */}
                          <div className="flex items-start gap-12">
                              {/* Left: Constrained Memory Bar (300px) */}
                              <div className="w-[300px] shrink-0">
                                <IntegrityGaugeRestored 
                                    capacity={data.bufferVsRequest.capacity} 
                                    request={data.bufferVsRequest.request} 
                                />
                              </div>
                              
                              {/* Right: Filling the void with Pointers (Horizontal Packing) */}
                              <div className="flex-1 font-mono pt-1">
                                  <div className="flex items-center gap-2 mb-3">
                                      <Terminal size={12} className="text-slate-600" />
                                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-sans">{t("vulndb.detail.objects.specification")}</span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                      <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/40 space-y-1.5">
                                          <span className="text-blue-500 font-bold uppercase text-[9px] tracking-widest">{t("vulndb.detail.objects.dstPtr")}</span>
                                          <p className="text-xs text-slate-400 leading-relaxed font-bold italic truncate block">{data.bufferVsRequest.destSnippet}</p>
                                      </div>
                                      <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/40 space-y-1.5">
                                          <span className="text-red-500 font-bold uppercase text-[9px] tracking-widest">{t("vulndb.detail.objects.srcBuf")}</span>
                                          <p className="text-xs text-slate-200 leading-relaxed font-bold italic truncate block">{data.bufferVsRequest.srcSnippet}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* RIGHT COLUMN: Evidence Sidebar (Filled with "Below" Info) */}
                  <div className="bg-slate-900/10 flex flex-col divide-y divide-slate-800/50">
                      
                      {/* Analysis Status (FAILED = RED) */}
                      <div className="p-6 space-y-3">
                          <span className="text-xs font-black text-slate-600 uppercase tracking-widest block">{t("vulndb.detail.outcome.label")}</span>
                          <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-red-600/15 border border-red-600/30 text-red-500 font-black text-xs uppercase tracking-tight shadow-md inline-flex">
                              <ShieldX size={16} />
                              <span>{t("vulndb.detail.outcome.failed")}</span>
                          </div>
                      </div>

                      {/* Source Evidence (Code Context moved to fill the right section) */}
                      <div className="p-6 flex-1 min-h-0 flex flex-col space-y-4">
                          <header className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <FileCode size={16} className="text-slate-600" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t("vulndb.detail.evidence.title")}</span>
                             </div>
                             <button className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">{t("vulndb.detail.evidence.fullScreen")}</button>
                          </header>
                          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 shadow-2xl flex-1 max-h-[460px]">
                              <SyntaxHighlighter 
                                  language="cpp" 
                                  style={vscDarkPlus}
                                  customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '13px' }}
                                  codeTagProps={{ className: 'font-mono leading-relaxed' }}
                                  showLineNumbers
                                  lineNumberStyle={{ minWidth: '3.5em', paddingRight: '1rem', color: '#4b5563', fontSize: '10px' }}
                              >
                                  {data.codeContext}
                              </SyntaxHighlighter>
                          </div>
                      </div>

                      {/* Triage Recommendation */}
                      <div className="p-6 space-y-3 bg-red-600/[0.03]">
                          <div className="flex items-center gap-2">
                             <AlertTriangle size={14} className="text-red-500" />
                             <span className="text-xs font-black text-red-500/80 uppercase tracking-widest">{t("vulndb.detail.triage.plan")}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-300 leading-relaxed italic pr-4">
                             Apply strict size validation (<code className="text-blue-400 not-italic">strnlen()</code>) to destination pointer before copy to mitigate buffer overrun.
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          {/* 4. Technical Flow: Instruction Trace */}
          <div className="pb-16 pt-4">
                <EvidenceCard label={t("vulndb.detail.trace.title")} icon={ListTree}>
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/10 shadow-2xl">
                        <table className="w-full text-left text-sm font-mono">
                            <thead className="bg-slate-900 border-b border-slate-800 text-slate-600 uppercase tracking-[0.2em] font-black">
                                <tr>
                                    <th className="p-4 w-12 text-center opacity-30 text-[10px]">#</th>
                                    <th className="p-4 text-[10px]">{t("vulndb.detail.trace.executionPath")}</th>
                                    <th className="p-4 text-right w-24 text-[10px]">{t("vulndb.detail.trace.weight")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {data.statementFlow.map((step, idx) => (
                                    <tr key={step.id} className={cn("hover:bg-slate-800/30 group", step.step === "SINK" && "bg-red-600/10")}>
                                        <td className="p-4 text-center opacity-30 italic">s{idx + 1}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={cn("text-slate-300 font-bold group-hover:text-white transition-colors", step.step === "SINK" && "text-red-500 text-base font-black")}>{step.description}</span>
                                                <div className="flex gap-2.5 text-[10px] text-blue-500/60 uppercase font-black tracking-widest font-sans">
                                                    {step.tags.map(t => <span key={t}>[{t}]</span>)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-slate-500 group-hover:text-slate-300 font-bold">{step.weight.toFixed(3)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </EvidenceCard>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}

/* --- Modular Visual Patterns (Forced-Packing & No-Stack Pass) --- */

/**
 * Technical Integrity Gauge
 * Now constrained by the parent width (forced 300px slot).
 */
function IntegrityGaugeRestored({ capacity, request }: { capacity: number, request: number }) {
    const { t } = useI18n();
    const isOverflow = request > capacity;
    const overflowAmt = Math.max(0, request - capacity);

    return (
        <div className="flex flex-col gap-4">
            {/* Numerical Readout */}
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 font-sans">{t("vulndb.detail.gauge.boundary")}</span>
                    <div className="flex items-center gap-3 font-mono font-black text-base">
                        <span className="text-blue-500/80">{capacity} B</span>
                        <ArrowRight size={14} className="text-slate-800" />
                        <span className={cn(isOverflow ? "text-red-500" : "text-green-500")}>{request} B</span>
                    </div>
                </div>
                {isOverflow && (
                   <div className="flex flex-col items-end">
                       <span className="text-[8px] font-black text-red-500 uppercase leading-none mb-1 font-sans">{t("vulndb.detail.gauge.overrun")}</span>
                       <span className="text-sm font-black text-red-600 font-mono">+{overflowAmt} B</span>
                   </div>
                )}
            </div>

            {/* The Visual Bar */}
            <div className="h-4 w-full bg-slate-900 border border-slate-800 rounded-sm overflow-hidden flex relative shadow-inner">
                {/* 80% Wall Marker */}
                <div className="absolute inset-0 flex pointer-events-none z-30">
                     <div className="w-[80%] h-full border-r-2 border-white/30" />
                </div>

                {/* Safe Segment: BRIGHT GREEN */}
                <div 
                    className={cn("h-full relative z-10 transition-all duration-1000", isOverflow ? "bg-green-600/70 shadow-inner" : "bg-green-500 shadow-lg")}
                    style={{ width: isOverflow ? '80%' : `${(request / capacity) * 80}%` }}
                />

                {/* Violation Segment: BRIGHT RED */}
                {isOverflow && (
                    <div 
                        className="h-full bg-red-600 relative z-20 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
                        style={{ width: '20%' }}
                    >
                        <div className="absolute inset-0 bg-red-400/20 backdrop-blur-[1px]" />
                    </div>
                )}
            </div>

            <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] font-sans">
                <span>{t("vulndb.detail.gauge.baseline")}</span>
                <span>{t("vulndb.detail.gauge.limit")}</span>
                <span>{t("vulndb.detail.gauge.violation")}</span>
            </div>
        </div>
    );
}

function DashMetric({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: "blue" | "red" | "purple" | "slate" }) {
    const variants = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        red: "text-red-500 bg-red-500/10 border-red-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        slate: "text-slate-500 bg-slate-500/10 border-slate-800"
    };
    return (
        <div className="py-3 px-5 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between transition-all hover:border-slate-600 shadow-md">
            <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 leading-none">{label}</span>
                <span className="text-lg font-black text-white uppercase italic tracking-tighter truncate">{value}</span>
            </div>
            <div className={cn("w-8 h-8 flex items-center justify-center rounded-lg border shrink-0", variants[color])}>
                <Icon size={14} />
            </div>
        </div>
    );
}

function EvidenceCard({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
                <Icon size={14} className="text-slate-600" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">{label}</h3>
            </div>
            {children}
        </div>
    );
}
