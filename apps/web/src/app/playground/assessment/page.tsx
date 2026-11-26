"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import trpc from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentTable, type AssessmentItem } from "~/components/page/playground/Assessment/AssessmentTable";
import { AssessmentFormModal } from "~/components/page/playground/Assessment/AssessmentFormModal";
import { AssessmentDetailModal } from "~/components/page/playground/Assessment/AssessmentDetailModal";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { FilterBar } from "~/components/common/FilterBar/FilterBar";
import { ConfirmationDialog } from "~/components/common/ConfirmationDialog/ConfirmationDialog";
import { useToast } from "~/components/ToastProvider/ToastProvider";

const PAGE_SIZE = 10;

export default function AssessmentPage() {
  const { t } = useI18n();
  const showToast = useToast();
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await trpc.assessments.list.query());
    } catch {
      showToast(t("assessment.page.loadFailed"), { type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    let active = true;
    trpc.assessments.list
      .query()
      .then((res) => active && setItems(res))
      .catch(() => undefined)
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? items.filter((item) => `${item.name} ${item.target}`.toLowerCase().includes(q))
      : items;
  }, [items, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { deleted } = await trpc.assessments.deleteMany.mutate({ ids: [...selected] });
      showToast(t("assessment.page.deleted", { count: deleted }), { type: "success" });
      setSelected(new Set());
      setConfirmDelete(false);
      await load();
    } catch {
      showToast(t("assessment.page.deleteFailed"), { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const registerButton = (
    <button
      type="button"
      onClick={() => setFormOpen(true)}
      className="flex h-9 items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-md text-sm font-semibold transition-colors"
    >
      <Plus className="w-4 h-4" />
      {t("assessment.page.register")}
    </button>
  );

  return (
    <div className="flex flex-col w-full gap-4">
      <PageHeader
        title={t("assessment.page.title")}
        subtitle={t("assessment.page.subtitle")}
        badge={t("common.badge.playground")}
        actions={
          <div className="flex items-center gap-3">
            {registerButton}
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={() => setConfirmDelete(true)}
              className="flex h-9 min-w-[7.5rem] items-center justify-center gap-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
              {selected.size > 0
                ? t("assessment.page.deleteCount", { count: selected.size })
                : t("assessment.page.delete")}
            </button>
          </div>
        }
      />

      <FilterBar
        handleSearch={(q) => {
          setQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder={t("assessment.page.searchPlaceholder")}
      />

      <AssessmentTable
        data={pageItems}
        isLoading={isLoading}
        onRowClick={(item) => setDetailId(item.id)}
        selection={{ selected, onChange: setSelected }}
        emptyAction={query ? undefined : registerButton}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          totalCount: filtered.length,
          pageSize: PAGE_SIZE,
        }}
      />

      <AssessmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          void load();
        }}
      />

      <AssessmentDetailModal
        assessmentId={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />

      <ConfirmationDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        isLoading={deleting}
        title={t("assessment.page.deleteConfirmTitle", { count: selected.size })}
        description={t("assessment.page.deleteConfirmDesc")}
        confirmText={t("assessment.page.delete")}
      />
    </div>
  );
}
