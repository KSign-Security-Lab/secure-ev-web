"use client";

import React from "react";
import { 
  SignatureDetail as SignatureDetailType
} from "../mockData";
import { cn } from "~/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface SignatureDetailProps {
  data: SignatureDetailType;
  onBack?: () => void;
}

export function SignatureDetail({ data, onBack }: SignatureDetailProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full text-slate-200">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center px-1">
        <button 
            onClick={onBack}
            className="text-xs font-bold text-neutral-500 hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest"
        >
          <span className="text-lg">←</span> Back to Signatures
        </button>
      </div>

      {/* Pattern Identity Bar (Updated to Badge Header) */}
      <div className="flex flex-col gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white leading-tight font-mono">{data.patternId}</h2>
            <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest mt-1">{data.sid}</p>
        </div>

        <div className="h-px bg-base-850 w-full" />

        <div className="grid grid-cols-4 gap-4">
            <header className="border border-base-850 p-3 bg-base-900/50 flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase tracking-tighter">{data.cwe}</span>
                <span className="text-[9px] font-mono text-neutral-600 uppercase">Stack BO</span>
            </header>
            <header className="border border-base-850 p-3 bg-base-900/50 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", data.risk === "HIGH" ? "bg-red-500" : data.risk === "MEDIUM" ? "bg-yellow-500" : "bg-green-500")} />
                    <span className="text-xs font-bold text-white uppercase tracking-tighter">{data.risk}</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-600 uppercase">Risk Level</span>
            </header>
            <header className="border border-base-850 p-3 bg-base-900/50 flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase tracking-tighter">{data.sinkMode}</span>
                <span className="text-[9px] font-mono text-neutral-600 uppercase">Sink Mode</span>
            </header>
            <header className="border border-base-850 p-3 bg-base-900/50 flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase tracking-tighter">{data.region}</span>
                <span className="text-[9px] font-mono text-neutral-600 uppercase">Memory Region</span>
            </header>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Vulnerability Analysis */}
        <div className="flex flex-col gap-6">
          <SectionTitle title="Vulnerability Analysis" />
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 text-neutral-500">Sink Statement</label>
              <div className="bg-base-950 p-4 border border-base-850 font-mono text-blue-400 text-sm shadow-inner overflow-x-auto">
                {data.sinkStatement}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 text-neutral-500">Buffer vs Request</label>
              <div className="bg-base-900/50 p-5 border border-base-850 space-y-5">
                  <div className="grid grid-cols-[100px_1fr_100px] gap-4 items-center h-16">
                      <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-neutral-500 uppercase font-bold">Capacity</span>
                          <span className="text-[10px] text-neutral-500 uppercase font-bold">Request</span>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                          <div className="h-6 w-full bg-base-950 flex relative border border-base-850">
                             <div 
                                className="h-full bg-slate-200 transition-all duration-1000" 
                                style={{ width: `${(data.bufferVsRequest.capacity / data.bufferVsRequest.request) * 100}%` }}
                             />
                             <div className="absolute inset-0 flex items-center justify-end px-2 mix-blend-difference pointer-events-none">
                                <div className="w-px h-full bg-white/20" />
                             </div>
                          </div>
                          <div className="h-6 w-full bg-base-950 flex border border-base-850">
                             <div className="h-full bg-slate-400 w-[110%] transition-all duration-1000 bg-opacity-30 flex pattern-grid-slate-400" />
                          </div>
                      </div>
                      <div className="flex flex-col gap-1 text-right font-mono text-[11px]">
                          <span className="text-white">{data.bufferVsRequest.capacity} bytes</span>
                          <span className="text-white">{data.bufferVsRequest.request} bytes</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 border-t border-base-850/50 pt-3">
                      <span className="text-red-500">△</span> {data.bufferVsRequest.details}
                  </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest mb-2 text-neutral-500">Diagnostic</label>
              <div className="bg-base-900/50 p-4 border border-base-850 space-y-4">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="flex items-baseline gap-4">
                        <span className="text-[10px] text-neutral-600 font-bold uppercase w-16">Class:</span>
                        <span className="text-xs font-mono text-slate-300">{data.diagnostic.class}</span>
                     </div>
                     <div className="flex items-baseline gap-4">
                        <span className="text-[10px] text-neutral-600 font-bold uppercase w-16">Taint:</span>
                        <span className="text-xs font-mono text-slate-300">{data.diagnostic.taint}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">Validation:</span>
                          <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 font-mono">upper {data.diagnostic.validation.upper ? "✓" : "✗"}</span>
                              <span className="text-xs text-slate-400 font-mono">lower {data.diagnostic.validation.lower ? "✓" : "✗"}</span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Context & Flow */}
        <div className="flex flex-col gap-6 font-mono">
            <div className="flex flex-col h-fit">
                <SectionTitle title="Code Context" subtitle="Embedding Snippet" />
                <div className="border border-base-850 overflow-hidden bg-base-950 mt-4 p-4">
                    <div className="relative">
                        <SyntaxHighlighter 
                            language="cpp" 
                            style={atomDark}
                            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                            codeTagProps={{ className: 'font-mono text-[11px] leading-relaxed' }}
                        >
                            {data.codeContext}
                        </SyntaxHighlighter>
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
                <SectionTitle title="Statement Flow" />
                <div className="border border-base-850 overflow-hidden mt-4 flex-1">
                    <table className="w-full text-left border-collapse">
                        <tbody className="font-mono text-[10px]">
                            {data.statementFlow.map((step) => (
                                <tr key={step.id} className={cn("transition-colors", step.step === "SINK" ? "bg-red-500/10 text-white" : "text-neutral-400 hover:bg-white/5")}>
                                    <td className="px-4 py-1.5 w-10 text-right font-bold opacity-50">
                                      {step.id}
                                    </td>
                                    <td className="px-4 py-1.5 flex items-center gap-2">
                                      {step.step === "SINK" && <span className="text-blue-500">▶</span>}
                                      <span className="font-bold opacity-70 w-16">{step.step}</span>
                                      <span className="text-slate-200">{step.description}</span>
                                    </td>
                                    <td className="px-4 py-1.5 text-right opacity-60">
                                      (weight: {step.weight.toFixed(2)})
                                    </td>
                                    <td className="px-4 py-1.5 text-blue-400/50 font-black">
                                      {step.tags.length > 0 ? `[${step.tags.join(":")}]` : "."}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* Footer Tags */}
      <div className="flex flex-col gap-4">
        <SectionTitle title="Semantic Tags" />
        <div className="flex flex-wrap gap-2">
            {data.semanticTags.map(tag => (
                <span key={tag} className="font-mono text-[10px] text-neutral-500 uppercase font-black px-2 py-1 tracking-tight">
                    [{tag}]
                </span>
            ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string, subtitle?: string }) {
    return (
        <div className="flex items-center gap-3 w-full">
            <span className="text-lg text-neutral-500">---</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">{title}</h2>
            {subtitle && <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">({subtitle})</span>}
            <div className="flex-1 h-px bg-base-850/30" />
            <span className="text-lg text-neutral-500">---</span>
        </div>
    );
}
