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
      <DialogContent className="sm:max-w-md bg-white border-neutral-200 text-neutral-900">
        <DialogHeader className="gap-2">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-2",
            variant === "danger" ? "bg-rose-50 text-rose-700" :
            variant === "warning" ? "bg-amber-50 text-amber-700" :
            "bg-blue-50 text-blue-700"
          )}>
            <Icon size={24} />
          </div>
          <DialogTitle className="text-xl font-bold text-neutral-950 tracking-tight italic">
            {title}
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-sm font-medium leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 sm:justify-end mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-semibold"
          >
            {cancelText || t("common.cancel") || "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            variant={variant === "danger" ? "destructive" : variant === "warning" ? "default" : "default"}
            className={cn(
              "text-xs font-semibold px-6",
              variant === "danger" && "bg-rose-600 hover:bg-rose-700",
              variant === "warning" && "bg-amber-600 hover:bg-amber-700",
              variant === "info" && "bg-blue-600 hover:bg-blue-700"
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
