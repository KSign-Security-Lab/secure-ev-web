"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Loader2, TrendingUp } from "lucide-react";
import trpc, { type RouterOutputs } from "~/lib/trpc";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type FuzzingJob = RouterOutputs["fuzzing"]["list"]["jobs"][0];

const CHART_COLORS = {
  bar: "rgba(59, 130, 246, 0.8)", // Blue 500
  hover: "rgba(96, 165, 250, 0.9)", // Blue 400
  grid: "rgba(75, 85, 99, 0.2)", // Gray 600
  text: "#9CA3AF", // Gray 400
};

export function RecentFuzzingActivityChart() {
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
        // In a real high-volume scenario, we might need a dedicated aggregate endpoint
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

  const chartData = useMemo(() => {
    // Initialize 24 buckets for the last 24 hours
    const hourlyCounts = new Array(24).fill(0);
    const labels = new Array(24).fill("");
    
    const now = new Date();
    const currentHour = now.getHours();

    // Create labels (e.g., "14:00")
    for (let i = 0; i < 24; i++) {
        // Calculate hour going backwards from now
        // But for chart, we want left-to-right to be past-to-present
        // So index 0 is 23 hours ago, index 23 is current hour
        const targetTime = new Date(now);
        targetTime.setHours(currentHour - (23 - i));
        labels[i] = targetTime.getHours().toString().padStart(2, '0') + ":00";
    }

    // Bucket jobs
    jobs.forEach(job => {
        const jobDate = new Date(job.createdAt);
        const diffMs = now.getTime() - jobDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours >= 0 && diffHours < 24) {
             // Map bucket: 0 hours ago -> index 23
             // 23 hours ago -> index 0
             // index = 23 - diffHours
             const index = 23 - diffHours;
             if (index >= 0 && index < 24) {
                 hourlyCounts[index]++;
             }
        }
    });

    return {
      labels,
      datasets: [
        {
          data: hourlyCounts,
          backgroundColor: CHART_COLORS.bar,
          hoverBackgroundColor: CHART_COLORS.hover,
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 12,
          maxBarThickness: 30,
        },
      ],
    };
  }, [jobs]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)", // Slate 900
        titleColor: "#FFFFFF",
        bodyColor: "#CBD5E1", // Slate 300
        borderColor: "rgba(51, 65, 85, 0.5)", // Slate 700
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (items: TooltipItem<"bar">[]) => {
             return `${items[0].label} - Activity`; 
          },
          label: (context: TooltipItem<"bar">) => {
            return `${context.raw} Jobs Started`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: CHART_COLORS.text,
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8, // Show roughly every 3-4 hours
        },
        border: {
            display: false
        }
      },
      y: {
        grid: {
          color: CHART_COLORS.grid,
          drawBorder: false,
        },
        ticks: {
          color: CHART_COLORS.text,
          stepSize: 1,
          font: {
            size: 10
          }
        },
        beginAtZero: true,
        border: {
            display: false
        }
      },
    },
    animation: {
      duration: 1000,
    }
  };

  const totalJobs24h = jobs.length;

  return (
     <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    Recent Activity 
                    <span className="text-xs font-normal text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">24H</span>
                </h3>
                <p className="text-slate-400 text-sm mt-1">Fuzzing jobs started over time</p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-blue-400 flex items-center justify-end gap-2">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : totalJobs24h}
                    <TrendingUp size={20} className="text-blue-500/50" />
                </div>
                <div className="text-xs text-slate-500">Total Jobs</div>
            </div>
        </div>

        <div className="flex-1 min-h-[200px] w-full relative">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : (
                <Bar options={options} data={chartData} />
            )}
        </div>
     </div>
  );
}
