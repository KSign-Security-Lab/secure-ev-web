"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";
import { CommandBlock } from "./CommandBlock";

interface VariationsListProps {
  platform: string;
  executor: string;
  /** Already substituted. */
  variations: { description: string; command: string }[];
  onCommandTaken?: () => void;
}

/**
 * Collapsed by default — darwin alone ships 11 variations, and Caldera renders
 * them all inline, which buries the default command.
 */
export const VariationsList: React.FC<VariationsListProps> = ({
  platform,
  executor,
  variations,
  onCommandTaken,
}) => {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);

  if (variations.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ChevronRight
          size={13}
          className={cn("transition-transform", open && "rotate-90")}
        />
        {t("deploy.variations.show", { count: variations.length })}
      </button>

      {open && (
        <div className="space-y-3">
          {variations.map((variation) => (
            <CommandBlock
              key={variation.description}
              platform={platform}
              executor={executor}
              description={variation.description}
              command={variation.command}
              onCommandTaken={onCommandTaken}
            />
          ))}
        </div>
      )}
    </div>
  );
};
