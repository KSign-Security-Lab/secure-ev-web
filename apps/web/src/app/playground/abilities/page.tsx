"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "~/components/common/ConfirmationDialog/ConfirmationDialog";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import { CreateAbilityModal } from "~/components/page/abilities/CreateAbilityModal";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { AbilitiesTable } from "~/components/page/abilities/AbilitiesTable";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { FilterBar } from "~/components/common/FilterBar/FilterBar";
import { useI18n } from "~/i18n/I18nProvider";

const DEFAULT_PAGE_SIZE = 10;

export type AbilitiesListResponse = RouterOutputs["abilities"]["list"];

export default function AbilitiesPage() {
  return (
    <Suspense fallback={null}>
      <Abilities />
    </Suspense>
  );
}

function Abilities() {
  const { t } = useI18n();
  // Deep link from the coverage matrix: /playground/abilities?q=T1059
  const initialQuery = useSearchParams().get("q") ?? "";
  const [data, setData] = useState<
    AbilitiesListResponse["abilities"] | undefined
  >();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [query, setQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const showToast = useToast();

  const fetchData = useCallback(async (page = 1, search = "", size = DEFAULT_PAGE_SIZE) => {
    setIsLoading(true);
    try {
      let response: AbilitiesListResponse | undefined;
      if (search) {
        response = await trpc.abilities.search.query({
          query: search,
          page,
          pageSize: size,
        });
      } else {
        response = await trpc.abilities.list.query({
          page,
          pageSize: size,
        });
      }
      if (response) {
        setData(response.abilities);
        setTotalCount(Number(response.count));
        setTotalPages(Math.ceil(Number(response.count) / size));
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
    fetchData(currentPage, query, pageSize);
  }, [currentPage, query, pageSize, fetchData]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { deleted } = await trpc.abilities.deleteMany.mutate({ ids: [...selected] });
      showToast(t("abilities.page.deleted", { count: deleted }), { type: "success" });
      setSelected(new Set());
      setConfirmDelete(false);
      fetchData(currentPage, query, pageSize);
    } catch {
      showToast(t("abilities.page.deleteFailed"), { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700">
      <PageHeader 
        title={t("abilities.page.title") || "Abilities Library"}
        subtitle={t("abilities.page.subtitle") || "Manage and deploy security testing capabilities."}
        badge={t("common.badge.playground")}
        actions={
          <div className="flex gap-3">
            <button type="button" onClick={() => setCreateOpen(true)} className="flex h-9 items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-md text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              {t("abilities.page.register")}
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={() => setConfirmDelete(true)}
              className="flex h-9 min-w-[7.5rem] justify-center items-center gap-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
              {selected.size > 0
                ? t("abilities.page.deleteCount", { count: selected.size })
                : t("abilities.page.delete")}
            </button>
          </div>
        }
      />

      <FilterBar 
        handleSearch={handleSearch}
        searchDefaultValue={initialQuery}
        searchPlaceholder={t("abilities.page.searchPlaceholder") || "Search abilities..."}
      />

      <AbilitiesTable 
        data={data || []} 
        isLoading={isLoading}
        onUpdated={() => fetchData(currentPage, query)}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
          totalCount,
          pageSize,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{ selected, onChange: setSelected }}
      />

      <CreateAbilityModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          fetchData(currentPage, query, pageSize);
        }}
      />

      <ConfirmationDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        isLoading={deleting}
        title={t("abilities.page.deleteConfirmTitle", { count: selected.size })}
        description={t("abilities.page.deleteConfirmDesc")}
        confirmText={t("abilities.page.delete")}
      />
    </div>
  );
}
