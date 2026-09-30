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
  blue: "text-blue-700 bg-blue-50 border-blue-200",
  red: "text-rose-700 bg-rose-50 border-rose-200",
  purple: "text-purple-700 bg-purple-50 border-purple-200",
  cyan: "text-sky-700 bg-sky-50 border-sky-200",
  green: "text-green-700 bg-green-50 border-green-200",
  yellow: "text-amber-700 bg-amber-50 border-amber-200",
  slate: "text-neutral-500 bg-neutral-50 border-neutral-200",
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
      "py-2.5 px-4 rounded-lg border border-neutral-200 bg-white flex items-center justify-between transition-all hover:bg-neutral-50 hover:border-neutral-300 group",
      className
    )}>
      <div className="flex flex-col overflow-hidden gap-1">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide leading-none group-hover:text-neutral-600 transition-colors">
          {label}
        </span>
        <span className="text-lg font-bold text-neutral-900 tracking-tight truncate group-hover:text-neutral-950 transition-colors leading-tight">
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
