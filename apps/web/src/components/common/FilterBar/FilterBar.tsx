"use client";

import React from "react";
import { Search, Filter, Server, Shield } from "lucide-react";
import SearchInput from "../SearchInput/SearchInput";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select";
import { useI18n } from "~/i18n/I18nProvider";
import { cn } from "~/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: (string | FilterOption)[];
  icon?: React.ElementType;
  showAll?: boolean;
}

export function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  icon: Icon,
  showAll = true,
}: FilterBarSelectProps) {
  const { t } = useI18n();
  return (
    <div className="relative group">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-hover:text-blue-700 transition-colors z-10" />}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(
          "bg-white border-neutral-200 text-neutral-900 text-sm rounded-lg pr-8 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 outline-none cursor-pointer hover:border-neutral-300 transition-all",
          Icon ? "pl-10" : "pl-4"
        )}>
          <SelectValue placeholder={`[${label}]`} />
        </SelectTrigger>
        <SelectContent className="bg-white border-neutral-200">
          {showAll && (
            <SelectItem value="all" className="text-xs uppercase font-semibold text-neutral-500 italic hover:text-neutral-900 transition-colors">
              {t("vulndb.filters.all") || "All"} {label}s
            </SelectItem>
          )}
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lab = typeof opt === "string" ? opt : opt.label;
            return (
              <SelectItem key={val} value={val} className="text-xs font-mono">
                {lab}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

interface FilterBarProps {
  handleSearch?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  handleSearch,
  searchPlaceholder,
  children,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-neutral-200", className)}>
      {handleSearch && (
        <div className="flex-1 flex gap-4 min-w-[200px]">
          <div className="relative flex-1 max-w-xl">
             <SearchInput onSearch={handleSearch} placeholder={searchPlaceholder} />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {children}
      </div>
    </div>
  );
}
