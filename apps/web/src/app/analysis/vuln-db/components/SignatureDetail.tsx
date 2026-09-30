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
    <Tabs defaultValue="overview" className="flex flex-col bg-white text-neutral-700 w-full h-full overflow-hidden animate-in fade-in duration-500">
      {/* 0. Sticky Header Section */}
      <div className="shrink-0 z-20 shadow-sm bg-white">
        {/* Top Accent */}
        <div className="relative w-full h-1 bg-blue-600" />

        {/* Integrated Header */}
        <header className="px-6 py-4 border-b border-neutral-200 bg-white flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-neutral-950 tracking-tight leading-none">{data.patternId}</h1>
                <Badge variant="blue" className="border-blue-300 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-widest px-2 py-0.5">
                    {t("vulndb.detail.criticalAnalysis")}
                </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 uppercase tracking-wider font-medium">
                <span className="flex items-center gap-1.5"><Lock size={12} className="opacity-50 text-blue-700" /> SID: <span className="text-neutral-700">{data.sid}</span></span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="flex items-center gap-1.5"><ShieldAlert size={12} className="opacity-50 text-rose-600" /> CWE: <span className="text-neutral-700">{data.cwe}</span></span>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
            >
                <X size={20} />
            </button>
        </div>
        </header>

        {/* Sticky Tab Navigation */}
        <div className="px-6 pb-px border-b border-neutral-200 bg-white">
            <TabsList className="bg-neutral-50 border border-neutral-200 p-1 h-11 translate-y-px rounded-t-lg rounded-b-none border-b-0">
                <TabsTrigger
                    type="button"
                    value="overview"
                    className="px-6 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm uppercase text-xs font-bold tracking-widest transition-all rounded-md"
                >
                    {t("vulndb.detail.tabs.overview")}
                </TabsTrigger>
                <TabsTrigger
                    type="button"
                    value="analysis"
                    className="px-6 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm uppercase text-xs font-bold tracking-widest transition-all rounded-md"
                >
                    {t("vulndb.detail.tabs.analysis")}
                </TabsTrigger>
                <TabsTrigger
                    type="button"
                    value="flow"
                    className="px-6 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm uppercase text-xs font-bold tracking-widest transition-all rounded-md"
                >
                    {t("vulndb.detail.tabs.flow")}
                </TabsTrigger>
            </TabsList>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="w-full px-6 py-6">
            <TabsContent value="overview" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* 2. Top-Level Metrics Row */}
                <div className="grid grid-cols-4 gap-4">
                    <DashMetric label={t("vulndb.detail.metrics.cweClass")} value={data.cwe} icon={ShieldCheck} color="blue" />
                    <DashMetric label={t("vulndb.detail.metrics.region")} value={data.region} icon={Activity} color="slate" />
                    <DashMetric label={t("vulndb.detail.metrics.vector")} value={data.sinkMode} icon={Cpu} color="purple" />
                    <div className="py-2.5 px-4 rounded-lg border border-neutral-200 bg-white flex items-center justify-between transition-all hover:bg-neutral-50 shadow-sm group">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-none">{t("vulndb.detail.metrics.risk")}</span>
                            <span className="text-base font-bold text-neutral-900 tracking-tight">{data.risk}</span>
                        </div>
                        <StatusBadge status={data.risk} />
                    </div>
                </div>

                {/* 3. Primary Analysis Dashboard Summary */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Technical Verdict Banner */}
                    <div className="p-6 bg-rose-50 border-b border-neutral-200">
                        <div className="flex items-start gap-8">
                            <div className="w-14 h-14 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
                                <ShieldX size={32} className="text-rose-600" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-rose-700 uppercase tracking-[0.2em]">{t("vulndb.detail.violation.detected")}</span>
                                    <div className="flex-1 h-px bg-rose-200" />
                                </div>
                                <p className="text-2xl font-bold text-neutral-900 leading-tight">
                                    {t("vulndb.detail.violation.description", { sinkMode: data.sinkMode, region: data.region })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-neutral-200">
                            <div className="p-6 space-y-4">
                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">{t("vulndb.detail.outcome.label")}</span>
                                <div className="inline-flex items-center gap-4 px-5 py-3 border border-rose-300 bg-rose-50 text-rose-700 font-bold text-xs uppercase tracking-widest rounded-lg">
                                    <ShieldX size={18} className="opacity-70 text-rose-600" />
                                    <span>{t("vulndb.detail.outcome.failed")}</span>
                                </div>
                            </div>
                        <div className="p-6 space-y-4 bg-neutral-50">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={16} className="text-amber-600" />
                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{t("vulndb.detail.triage.plan")}</span>
                            </div>
                            <p className="text-sm font-medium text-neutral-700 leading-relaxed max-w-lg">
                                Apply strict size validation using <code className="text-blue-700 font-mono px-1.5 py-0.5 bg-blue-50 rounded border border-blue-200">strnlen()</code> to the source buffer before copying memory to mitigate the risk of buffer overruns.
                            </p>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="grid grid-cols-[1fr_450px] divide-x divide-neutral-200">
                        <div className="divide-y divide-neutral-200">
                            <div className="p-6 space-y-6">
                                <header className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em]">{t("vulndb.detail.execution.sink")}</span>
                                </header>
                                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 group transition-all hover:border-neutral-300">
                                    <code className="text-xl font-mono font-bold text-blue-700 block tracking-tight group-hover:text-blue-900 transition-colors text-center py-4">
                                        {data.sinkStatement}
                                    </code>
                                </div>
                            </div>

                            <div className="p-6">
                                <header className="flex items-center gap-3 mb-8">
                                    <div className="w-1.5 h-6 bg-neutral-300 rounded-full" />
                                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] leading-none">{t("vulndb.detail.analysis.integrity")}</span>
                                </header>
                                <div className="flex items-start gap-12">
                                    <div className="w-[340px] shrink-0">
                                        <IntegrityGaugeRestored 
                                            capacity={data.bufferVsRequest.capacity} 
                                            request={data.bufferVsRequest.request} 
                                        />
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="p-5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-3 group transition-all hover:bg-neutral-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                                                <span className="text-blue-700 font-bold uppercase text-xs tracking-widest">{t("vulndb.detail.objects.dstPtr")}</span>
                                            </div>
                                            <p className="text-sm text-neutral-700 leading-relaxed font-mono italic truncate block bg-white p-3 rounded-lg border border-neutral-200">{data.bufferVsRequest.destSnippet}</p>
                                        </div>
                                        <div className="p-5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-3 group transition-all hover:bg-neutral-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-4 bg-rose-500 rounded-full" />
                                                <span className="text-rose-700 font-bold uppercase text-xs tracking-widest">{t("vulndb.detail.objects.srcBuf")}</span>
                                            </div>
                                            <p className="text-sm text-neutral-700 leading-relaxed font-mono italic truncate block bg-white p-3 rounded-lg border border-neutral-200">{data.bufferVsRequest.srcSnippet}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col space-y-6 bg-neutral-50">
                            <header className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileCode size={18} className="text-blue-700" />
                                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em]">{t("vulndb.detail.evidence.title")}</span>
                                </div>
                            </header>
                            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 shadow-sm flex-1 max-h-[520px]">
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
                    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left text-sm font-mono border-collapse">
                            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-widest font-black text-[11px]">
                                <tr>
                                    <th className="p-6 w-16 text-center opacity-40">#</th>
                                    <th className="p-6 text-center">{t("vulndb.detail.trace.executionPath")}</th>
                                    <th className="p-6 text-center w-32">{t("vulndb.detail.trace.weight")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {data.statementFlow.map((step, idx) => (
                                    <tr key={step.id} className={cn("hover:bg-neutral-50 transition-colors group", step.step === "SINK" && "bg-rose-50")}>
                                        <td className="p-6 text-center opacity-30 text-sm italic">
                                            {String(idx + 1).padStart(2, '0')}
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className={cn(
                                                    "text-neutral-900 font-medium transition-colors text-base text-center",
                                                    step.step === "SINK" && "text-rose-700 font-black tracking-tight"
                                                )}>
                                                    {step.description}
                                                </span>
                                                <div className="flex flex-wrap justify-center gap-2.5">
                                                    {step.tags.map(t => (
                                                        <span key={t} className="px-2 py-0.5 rounded-lg bg-neutral-100 border border-neutral-200 text-[11px] text-blue-700 font-bold uppercase tracking-widest font-sans">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="text-xs tabular-nums font-black text-neutral-500 group-hover:text-neutral-700 transition-colors">
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
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.2em] leading-none mb-1 font-sans">{t("vulndb.detail.gauge.boundary")}</span>
                    <div className="flex items-center gap-3 font-mono font-bold text-lg leading-none">
                        <span className="text-blue-700">{capacity} B</span>
                        <ArrowRight size={14} className="text-neutral-400" />
                        <span className={cn(isOverflow ? "text-rose-600" : "text-green-600")}>{request} B</span>
                    </div>
                </div>
                {isOverflow && (
                   <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold text-rose-700 uppercase leading-none font-sans">{t("vulndb.detail.gauge.overrun")}</span>
                       <span className="text-base font-bold text-rose-700 font-mono leading-none">+{overflowAmt} B</span>
                   </div>
                )}
            </div>

            {/* The Visual Bar */}
            <div className="h-4 w-full bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden flex relative p-[2px]">
                {/* Safe Segment */}
                <div
                    className={cn("h-full rounded-[4px] transition-all duration-1000 relative z-10", isOverflow ? "bg-green-400" : "bg-green-500")}
                    style={{ width: isOverflow ? '80%' : `${(request / capacity) * 80}%` }}
                />

                {/* Violation Segment */}
                {isOverflow && (
                    <div
                        className="h-full bg-rose-500 rounded-[4px] relative z-20 animate-pulse ml-0.5"
                        style={{ width: 'calc(20% - 2px)' }}
                    >
                        <div className="absolute inset-0 bg-white/10" />
                    </div>
                )}
            </div>

            <div className="flex justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-widest font-sans px-1">
                <span>{t("vulndb.detail.gauge.baseline")}</span>
                <span>{t("vulndb.detail.gauge.limit")}</span>
                <span>{t("vulndb.detail.gauge.violation")}</span>
            </div>
        </div>
    );
}

function DashMetric({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: "blue" | "red" | "purple" | "slate" }) {
    const variants = {
        blue: "text-blue-700 bg-blue-50 border-blue-200",
        red: "text-rose-700 bg-rose-50 border-rose-200",
        purple: "text-purple-700 bg-purple-50 border-purple-200",
        slate: "text-neutral-600 bg-neutral-50 border-neutral-200"
    };
    return (
        <div className="py-2.5 px-4 rounded-lg border border-neutral-200 bg-white flex items-center justify-between transition-all hover:bg-neutral-50 shadow-sm group">
            <div className="flex flex-col overflow-hidden gap-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-none transition-colors">{label}</span>
                <span className="text-base font-bold text-neutral-900 tracking-tight truncate transition-colors">{value}</span>
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
                <Icon size={14} className="text-neutral-500" />
                <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.4em]">{label}</h3>
            </div>
            {children}
        </div>
    );
}
