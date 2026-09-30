"use client";

import { useEffect, useState, useCallback } from "react";
import { SaveIcon, Trash2 } from "lucide-react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { AbilitiesTable } from "~/components/page/abilities/AbilitiesTable";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { FilterBar } from "~/components/common/FilterBar/FilterBar";
import { useI18n } from "~/i18n/I18nProvider";

const PAGE_SIZE = 10;

export type AbilitiesListResponse = RouterOutputs["abilities"]["list"];

export default function Abilities() {
  const { t } = useI18n();
  const [data, setData] = useState<
    AbilitiesListResponse["abilities"] | undefined
  >();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchData = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      let response: AbilitiesListResponse | undefined;
      if (search) {
        response = await trpc.abilities.search.query({
          query: search,
          page,
          pageSize: PAGE_SIZE,
        });
      } else {
        response = await trpc.abilities.list.query({
          page,
          pageSize: PAGE_SIZE,
        });
      }
      if (response) {
        setData(response.abilities);
        setTotalCount(Number(response.count));
        setTotalPages(Math.ceil(Number(response.count) / PAGE_SIZE));
      }
    } catch {
      setData(undefined);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData(currentPage, query);
  }, [currentPage, query, fetchData]);

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700">
      <PageHeader 
        title={t("abilities.page.title") || "Abilities Library"}
        subtitle={t("abilities.page.subtitle") || "Manage and deploy security testing capabilities."}
        badge="Playground"
        actions={
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors">
              <SaveIcon className="w-4 h-4" />
              {t("abilities.page.register")}
            </button>
            <button className="flex items-center gap-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
              <Trash2 className="w-4 h-4" />
              {t("abilities.page.delete")}
            </button>
          </div>
        }
      />

      <FilterBar 
        handleSearch={handleSearch} 
        searchPlaceholder={t("abilities.page.searchPlaceholder") || "Search abilities..."}
      />

      <AbilitiesTable 
        data={data || []} 
        isLoading={isLoading}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
          totalCount,
          localeLabel: "abilities"
        }}
      />
    </div>
  );
}
