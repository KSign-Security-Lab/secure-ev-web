import React from "react";
import { 
  ArrowRight, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  AlertTriangle,
  ShieldCheck,
  X,
  FileCode,
  ListTree,
  Lock,
  ShieldX
} from "lucide-react";
import { SignatureDetail as SignatureDetailType } from "../mockData";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useI18n } from "~/i18n/I18nProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StatusBadge } from "~/components/common/StatusBadge/StatusBadge";
import { Badge } from "~/components/ui/badge";

interface SignatureDetailProps {
  data: SignatureDetailType;
  onClose?: () => void;
}

export function SignatureDetail({ data, onClose }: SignatureDetailProps) {
  const { t } = useI18n();
  return (
    <Tabs defaultValue="overview" className="flex flex-col bg-slate-950 text-slate-300 w-full h-full overflow-hidden animate-in fade-in duration-500">
      {/* 0. Sticky Header Section */}
      <div className="shrink-0 z-20 shadow-2xl bg-slate-950">
        {/* Top Gradient Accent */}
        <div className="relative w-full h-1 bg-linear-to-r from-blue-500 via-cyan-500 to-blue-600" />
        
        {/* Integrated Header */}
        <header className="px-8 py-6 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white tracking-tight uppercase leading-none">{data.patternId}</h1>
                <Badge variant="blue" className="bg-blue-500/10 border-blue-500/30 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                    {t("vulndb.detail.criticalAnalysis")}
                </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-500 uppercase tracking-wider font-medium">
                <span className="flex items-center gap-1.5"><Lock size={12} className="opacity-50 text-blue-400" /> SID: <span className="text-slate-400">{data.sid}</span></span>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="flex items-center gap-1.5"><ShieldAlert size={12} className="opacity-50 text-red-400" /> CWE: <span className="text-slate-400">{data.cwe}</span></span>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                type="button"
                onClick={onClose} 
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
                <X size={20} />
            </button>
        </div>
        </header>

        {/* Sticky Tab Navigation */}
        <div className="px-8 pb-px border-b border-slate-800/50 bg-slate-950">
            <TabsList className="bg-slate-900/50 border border-slate-800/50 p-1 h-11 translate-y-px rounded-t-lg rounded-b-none border-b-0">
                <TabsTrigger 
                    type="button"
                    value="overview" 
                    className="px-6 data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest transition-all rounded-md"
                >
                    {t("vulndb.detail.tabs.overview")}
                </TabsTrigger>
                <TabsTrigger 
                    type="button"
                    value="analysis" 
                    className="px-6 data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest transition-all rounded-md"
                >
                    {t("vulndb.detail.tabs.analysis")}
                </TabsTrigger>
                <TabsTrigger 
                    type="button"
                    value="flow" 
                    className="px-6 data-[state=active]:bg-slate-800 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest transition-all rounded-md"
                >
                    {t("vulndb.detail.tabs.flow")}
                </TabsTrigger>
            </TabsList>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="w-full px-8 py-8">
            <TabsContent value="overview" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* 2. Top-Level Metrics Row */}
                <div className="grid grid-cols-4 gap-4">
                    <DashMetric label={t("vulndb.detail.metrics.cweClass")} value={data.cwe} icon={ShieldCheck} color="blue" />
                    <DashMetric label={t("vulndb.detail.metrics.region")} value={data.region} icon={Activity} color="slate" />
                    <DashMetric label={t("vulndb.detail.metrics.vector")} value={data.sinkMode} icon={Cpu} color="purple" />
                    <div className="py-2.5 px-4 rounded-xl border border-slate-800/80 bg-slate-800/5 flex items-center justify-between transition-all hover:bg-slate-800/10 hover:border-slate-700 shadow-lg group">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{t("vulndb.detail.metrics.risk")}</span>
                            <span className="text-base font-bold text-slate-200 uppercase tracking-tight">{data.risk}</span>
                        </div>
                        <StatusBadge status={data.risk} />
                    </div>
                </div>

                {/* 3. Primary Analysis Dashboard Summary */}
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    {/* Technical Verdict Banner */}
                    <div className="p-8 bg-red-500/5 border-b border-slate-800">
                        <div className="flex items-start gap-8">
                            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                                <ShieldX size={32} className="text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em]">{t("vulndb.detail.violation.detected")}</span>
                                    <div className="flex-1 h-px bg-red-500/20" />
                                </div>
                                <p className="text-2xl font-bold text-red-100/90 leading-tight">
                                    {t("vulndb.detail.violation.description", { sinkMode: data.sinkMode, region: data.region })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-800">
                            <div className="p-8 space-y-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t("vulndb.detail.outcome.label")}</span>
                                <div className="inline-flex items-center gap-4 px-5 py-3 border border-red-500/20 bg-red-500/5 text-red-500 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg">
                                    <ShieldX size={18} className="opacity-70 text-red-400" />
                                    <span>{t("vulndb.detail.outcome.failed")}</span>
                                </div>
                            </div>
                        <div className="p-8 space-y-4 bg-slate-800/5">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={16} className="text-amber-500/80" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("vulndb.detail.triage.plan")}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-lg italic">
                                Apply strict size validation using <code className="text-blue-400/80 font-mono px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">strnlen()</code> to the source buffer before copying memory to mitigate the risk of buffer overruns.
                            </p>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="grid grid-cols-[1fr_450px] divide-x divide-slate-800/50">
                        <div className="divide-y divide-slate-800/50">
                            <div className="p-8 space-y-6">
                                <header className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t("vulndb.detail.execution.sink")}</span>
                                </header>
                                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/80 shadow-inner group transition-all hover:border-slate-700">
                                    <code className="text-xl font-mono font-bold text-blue-400 block tracking-tight group-hover:text-blue-300 transition-colors text-center py-4">
                                        {data.sinkStatement}
                                    </code>
                                </div>
                            </div>

                            <div className="p-8">
                                <header className="flex items-center gap-3 mb-8">
                                    <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none">{t("vulndb.detail.analysis.integrity")}</span>
                                </header>
                                <div className="flex items-start gap-12">
                                    <div className="w-[340px] shrink-0">
                                        <IntegrityGaugeRestored 
                                            capacity={data.bufferVsRequest.capacity} 
                                            request={data.bufferVsRequest.request} 
                                        />
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="p-5 rounded-2xl bg-slate-800/10 border border-slate-800/60 space-y-3 group transition-all hover:bg-slate-900/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-4 bg-blue-500/50 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                                                <span className="text-blue-400/80 font-bold uppercase text-[10px] tracking-widest">{t("vulndb.detail.objects.dstPtr")}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed font-mono italic truncate block bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">{data.bufferVsRequest.destSnippet}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-slate-800/10 border border-slate-800/60 space-y-3 group transition-all hover:bg-slate-900/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-4 bg-red-500/50 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                                                <span className="text-red-400/80 font-bold uppercase text-[10px] tracking-widest">{t("vulndb.detail.objects.srcBuf")}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed font-mono italic truncate block bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">{data.bufferVsRequest.srcSnippet}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col space-y-6 bg-slate-950/30 backdrop-blur-sm">
                            <header className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileCode size={18} className="text-blue-400/60" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t("vulndb.detail.evidence.title")}</span>
                                </div>
                            </header>
                            <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl flex-1 max-h-[520px]">
                                <SyntaxHighlighter 
                                    language="cpp" 
                                    style={vscDarkPlus}
                                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                                    codeTagProps={{ className: 'font-mono leading-relaxed' }}
                                    showLineNumbers
                                    lineNumberStyle={{ minWidth: '3.5em', paddingRight: '1rem', color: '#4b5563', fontSize: '11px' }}
                                >
                                    {data.codeContext}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="flow" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <EvidenceCard label={t("vulndb.detail.trace.title")} icon={ListTree}>
                    <div className="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-900/20 shadow-2xl backdrop-blur-sm">
                        <table className="w-full text-left text-sm font-mono border-collapse">
                            <thead className="bg-slate-950/80 border-b border-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[9px]">
                                <tr>
                                    <th className="p-6 w-16 text-center opacity-40">#</th>
                                    <th className="p-6">{t("vulndb.detail.trace.executionPath")}</th>
                                    <th className="p-6 text-right w-32">{t("vulndb.detail.trace.weight")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {data.statementFlow.map((step, idx) => (
                                    <tr key={step.id} className={cn("hover:bg-slate-800/40 transition-colors group", step.step === "SINK" && "bg-red-500/5")}>
                                        <td className="p-6 text-center opacity-30 text-sm italic">
                                            {String(idx + 1).padStart(2, '0')}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-3">
                                                <span className={cn(
                                                    "text-slate-200 font-medium group-hover:text-white transition-colors text-base", 
                                                    step.step === "SINK" && "text-red-400 font-black tracking-tight"
                                                )}>
                                                    {step.description}
                                                </span>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {step.tags.map(t => (
                                                        <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800/60 text-[9px] text-blue-400 font-bold uppercase tracking-widest font-sans">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="text-xs tabular-nums font-black text-slate-600 group-hover:text-slate-400 transition-colors">
                                                {step.weight.toFixed(5)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </EvidenceCard>
                <div className="h-10" />
            </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
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
        <div className="flex flex-col gap-5">
            {/* Numerical Readout */}
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] leading-none mb-1 font-sans">{t("vulndb.detail.gauge.boundary")}</span>
                    <div className="flex items-center gap-3 font-mono font-bold text-lg leading-none">
                        <span className="text-blue-400/90">{capacity} B</span>
                        <ArrowRight size={14} className="text-slate-700" />
                        <span className={cn(isOverflow ? "text-red-500" : "text-green-500")}>{request} B</span>
                    </div>
                </div>
                {isOverflow && (
                   <div className="flex flex-col items-end gap-1">
                       <span className="text-[8px] font-bold text-red-500/70 uppercase leading-none font-sans">{t("vulndb.detail.gauge.overrun")}</span>
                       <span className="text-base font-bold text-red-500/90 font-mono leading-none">+{overflowAmt} B</span>
                   </div>
                )}
            </div>

            {/* The Visual Bar */}
            <div className="h-4 w-full bg-slate-800/20 border border-slate-800 rounded-lg overflow-hidden flex relative shadow-inner p-[2px]">
                {/* Safe Segment */}
                <div 
                    className={cn("h-full rounded-[4px] transition-all duration-1000 relative z-10", isOverflow ? "bg-green-500/40" : "bg-linear-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]")}
                    style={{ width: isOverflow ? '80%' : `${(request / capacity) * 80}%` }}
                />

                {/* Violation Segment */}
                {isOverflow && (
                    <div 
                        className="h-full bg-linear-to-r from-red-600 to-red-400 rounded-[4px] relative z-20 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse ml-0.5"
                        style={{ width: 'calc(20% - 2px)' }}
                    >
                        <div className="absolute inset-0 bg-white/10" />
                    </div>
                )}
            </div>

            <div className="flex justify-between text-[8px] font-bold text-slate-700 uppercase tracking-widest font-sans px-1">
                <span>{t("vulndb.detail.gauge.baseline")}</span>
                <span>{t("vulndb.detail.gauge.limit")}</span>
                <span>{t("vulndb.detail.gauge.violation")}</span>
            </div>
        </div>
    );
}

function DashMetric({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: "blue" | "red" | "purple" | "slate" }) {
    const variants = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
        red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/5",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5",
        slate: "text-slate-400 bg-slate-800/20 border-slate-700/50"
    };
    return (
        <div className="py-2.5 px-4 rounded-xl border border-slate-800/80 bg-slate-800/5 flex items-center justify-between transition-all hover:bg-slate-800/10 hover:border-slate-700 shadow-lg group">
            <div className="flex flex-col overflow-hidden gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none group-hover:text-slate-400 transition-colors">{label}</span>
                <span className="text-base font-bold text-slate-200 uppercase tracking-tight truncate group-hover:text-white transition-colors">{value}</span>
            </div>
            <div className={cn("w-9 h-9 flex items-center justify-center rounded-lg border shrink-0 transition-transform group-hover:scale-105", variants[color])}>
                <Icon size={16} />
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
