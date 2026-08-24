"use client";

import React from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Reveal } from "../Reveal";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "blue" | "cyan" | "green" | "red" | "yellow";
  actions?: React.ReactNode;
  className?: string;
  withReveal?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = "blue",
  actions,
  className,
  withReveal = true,
}: PageHeaderProps) {
  const content = (
    <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full mb-4", className)}>
      <div className="space-y-1">
        {badge && (
          <Badge variant={badgeVariant} className="mb-2">
            <span className={cn("flex h-2 w-2 rounded-full mr-2", {
              "bg-blue-400 animate-pulse": badgeVariant === "blue",
              "bg-cyan-400 animate-pulse": badgeVariant === "cyan",
              "bg-green-400": badgeVariant === "green",
              "bg-red-400": badgeVariant === "red",
              "bg-yellow-400": badgeVariant === "yellow",
            })}></span>
            {badge}
          </Badge>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-400 mt-2 text-base font-medium tracking-wide">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );

  if (withReveal) {
    return <Reveal width="100%">{content}</Reveal>;
  }

  return content;
}
