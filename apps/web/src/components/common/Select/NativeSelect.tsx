"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

type NativeSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: "sm" | "md";
  wrapperClassName?: string;
};

/**
 * Styled native <select>: keeps the platform's keyboard/a11y behaviour (and
 * works inside modals without portal z-index issues) but drops the browser's
 * default chrome so it matches the rest of the console.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  function NativeSelect({ className, wrapperClassName, size = "md", children, ...props }, ref) {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-md border border-neutral-200 bg-white pl-3 pr-8 text-neutral-900 outline-none transition-colors",
            "hover:border-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
            size === "sm" ? "h-8 text-xs" : "h-10 text-sm",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400",
            size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
          )}
        />
      </div>
    );
  }
);
