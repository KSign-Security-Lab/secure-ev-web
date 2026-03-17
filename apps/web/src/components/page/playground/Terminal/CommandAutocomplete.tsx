"use client";

import { useEffect, useState, useRef } from "react";
import { Check } from "lucide-react";
import trpc from "~/lib/trpc";
import { cn } from "~/lib/utils";

interface CommandSuggestion {
  id: string;
  ability_name: string;
  command: string;
  description: string;
}

interface CommandAutocompleteProps {
  currentInput: string;
  isVisible: boolean;
  onSelect: (command: string) => void;
  onClose: () => void;
}

export function CommandAutocomplete({
  currentInput,
  isVisible,
  onSelect,
  onClose,
}: CommandAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!isVisible || !currentInput.trim()) {
      setSuggestions([]);
      setSelectedIndex(0);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await trpc.abilities.searchCommands.query({
          query: currentInput.trim(),
          limit: 10,
        });
        setSuggestions(results);
        setSelectedIndex(0);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to search commands:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentInput, isVisible]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible || suggestions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (e.key === "Tab") {
          e.preventDefault();
        }
        if (suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex].command);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (containerRef.current) {
      const selectedElement = containerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-primary-500/30 text-primary-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={containerRef}
      data-autocomplete="true"
      className="max-h-80 w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl backdrop-blur-sm"
    >
      {isLoading ? (
        <div className="p-4 text-center text-sm text-slate-400">
          Searching commands...
        </div>
      ) : (
        <div className="py-2">
          {suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={suggestion.id}
                data-index={index}
                type="button"
                onClick={() => {
                  onSelect(suggestion.command);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-all duration-150 relative",
                  "hover:bg-slate-800/80 border-l-2 border-transparent",
                  isSelected && "bg-slate-800/90 border-l-primary-500 shadow-sm"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-200 flex-1">
                        {highlightText(
                          suggestion.ability_name,
                          currentInput.trim()
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-primary-400 text-xs font-medium shrink-0">
                          <Check size={14} className="text-primary-400" />
                          <span>Selected</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono break-all">
                      {highlightText(suggestion.command, currentInput.trim())}
                    </div>
                    {suggestion.description && (
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="border-t border-slate-700 px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
        <span>
          {suggestions.length > 0 && (
            <span className="text-slate-400">
              {selectedIndex + 1} of {suggestions.length} selected
            </span>
          )}
        </span>
        <span>
          ↑↓ navigate • Tab/Enter select • Esc close • Click to select
        </span>
      </div>
    </div>
  );
}
