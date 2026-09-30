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
        href && !comingSoon && "hover:bg-neutral-50 hover:-translate-y-1 hover:shadow-sm hover:border-neutral-300",
        className
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110",
        {
          "bg-blue-50 text-blue-700 group-hover:bg-blue-100 group-hover:text-blue-800": variant === "blue",
          "bg-sky-50 text-sky-700 group-hover:bg-sky-100 group-hover:text-sky-800": variant === "cyan",
          "bg-purple-50 text-purple-700 group-hover:bg-purple-100 group-hover:text-purple-800": variant === "purple",
          "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-700": variant === "slate",
        },
        iconClassName
      )}>
        <Icon size={24} />
      </div>

      <h3 className="text-xl font-bold text-neutral-950 mb-2 tracking-tight italic leading-none">
        {title}
      </h3>

      <p className="text-neutral-500 mb-8 flex-1 text-sm font-medium leading-relaxed tracking-wide">
        {description}
      </p>

      {comingSoon ? (
        <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-neutral-500 cursor-not-allowed">
          Coming Soon
        </span>
      ) : href && (
        <div className="inline-flex items-center text-sm font-semibold transition-all duration-300 group-hover:gap-3 gap-2">
          <span className={cn({
            "text-blue-700": variant === "blue",
            "text-sky-700": variant === "cyan",
            "text-purple-700": variant === "purple",
            "text-neutral-500": variant === "slate",
          })}>
            {ctaText || "Learn More"}
          </span>
          <ArrowRight size={16} className={cn({
            "text-blue-700": variant === "blue",
            "text-sky-700": variant === "cyan",
            "text-purple-700": variant === "purple",
            "text-neutral-500": variant === "slate",
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
