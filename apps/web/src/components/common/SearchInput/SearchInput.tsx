"use client";

import { Search, X } from "lucide-react";
import React, { useState } from "react";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  onSearch,
  placeholder,
}: SearchInputProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(value);
    }
  };

  const handleSearch = () => {
    onSearch(value);
  };

  const clearInput = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        placeholder={placeholder || t("common.searchPlaceholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "p-2 flex-1 border border-slate-600 text-slate-200 rounded-md bg-slate-800/50",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        )}
      />
      {value && (
        <button onClick={clearInput} aria-label={t("common.clearSearch")}>
          <X size={18} className="text-neutral-500" />
        </button>
      )}
      <button onClick={handleSearch} aria-label={t("common.search")}>
        <Search size={18} className="text-neutral-400" />
      </button>
    </div>
  );
}
