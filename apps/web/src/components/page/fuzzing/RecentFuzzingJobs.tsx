"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Shield } from "lucide-react";
import { GlassCard } from "~/components/ui/glass-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import { Reveal } from "~/components/common/Reveal";

type FuzzingJob = RouterOutputs["fuzzing"]["list"]["jobs"][0];

export function RecentFuzzingJobs() {
  const [jobs, setJobs] = useState<FuzzingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      try {
        const response = await trpc.fuzzing.list.query({
          pageSize: 3,
          page: 1,
        });
        if (!cancelled && response) {
          setJobs(response.jobs);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch recent fuzzing jobs:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="h-48 animate-pulse bg-slate-800/50" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
       <div className="w-full text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No Recent Jobs</h3>
          <p className="text-slate-500 mb-6">Start your first fuzzing session to see it here.</p>
          <Link href="/fuzzing/jobs">
            <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
              Go to Jobs Dashboard
            </Button>
          </Link>
       </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
        <Link href="/fuzzing/jobs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          View all jobs <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobs.map((job: FuzzingJob, index: number) => (
          <Reveal key={job.id} delay={index * 100}>
            <Link href={`/fuzzing/jobs/${job.id}`}>
              <GlassCard 
                className="h-full hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Status Indicator Line */}
                <div 
                  className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                    job.status === 'COMPLETED' ? 'bg-green-500' :
                    job.status === 'RUNNING' ? 'bg-blue-500' :
                    job.status === 'FAILED' ? 'bg-red-500' :
                    'bg-slate-600'
                  }`} 
                />

                <div className="pl-3">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="bg-slate-950/50 border-slate-700 text-slate-400 text-xs">
                      {job.targetType.replace('_', ' ')}
                    </Badge>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        job.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-300 animate-pulse' :
                        job.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                        'bg-slate-800 text-slate-400'
                    }`}>
                        {job.status}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
                    {job.name}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto pt-4 border-t border-slate-800/50">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-400" />
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
