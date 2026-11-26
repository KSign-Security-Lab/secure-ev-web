"use client";

import { Search, X } from "lucide-react";
import React, { useState } from "react";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchInput({
  onSearch,
  placeholder,
  defaultValue = "",
}: SearchInputProps) {
  const { t } = useI18n();
  const [value, setValue] = useState(defaultValue);

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
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleSearch}
        aria-label={t("common.search")}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
      >
        <Search size={16} />
      </button>
      <input
        type="search"
        placeholder={placeholder || t("common.searchPlaceholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-10 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-9 text-sm text-neutral-900 [&::-webkit-search-cancel-button]:hidden",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={clearInput}
          aria-label={t("common.clearSearch")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
