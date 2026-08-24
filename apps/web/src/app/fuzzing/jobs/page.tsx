"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Filter, MoreHorizontal, FileText, Server, Zap, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateJobModal } from "~/components/page/fuzzing/CreateJobModal";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { FilterBar, FilterSelect } from "~/components/common/FilterBar/FilterBar";
import { DataTable, type DataTableColumn } from "~/components/common/DataTable/DataTable";
import { StatusBadge } from "~/components/common/StatusBadge/StatusBadge";
import { ConfirmationDialog } from "~/components/common/ConfirmationDialog/ConfirmationDialog";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { useI18n } from "~/i18n/I18nProvider";

const PAGE_SIZE = 8;

type FuzzingJobsList = RouterOutputs["fuzzing"]["list"];

export default function FuzzingJobsPage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  
  const [data, setData] = useState<FuzzingJobsList["jobs"] | undefined>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [activeActionRowId, setActiveActionRowId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case "ISO15118":
        return t("fuzzing.target.iso15118Charger");
      case "OCPP_CHARGER":
        return t("fuzzing.target.ocppCharger");
      case "OCPP_SERVER":
        return t("fuzzing.target.ocppServer");
      default:
        return targetType;
    }
  };

  const fetchData = useCallback(
    async (page = 1, status = "all", targetType = "all") => {
      setIsLoading(true);
      try {
        const response = await trpc.fuzzing.list.query({
          page,
          pageSize: PAGE_SIZE,
          status: status !== "all" ? (status as any) : undefined,
          targetType: targetType !== "all" ? (targetType as any) : undefined,
        });

        if (response) {
            setData(response.jobs);
            setTotalCount(response.count);
            setTotalPages(Math.ceil(response.count / PAGE_SIZE));
        }
      } catch {
        setData([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    },
    []
  );

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeActionRowId && !(event.target as Element).closest('.actions-menu')) {
        setActiveActionRowId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeActionRowId]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJobToDelete(id);
    setIsDeleteConfirmOpen(true);
    setActiveActionRowId(null);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await trpc.fuzzing.delete.mutate({ id: jobToDelete });
      await fetchData(currentPage, statusFilter, targetTypeFilter);
    } catch {
      // Handle error
    } finally {
      setIsDeleteConfirmOpen(false);
      setJobToDelete(null);
    }
  };

  const handleEditSub = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingJobId(id);
    setIsCreateModalOpen(true);
    setActiveActionRowId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchData(currentPage, statusFilter, targetTypeFilter);
  }, [currentPage, statusFilter, targetTypeFilter, fetchData]);

  const columns: DataTableColumn<FuzzingJobsList["jobs"][0]>[] = [
    {
      label: t("fuzzing.jobs.table.jobName"),
      render: (job) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-800 text-blue-400">
            <FileText size={16} />
          </div>
          <div>
            <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{job.name}</div>
            <div className="text-xs text-slate-500 font-mono italic">{job.id.slice(0, 8)}...</div>
          </div>
        </div>
      ),
    },
    {
      label: t("fuzzing.jobs.table.target"),
      render: (job) => (
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          {job.targetType === 'ISO15118' ? <Zap size={14} className="text-yellow-500" /> : <Server size={14} className="text-cyan-500" />}
          {getTargetTypeLabel(job.targetType)}
        </div>
      )
    },
    {
      label: t("fuzzing.jobs.table.status"),
      render: (job) => <StatusBadge status={job.status} />,
    },
    {
      label: t("fuzzing.jobs.table.environment"),
      render: (job) => (
        <span className="text-slate-400 font-medium">
          {job.environment || t("fuzzing.jobs.environment.production")}
        </span>
      ),
    },
    {
      label: t("fuzzing.jobs.table.created"),
      render: (job) => (
        <div className="text-slate-400 tabular-nums text-sm">
          {new Date(job.createdAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")} 
          <span className="text-slate-600 text-xs ml-2 italic">{new Date(job.createdAt).toLocaleTimeString(locale === "ko" ? "ko-KR" : "en-US")}</span>
        </div>
      ),
    },
    {
      label: t("fuzzing.jobs.table.actions"),
      className: "text-right",
      headerClassName: "text-right",
      render: (job) => (
        <div className="relative actions-menu flex justify-end">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveActionRowId(activeActionRowId === job.id ? null : job.id);
            }}
            className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-all transform active:scale-95"
          >
            <MoreHorizontal size={18} />
          </button>
          
          {activeActionRowId === job.id && (
            <div className="absolute right-0 mt-8 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="py-1 text-left">
                <button
                  onClick={(e) => handleEditSub(job.id, e)}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Edit size={14} />
                  {t("fuzzing.jobs.action.editConfiguration")}
                </button>
                <button
                  onClick={(e) => handleDeleteClick(job.id, e)}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} />
                  {t("fuzzing.jobs.action.deleteJob")}
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-200 font-sans px-6 py-4 md:px-12 md:py-6 selection:bg-blue-500/30">
      <div className="w-full space-y-4 max-w-7xl mx-auto">
        
        <PageHeader 
          title={t("fuzzing.jobs.title")}
          subtitle={t("fuzzing.jobs.subtitle")}
          actions={
            <button
              onClick={() => {
                setEditingJobId(null);
                setIsCreateModalOpen(true);
              }}
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 font-bold uppercase text-[11px] tracking-widest"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              {t("fuzzing.jobs.newJob")}
            </button>
          }
        />

        <FilterBar 
          handleSearch={() => fetchData(1, statusFilter, targetTypeFilter)} 
          searchPlaceholder={t("fuzzing.jobs.searchPlaceholder")}
        >
          <FilterSelect 
            label="Status"
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              handleFilterChange();
            }}
            options={[
              { label: t("status.draft"), value: "DRAFT" },
              { label: t("status.pending"), value: "PENDING" },
              { label: t("status.running"), value: "RUNNING" },
              { label: t("status.completed"), value: "COMPLETED" },
              { label: t("status.failed"), value: "FAILED" }
            ]}
            icon={Filter}
          />
          <FilterSelect 
            label="Target"
            value={targetTypeFilter}
            onValueChange={(val) => {
              setTargetTypeFilter(val);
              handleFilterChange();
            }}
            options={[
              { label: t("fuzzing.target.iso15118Charger"), value: "ISO15118" },
              { label: t("fuzzing.target.ocppCharger"), value: "OCPP_CHARGER" },
              { label: t("fuzzing.target.ocppServer"), value: "OCPP_SERVER" }
            ]}
            icon={Server}
          />
        </FilterBar>

        <DataTable 
          columns={columns}
          data={data}
          isLoading={isLoading}
          emptyState={{
            title: t("fuzzing.jobs.empty"),
            icon: FileText
          }}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            onPageChange: handlePageChange,
            totalCount: totalCount,
            localeLabel: t("fuzzing.jobs.table.items") || "jobs"
          }}
          onRowClick={(job) => router.push(`/fuzzing/jobs/${job.id}`)}
        />

        <CreateJobModal
          open={isCreateModalOpen}
          jobId={editingJobId || undefined}
          onClose={() => {
              setIsCreateModalOpen(false);
              setEditingJobId(null);
          }}
          onSuccess={(jobId) => {
            fetchData(currentPage, statusFilter, targetTypeFilter);
            router.push(`/fuzzing/jobs/${jobId}`);
          }}
        />

        <ConfirmationDialog 
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          onConfirm={handleConfirmDelete}
          title={t("fuzzing.jobs.deleteTitle") || "Confirm Deletion"}
          description={t("fuzzing.jobs.deleteConfirm") || "Are you sure you want to delete this job? This action cannot be undone."}
          confirmText={t("fuzzing.jobs.action.deleteJob")}
        />
      </div>
    </div>
  );
}
