"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface DashMetricProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: "blue" | "red" | "purple" | "slate" | "cyan" | "green" | "yellow";
  className?: string;
}

const colorVariants = {
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
  red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/5",
  purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5",
  cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5",
  green: "text-green-500 bg-green-500/10 border-green-500/20 shadow-green-500/5",
  yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/5",
  slate: "text-slate-400 bg-slate-800/20 border-slate-700/50",
};

export function DashMetric({
  label,
  value,
  icon: Icon,
  color = "blue",
  className,
}: DashMetricProps) {
  return (
    <div className={cn(
      "py-2.5 px-4 rounded-xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm flex items-center justify-between transition-all hover:bg-slate-800/40 hover:border-slate-700 shadow-xl group",
      className
    )}>
      <div className="flex flex-col overflow-hidden gap-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none group-hover:text-slate-400 transition-colors">
          {label}
        </span>
        <span className="text-lg font-black text-slate-200 uppercase tracking-tighter truncate group-hover:text-white transition-colors leading-tight">
          {value}
        </span>
      </div>
      <div className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg border shrink-0 transition-all group-hover:scale-110",
        colorVariants[color]
      )}>
        <Icon size={16} />
      </div>
    </div>
  );
}
