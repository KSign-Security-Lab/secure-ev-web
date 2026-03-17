"use client";

import React, { useEffect, useState } from "react";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { StatsCard } from "~/components/dashboard/StatsCard";
import { Activity, PlayCircle, AlertOctagon } from "lucide-react";

type FuzzingJob = RouterOutputs["fuzzing"]["list"]["jobs"][0];

export function RecentFuzzingStats() {
  const [jobs, setJobs] = useState<FuzzingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs from the last 24 hours
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);
        
        // Fetch a large page size to ensure we get most recent activity
        const response = await trpc.fuzzing.list.query({
          pageSize: 100,
          fromDate: yesterday.toISOString(),
        });
        
        if (!cancelled && response) {
          setJobs(response.jobs);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch activity data", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const stats = React.useMemo(() => {
    const total = jobs.length;
    const running = jobs.filter((job) => job.status === "RUNNING").length;
    const failed = jobs.filter((job) => job.status === "FAILED").length;
    return { total, running, failed };
  }, [jobs]);

  if (isLoading) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
          </div>
      )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                최근 활동
                <span className="text-xs font-normal text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">24H</span>
            </h3>
            <p className="text-slate-400 text-sm mt-1">지난 24시간 동안의 주요 지표</p>
          </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="생성된 작업"
          value={stats.total}
          description="시작된 전체 Fuzzing 세션"
          icon={Activity}
          variant="primary"
        />
        <StatsCard
          title="진행 중인 작업"
          value={stats.running}
          description="현재 실행 중인 세션"
          icon={PlayCircle}
          variant="accent" // Cyan/Blue usually
        />
        <StatsCard
          title="오류 발생"
          value={stats.failed}
          description="예상치 못하게 종료된 작업"
          icon={AlertOctagon}
          variant={stats.failed > 0 ? "danger" : "success"}
        />
      </div>
    </div>
  );
}
