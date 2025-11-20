"use client";

import { useEffect, useState, useRef } from "react";
import type { UIEvent } from "react";
import { Search, X } from "lucide-react";
import trpc from "~/lib/trpc";
import { cn } from "~/lib/utils";

interface FilterState {
  platform: string | null;
  type: string | null;
  techniqueName: string | null;
  tactic: string | null;
}

interface CommandResult {
  id: string;
  ability_name: string;
  command: string;
  description: string;
  platform: string;
  type: string;
  technique_name: string;
  tactic?: string;
}

interface CommandFilterDropdownProps {
  onSelectCommand: (command: string) => void;
}

export function CommandFilterDropdown({
  onSelectCommand,
}: CommandFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    platform: null,
    type: null,
    techniqueName: null,
    tactic: null,
  });
  const [searchQueries, setSearchQueries] = useState<{
    platform: string;
    type: string;
    technique: string;
    tactic: string;
  }>({
    platform: "",
    type: "",
    technique: "",
    tactic: "",
  });
  const [commands, setCommands] = useState<CommandResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValues, setFilterValues] = useState<{
    platforms: string[];
    types: string[];
    techniqueNames: string[];
    tactics: string[];
  } | null>(null);
  const [keywordQuery, setKeywordQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "platform" | "type" | "technique" | "tactic" | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 50;

  // Fetch filter values when dropdown opens
  useEffect(() => {
    if (!isOpen || filterValues) return;

    const fetchFilterValues = async () => {
      setIsLoadingFilters(true);
      try {
        const values = await trpc.abilities.getFilterValues.query();
        setFilterValues(values);
      } catch (error) {
        console.error("Failed to fetch filter values:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterValues();
  }, [isOpen, filterValues]);

  const fetchCommands = async (pageToLoad: number, append = false) => {
    const trimmedKeyword = keywordQuery.trim();
    const hasAnyFilter =
      filterState.platform ||
      filterState.type ||
      filterState.techniqueName ||
      filterState.tactic;

    if (!hasAnyFilter && !trimmedKeyword) {
      setCommands([]);
      setTotalCount(0);
      setPage(1);
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await trpc.abilities.searchCommandsByFilters.query({
        platform: filterState.platform || undefined,
        type: filterState.type || undefined,
        techniqueName: filterState.techniqueName || undefined,
        tactic: filterState.tactic || undefined,
        query: trimmedKeyword || undefined,
        page: pageToLoad,
        pageSize: PAGE_SIZE,
      });

      setTotalCount(response.count);
      setPage(pageToLoad);
      setCommands((prev) =>
        append ? [...prev, ...response.abilities] : response.abilities
      );
    } catch (error) {
      console.error("Failed to fetch commands:", error);
      if (!append) setCommands([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch commands when any filter/keyword changes
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      void fetchCommands(1, false);
    }, 300);

    return () => clearTimeout(timeoutId);
    // We intentionally omit fetchCommands from the dependency array because it is recreated on every render,
    // but only uses stable dependencies that are already included below. This avoids unnecessary re-renders.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterState.platform,
    filterState.type,
    filterState.techniqueName,
    filterState.tactic,
    keywordQuery,
    isOpen,
  ]);

  const handleSelectOption = (
    filterType: "platform" | "type" | "technique" | "tactic",
    value: string
  ) => {
    setFilterState((prev) => ({
      ...prev,
      [filterType === "technique" ? "techniqueName" : filterType]: value,
    }));
    setSearchQueries((prev) => ({
      ...prev,
      [filterType]: "",
    }));
    setActiveFilter(null);
  };

  const handleClearFilter = (
    filterType: "platform" | "type" | "technique" | "tactic"
  ) => {
    setFilterState((prev) => ({
      ...prev,
      [filterType === "technique" ? "techniqueName" : filterType]: null,
    }));
    setSearchQueries((prev) => ({
      ...prev,
      [filterType]: "",
    }));
  };

  const handleReset = () => {
    setFilterState({
      platform: null,
      type: null,
      techniqueName: null,
      tactic: null,
    });
    setKeywordQuery("");
    setPage(1);
    setTotalCount(0);
    setSearchQueries({
      platform: "",
      type: "",
      technique: "",
      tactic: "",
    });
    setCommands([]);
    setActiveFilter(null);
  };

  const handleSelectCommand = (command: string) => {
    onSelectCommand(command);
    setIsOpen(false);
    handleReset();
  };

  const activeFilterCount = (
    ["platform", "type", "techniqueName", "tactic"] as const
  ).filter((key) => filterState[key]).length;

  const hasMore = commands.length < totalCount;

  const handleResultsScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!hasMore || isLoadingMore || isLoading) return;
    const target = e.currentTarget;
    const threshold = 48;
    if (
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - threshold
    ) {
      void fetchCommands(page + 1, true);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close active filter when clicking outside it
  useEffect(() => {
    if (activeFilter === null) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const filterDropdown = containerRef.current?.querySelector(
        `[data-filter-type="${activeFilter}"]`
      );
      if (filterDropdown && !filterDropdown.contains(target)) {
        setActiveFilter(null);
      }
    };

    // Use a small delay to avoid closing immediately when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeFilter]);

  const getFilteredOptions = (
    filterType: "platform" | "type" | "technique" | "tactic"
  ): string[] => {
    if (!filterValues) return [];

    let options: string[] = [];
    switch (filterType) {
      case "platform":
        options = filterValues.platforms;
        break;
      case "type":
        options = filterValues.types;
        break;
      case "technique":
        options = filterValues.techniqueNames;
        break;
      case "tactic":
        options = filterValues.tactics;
        break;
    }

    const query = searchQueries[filterType].toLowerCase();
    if (query) {
      return options.filter((opt) => opt.toLowerCase().includes(query));
    }
    return options;
  };

  const FilterDropdown = ({
    label,
    filterType,
    value,
  }: {
    label: string;
    filterType: "platform" | "type" | "technique" | "tactic";
    value: string | null;
  }) => {
    const isActive = activeFilter === filterType;
    const options = getFilteredOptions(filterType);

    return (
      <div className="relative" data-filter-type={filterType}>
        <button
          type="button"
          onClick={() => setActiveFilter(isActive ? null : filterType)}
          className={cn(
            "w-full px-3 py-2 text-left rounded-lg border transition-colors flex items-center justify-between bg-base-800/60 ring-1 ring-inset ring-base-700/60 hover:bg-base-800",
            value
              ? "border-primary-500/50 bg-primary-500/10 text-primary-100"
              : "border-base-700/60 text-neutral-200",
            isActive && "ring-2 ring-primary-500/60"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] uppercase tracking-wide text-neutral-400">
              {label}
            </span>
            <span className="text-sm truncate font-medium">
              {value || "Any"}
            </span>
          </div>
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilter(filterType);
              }}
              className="ml-2 text-neutral-400 hover:text-neutral-200 shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </button>

        {isActive && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-base-700/70 bg-base-900/95 backdrop-blur shadow-2xl flex flex-col max-h-64">
            <div className="p-3 border-b border-base-700/60">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQueries[filterType]}
                  onChange={(e) =>
                    setSearchQueries((prev) => ({
                      ...prev,
                      [filterType]: e.target.value,
                    }))
                  }
                  placeholder="Search..."
                  className="w-full rounded-md border border-base-700/60 bg-base-800/80 pl-8 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-56 py-1 pr-1">
              {options.length === 0 ? (
                <div className="p-3 text-center text-xs text-neutral-400">
                  No options found
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(filterType, option)}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-100 transition-colors hover:bg-base-800/80 focus:bg-base-800/80"
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 rounded-lg bg-base-900/70 px-4 py-2.5 text-sm font-medium text-neutral-200 ring-1 ring-inset ring-base-700/60 transition-colors hover:bg-base-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
      >
        <Search className="h-4 w-4" />
        <span>Search commands</span>
        {isOpen && (
          <span className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center rounded-full bg-base-800 px-2 py-0.5 text-[10px] text-neutral-300 ring-1 ring-inset ring-base-700">
              {activeFilterCount || "No"} filter
              {activeFilterCount === 1 ? "" : "s"}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-base-700/60 bg-base-950/90 shadow-2xl ring-1 ring-black/20 backdrop-blur z-50 overflow-visible">
          <div className="p-4 max-h-[75vh] overflow-visible">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Filter Commands
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-base-800 hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Keyword search */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Keyword
              </label>
              <div className="mt-2 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={keywordQuery}
                  onChange={(e) => setKeywordQuery(e.target.value)}
                  placeholder="Search by name, command, description..."
                  className="w-full rounded-md border border-base-700/60 bg-base-900/80 pl-8 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            {/* Filters Grid */}
            {isLoadingFilters ? (
              <div className="p-4 text-center text-sm text-neutral-400">
                Loading filters...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <FilterDropdown
                  label="Platform"
                  filterType="platform"
                  value={filterState.platform}
                />
                <FilterDropdown
                  label="Type"
                  filterType="type"
                  value={filterState.type}
                />
                <FilterDropdown
                  label="Technique"
                  filterType="technique"
                  value={filterState.techniqueName}
                />
                <FilterDropdown
                  label="Tactic"
                  filterType="tactic"
                  value={filterState.tactic}
                />
              </div>
            )}

            {/* Results */}
            <div className="border-t border-base-700/60 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-semibold text-neutral-400 tracking-[0.08em] uppercase">
                  Results
                </h4>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-neutral-400 hover:text-neutral-200 underline-offset-4 hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div
                ref={resultsContainerRef}
                onScroll={handleResultsScroll}
                className="max-h-[45vh] overflow-y-auto space-y-1.5 pr-1"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-neutral-400">
                    Searching commands...
                  </div>
                ) : commands.length === 0 ? (
                  <div className="p-4 text-center text-sm text-neutral-400">
                    {keywordQuery.trim()
                      ? "No commands found for that keyword."
                      : filterState.platform ||
                        filterState.type ||
                        filterState.techniqueName ||
                        filterState.tactic
                      ? "No commands found. Try adjusting your filters."
                      : "Type a keyword or select filters to search for commands."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {commands.map((cmd) => (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => handleSelectCommand(cmd.command)}
                        className="w-full text-left px-4 py-3 rounded-lg transition-colors border border-base-800/80 bg-base-900/60 hover:border-primary-500/40 hover:bg-base-900"
                      >
                        <div className="font-semibold text-white text-sm mb-1">
                          {cmd.ability_name}
                        </div>
                        <div className="text-[11px] text-neutral-300 font-mono break-all mb-2">
                          {cmd.command}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                          <span className="inline-flex items-center rounded-full bg-base-800/70 px-2 py-0.5 ring-1 ring-inset ring-base-700">
                            {cmd.platform}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-base-800/70 px-2 py-0.5 ring-1 ring-inset ring-base-700">
                            {cmd.type}
                          </span>
                          {cmd.technique_name && (
                            <span className="truncate text-neutral-500">
                              {cmd.technique_name}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                    {isLoadingMore && (
                      <div className="px-4 py-2 text-center text-xs text-neutral-400">
                        Loading more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
