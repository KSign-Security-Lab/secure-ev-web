"use client";

import { useEffect, useState, useCallback } from "react";
import { SaveIcon, Trash2 } from "lucide-react";
import SearchInput from "~/components/common/SearchInput/SearchInput";
import Loading from "~/components/common/Loading/Loading";
import { Pagination } from "~/components/common/Pagination/Pagination";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { AbilitiesTable } from "~/components/page/abilities/AbilitiesTable";
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
        setTotalPages(Math.ceil(Number(response.count) / PAGE_SIZE));
      }
    } catch {
      setData(undefined);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300); // Slight delay for better UX
    }
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setCurrentPage(1); // Reset to page 1 when searching
    await fetchData(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData(currentPage, query);
  }, [currentPage, query, fetchData]);

  return (
    <div className="flex flex-col w-full bg-base-900 p-8 rounded-xl">
      {/* Top Controls */}
      <div className="flex justify-between w-full items-center">
        <div className="w-120">
          <SearchInput onSearch={handleSearch} />
        </div>

        <div className="flex space-x-2">
          <button className="p-2 bg-primary-300 flex items-center rounded-sm hover:bg-primary-400 transition">
            <SaveIcon color="white" className="w-4 h-4" />
            <span className="ml-1 text-sm text-white">
              {t("abilities.page.register")}
            </span>
          </button>
          <button className="p-2 bg-danger-500 flex items-center rounded-sm hover:bg-danger-600 transition">
            <Trash2 color="white" className="w-4 h-4" />
            <span className="ml-1 text-sm text-white">
              {t("abilities.page.delete")}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-4 flex flex-col space-y-6 min-h-[700px]">
        {isLoading ? (
          <Loading />
        ) : data ? (
          <AbilitiesTable data={data} />
        ) : (
          <div className="text-center text-gray-400 py-8">
            {t("abilities.page.empty")}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
