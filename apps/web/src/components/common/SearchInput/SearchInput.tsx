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
          "p-2 flex-1 border border-neutral-200 text-neutral-900 rounded-md bg-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
        )}
      />
      {value && (
        <button onClick={clearInput} aria-label={t("common.clearSearch")}>
          <X size={18} className="text-neutral-500" />
        </button>
      )}
      <button onClick={handleSearch} aria-label={t("common.search")}>
        <Search size={18} className="text-neutral-500" />
      </button>
    </div>
  );
}
