"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { GlassCard } from "~/components/ui/glass-card";
import { cn } from "~/lib/utils";

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  ctaText?: string;
  comingSoon?: boolean;
  variant?: "blue" | "cyan" | "purple" | "slate";
  className?: string;
  iconClassName?: string;
}

export function IconCard({
  icon: Icon,
  title,
  description,
  href,
  ctaText,
  comingSoon = false,
  variant = "blue",
  className,
  iconClassName,
}: IconCardProps) {
  const content = (
    <GlassCard 
      variant={variant === "cyan" ? "cyan" : "default"} 
      className={cn(
        "p-8 h-full flex flex-col transition-all duration-300 group",
        href && !comingSoon && "hover:bg-slate-800/40 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-600/50",
        className
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110",
        {
          "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300": variant === "blue",
          "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300": variant === "cyan",
          "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300": variant === "purple",
          "bg-slate-500/10 text-slate-400 group-hover:bg-slate-500/20 group-hover:text-slate-300": variant === "slate",
        },
        iconClassName
      )}>
        <Icon size={24} />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight italic leading-none">
        {title}
      </h3>
      
      <p className="text-slate-400 mb-8 flex-1 text-sm font-medium leading-relaxed tracking-wide">
        {description}
      </p>
      
      {comingSoon ? (
        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 cursor-not-allowed">
          Coming Soon
        </span>
      ) : href && (
        <div className="inline-flex items-center text-sm font-bold uppercase tracking-widest transition-all duration-300 group-hover:gap-3 gap-2">
          <span className={cn({
            "text-blue-400": variant === "blue",
            "text-cyan-400": variant === "cyan",
            "text-purple-400": variant === "purple",
            "text-slate-400": variant === "slate",
          })}>
            {ctaText || "Learn More"}
          </span>
          <ArrowRight size={16} className={cn({
            "text-blue-400": variant === "blue",
            "text-cyan-400": variant === "cyan",
            "text-purple-400": variant === "purple",
            "text-slate-400": variant === "slate",
          })} />
        </div>
      )}
    </GlassCard>
  );

  if (href && !comingSoon) {
    if (href.startsWith("http")) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">{content}</a>;
    }
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}
