"use client";

import React from "react";
import { cn } from "~/lib/utils";

/**
 * Footer button for every modal. Convention (left → right):
 *   [extra action, pushed left with className="mr-auto"]  [secondary: 취소/닫기]  [primary: 저장/시작]
 * The primary action is always the right-most button.
 */
const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
} as const;

type ModalButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
};

export function ModalButton({ variant = "secondary", className, type = "button", ...props }: ModalButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
