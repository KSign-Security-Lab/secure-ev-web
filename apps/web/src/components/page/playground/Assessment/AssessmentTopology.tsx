"use client";

import React from "react";
import { Server, Database, Shield, Radio, ArrowRight, Activity } from "lucide-react";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";

interface AssessmentTopologyProps {
  className?: string;
}

export const AssessmentTopology: React.FC<AssessmentTopologyProps> = ({ className }) => {
  const { t } = useI18n();

  return (
    <div className={cn(
      "relative aspect-4/1 w-full bg-white border border-neutral-200 rounded-lg flex items-center justify-around overflow-hidden group shadow-sm shrink-0 p-8",
      className
    )}>
      {/* Blueprint Grid SVG Pattern */}
      <div className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%233b82f6' stroke-width='0.5'%3E%3Cpath d='M0 40L40 0M0 0l40 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} 
      />
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} 
      />

      {/* Connection Lines (Static SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 150 60 L 350 60" stroke="#c2c7d0" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <path d="M 450 60 L 650 60" stroke="#c2c7d0" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <path d="M 750 60 L 900 60" stroke="#c2c7d0" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      </svg>

      {/* Node 1: Control Center */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="w-14 h-14 rounded-lg bg-white border border-blue-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Server className="text-blue-500 w-7 h-7" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Control_Center</span>
          <span className="text-[9px] font-mono text-blue-700 opacity-60">10.0.1.254</span>
        </div>
      </div>

      <div className="z-10 text-neutral-300">
        <ArrowRight size={16} className="opacity-30" />
      </div>

      {/* Node 2: Attack Proxy */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <div className="w-14 h-14 rounded-lg bg-white border border-rose-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Shield className="text-rose-600 w-7 h-7" />
          <div className="absolute inset-0 rounded-lg border border-rose-300/40 animate-ping opacity-20" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Attack_Proxy</span>
          <span className="text-[9px] font-mono text-rose-700 opacity-60">192.168.10.5</span>
        </div>
      </div>

      <div className="z-10 text-neutral-300">
        <ArrowRight size={16} className="opacity-30" />
      </div>

      {/* Node 3: Target Vehicle */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
        <div className="w-14 h-14 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Radio className="text-neutral-700 w-7 h-7 opacity-80" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Vehicle_ECU</span>
          <span className="text-[9px] font-mono text-neutral-500 opacity-60">CAN_BUS:0x700</span>
        </div>
      </div>

      <div className="z-10 text-neutral-300">
        <ArrowRight size={16} className="opacity-30" />
      </div>

      {/* Node 4: Backend Cloud */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
        <div className="w-14 h-14 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Database className="text-neutral-500 w-7 h-7" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">OCPP_Backend</span>
          <span className="text-[9px] font-mono text-neutral-500 opacity-60">HTTPS:443</span>
        </div>
      </div>


      {/* Corner markings */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-blue-200" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-blue-200" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-blue-200" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-blue-200" />
      
      {/* Decorative technical labels */}
      <div className="absolute bottom-2 left-6 flex items-center gap-2">
        <Activity size={10} className="text-blue-700 animate-pulse" />
        <span className="text-[7px] font-mono text-neutral-400 uppercase tracking-[0.2em]">LIVE_TOPOLOGY_V1.1</span>
      </div>
      <div className="absolute top-2 right-6 text-[7px] font-mono text-neutral-400 uppercase tracking-[0.2em]">{t("assessment.detail.systemArchitecture")}</div>
    </div>
  );
};
