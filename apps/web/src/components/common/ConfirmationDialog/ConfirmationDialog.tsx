"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  const { t } = useI18n();

  const Icon = variant === "danger" ? Trash2 : variant === "warning" ? AlertTriangle : Info;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader className="gap-2">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-2",
            variant === "danger" ? "bg-red-500/10 text-red-500" :
            variant === "warning" ? "bg-yellow-500/10 text-yellow-500" :
            "bg-blue-500/10 text-blue-500"
          )}>
            <Icon size={24} />
          </div>
          <DialogTitle className="text-xl font-bold uppercase tracking-tight italic">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm font-medium leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 sm:justify-end mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-slate-400 hover:text-white hover:bg-slate-800 uppercase text-[10px] font-bold tracking-widest"
          >
            {cancelText || t("common.cancel") || "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            variant={variant === "danger" ? "destructive" : variant === "warning" ? "default" : "default"}
            className={cn(
              "uppercase text-[10px] font-bold tracking-widest px-6",
              variant === "danger" && "bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]",
              variant === "warning" && "bg-yellow-600 hover:bg-yellow-500 shadow-[0_0_20px_rgba(202,138,4,0.2)]",
              variant === "info" && "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            )}
          >
            {isLoading ? (
               <span className="flex items-center gap-2">
                 <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Processing...
               </span>
            ) : (
              confirmText || t("common.confirm") || "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
