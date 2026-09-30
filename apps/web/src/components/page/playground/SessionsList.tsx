"use client";

import { useMemo, useState, useCallback } from "react";
import { Monitor } from "lucide-react";
import SearchInput from "~/components/common/SearchInput/SearchInput";
import { Pagination } from "~/components/common/Pagination/Pagination";
import type { RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";

type SessionsListResponse = RouterOutputs["sessions"]["list"];

interface Props {
  data: SessionsListResponse | null;
  isLoading: boolean;
  error: string | null;
  selectedSessionId: string | null;
  onSelect: (paw: string) => void;
}

const SESSIONS_PER_PAGE = 20;

function PlatformBadge({ platform }: { platform: string }) {
  const cls =
    platform === "linux"
      ? "border border-green-300 bg-green-50 text-green-700"
      : platform === "windows"
      ? "border border-blue-300 bg-blue-50 text-blue-700"
      : "border border-neutral-200 bg-neutral-50 text-neutral-500";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}
    >
      <Monitor className="h-3 w-3" />
      {platform}
    </span>
  );
}

export function SessionsList({
  data,
  isLoading,
  error,
  selectedSessionId,
  onSelect,
}: Props) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSessions = useMemo(() => {
    if (!data?.sessions) return [];
    let filtered = data.sessions;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.paw.toLowerCase().includes(query) ||
          s.info.toLowerCase().includes(query) ||
          s.platform.toLowerCase().includes(query) ||
          s.executors.some((e) => e.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [data, searchQuery]);

  const totalPages =
    Math.ceil(filteredSessions.length / SESSIONS_PER_PAGE) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * SESSIONS_PER_PAGE;
    const end = start + SESSIONS_PER_PAGE;
    return filteredSessions.slice(start, end);
  }, [filteredSessions, currentPage]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  return (
    <div className="flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="sticky shrink-0 top-0 z-10 border-b border-neutral-200 bg-white px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-950">
              {t("playground.sessions.title")}
            </h2>
            {data && (
              <p className="mt-0.5 text-xs text-neutral-500">
                {t("playground.sessions.total", {
                  count: data.sessions.length,
                })}
                {searchQuery &&
                  ` • ${t("playground.sessions.found", {
                    count: filteredSessions.length,
                  })}`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
        {isLoading ? (
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[54px] animate-pulse rounded border border-neutral-200 bg-neutral-50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded border border-danger-500/20 bg-danger-500/10 p-3">
            <p className="text-xs font-medium text-danger-500">{error}</p>
          </div>
        ) : !data || data.sessions.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-neutral-100" />
              <p className="text-xs text-neutral-500">
                {t("playground.sessions.none")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 shrink-0">
              <SearchInput
                onSearch={handleSearch}
                placeholder={t("common.searchPlaceholder")}
              />
            </div>
            {filteredSessions.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-neutral-100" />
                  <p className="text-xs text-neutral-500">
                    {t("playground.sessions.noMatches")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 min-h-0">
                    {paginatedSessions.map((s) => {
                      const isSelected = selectedSessionId === s.paw;
                      const shownExecutors = s.executors.slice(0, 2);
                      const extra = Math.max(
                        s.executors.length - shownExecutors.length,
                        0
                      );
                      return (
                        <button
                          key={s.paw}
                          onClick={() => onSelect(s.paw)}
                          className={`w-full rounded border px-3 py-2.5 text-left text-xs transition-colors ${
                            isSelected
                              ? "border-blue-200 bg-blue-50"
                              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-700"
                                      : "text-neutral-900"
                                  }`}
                                >
                                  {s.paw}
                                </span>
                                <PlatformBadge platform={s.platform} />
                              </div>
                              <div className="mt-1 truncate text-neutral-500">
                                {s.info}
                              </div>
                              {shownExecutors.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                  {shownExecutors.map((ex) => (
                                    <span
                                      key={ex}
                                      className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 ring-1 ring-inset ring-neutral-200"
                                    >
                                      {ex}
                                    </span>
                                  ))}
                                  {extra > 0 && (
                                    <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 ring-1 ring-inset ring-neutral-200">
                                      +{extra}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-3 border-t border-neutral-200 pt-3">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SessionsList;
