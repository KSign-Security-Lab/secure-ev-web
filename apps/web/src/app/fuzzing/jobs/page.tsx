"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, Filter, MoreHorizontal, FileText, Server, Zap, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreateJobModal } from "~/components/page/fuzzing/CreateJobModal";
import { Pagination } from "~/components/common/Pagination/Pagination";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { GlassCard } from "~/components/ui/glass-card";
import { Badge } from "~/components/ui/badge";
import { FuzzingJobsTableSkeleton } from "~/components/page/fuzzing/FuzzingSkeletons";

const PAGE_SIZE = 8;

type FuzzingJobsList = RouterOutputs["fuzzing"]["list"];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "green";
    case "RUNNING":
      return "blue";
    case "FAILED":
      return "red";
    case "PENDING":
      return "yellow";
    default:
      return "outline";
  }
};

const getTargetTypeLabel = (targetType: string) => {
  switch (targetType) {
    case "ISO15118":
      return "ISO 15118 Charger";
    case "OCPP_CHARGER":
      return "OCPP Charger";
    case "OCPP_SERVER":
      return "OCPP Server";
    default:
      return targetType;
  }
};

export default function FuzzingJobsPage() {
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

  const handleDeleteSub = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this job?")) {
        try {
            await trpc.fuzzing.delete.mutate({ id });
            await fetchData(currentPage, statusFilter, targetTypeFilter);
            setActiveActionRowId(null);
        } catch {
            setActiveActionRowId(null);
        }
    }
  };

  const handleEditSub = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingJobId(id);
    setIsCreateModalOpen(true);
    setActiveActionRowId(null);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchData(currentPage, statusFilter, targetTypeFilter);
  }, [currentPage, statusFilter, targetTypeFilter, fetchData]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-200 font-sans px-6 py-8 md:px-12 md:py-12">
      <div className="w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Active Fuzzing Jobs</h1>
            <p className="text-slate-400 mt-1">Manage and monitor your security testing sessions.</p>
          </div>
          <button
            onClick={() => {
                setEditingJobId(null);
                setIsCreateModalOpen(true);
            }}
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 font-medium"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            New Job
          </button>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
            <div className="flex-1 flex gap-4 min-w-[200px]">
                 <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search jobs..." 
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                    />
                 </div>
            </div>
            
            <div className="flex gap-4">
                 <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                        setStatusFilter(e.target.value);
                        handleFilterChange();
                        }}
                        className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-8 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Pending</option>
                        <option value="RUNNING">Running</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>

                <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                        value={targetTypeFilter}
                        onChange={(e) => {
                        setTargetTypeFilter(e.target.value);
                        handleFilterChange();
                        }}
                         className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-8 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none cursor-pointer"
                    >
                        <option value="all">All Targets</option>
                        <option value="ISO15118">ISO 15118</option>
                        <option value="OCPP_CHARGER">OCPP Charger</option>
                        <option value="OCPP_SERVER">OCPP Server</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Data Grid / Table */}
        <GlassCard className="overflow-visible shadow-2xl p-0 border-slate-700">
           <div className="overflow-visible">
             <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-800 border-b border-slate-700">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider rounded-tl-3xl">Job Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Target</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Environment</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right rounded-tr-3xl">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {isLoading ? (
                        <FuzzingJobsTableSkeleton />
                    ) : !data || data.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                No jobs found matching your criteria.
                            </td>
                        </tr>
                    ) : (
                        data.map((job) => (
                            <tr key={job.id} className="group hover:bg-slate-800/40 transition-colors duration-200">
                                <td className="px-6 py-4">
                                    <Link href={`/fuzzing/jobs/${job.id}`} className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-slate-800 text-blue-400">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{job.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{job.id.slice(0, 8)}...</div>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        {job.targetType === 'ISO15118' ? <Zap size={14} className="text-yellow-500" /> : <Server size={14} className="text-cyan-500" />}
                                        {getTargetTypeLabel(job.targetType)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={getStatusVariant(job.status) as any}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${job.status === 'RUNNING' ? 'bg-current animate-pulse' : 'bg-current'}`}></span>
                                        {job.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    {job.environment || 'Production'}
                                </td>
                                <td className="px-6 py-4 text-slate-400 tabular-nums text-sm">
                                    {new Date(job.createdAt).toLocaleDateString()} <span className="text-slate-600 text-xs">{new Date(job.createdAt).toLocaleTimeString()}</span>
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                     <div className="relative actions-menu">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveActionRowId(activeActionRowId === job.id ? null : job.id);
                                            }}
                                            className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        
                                        {activeActionRowId === job.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="py-1">
                                                    <button
                                                        onClick={(e) => handleEditSub(job.id, e)}
                                                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                                    >
                                                        <Edit size={14} />
                                                        Edit Configuration
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteSub(job.id, e)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete Job
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                     </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
             </table>
           </div>

           {/* Footer / Pagination */}
           <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-900/30 rounded-b-3xl">
             <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                    Showing <span className="text-white font-medium">{data?.length || 0}</span> of <span className="text-white font-medium">{totalCount}</span> jobs
                </div>
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
                )}
             </div>
           </div>
        </GlassCard>

      </div>

      {/* Create Job Modal */}
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
    </div>
  );
}
