import React from "react";
import { cn } from "~/lib/utils";

/**
 * Basic Skeleton Component
 * Mimics a loading state with a pulse animation.
 */
export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-900/50", className)}
      {...props}
    />
  );
};

/**
 * Skeleton for the Jobs List Table
 * Renders multiple rows of placeholder data.
 */
export const FuzzingJobsTableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-800/50">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </td>
          <td className="px-6 py-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>
          <td className="px-6 py-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </td>
          <td className="px-6 py-4 text-right">
             <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
};

/**
 * Skeleton for the Job Details Page
 * Mimics the header, sidebar, and main dashboard area.
 */
export const JobDetailsSkeleton = () => {
  return (
    <div className="h-screen bg-slate-900 text-slate-200 font-sans flex flex-col overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="flex-none px-6 pt-6 pb-6 md:px-12 md:pt-8 md:pb-6 border-b border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3 w-full max-w-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Main Content Dashboard Grid Skeleton */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 lg:gap-8 w-full px-6 py-6 md:px-12 md:py-8">
          {/* Left Column Skeleton */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-w-0 overflow-y-auto pr-2">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm overflow-hidden flex-none">
               {/* Job Summary Skeleton */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                     {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                           <div className="flex items-center gap-3 w-full">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-2 flex-1">
                                 <Skeleton className="h-3 w-20" />
                                 <Skeleton className="h-4 w-32" />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            {/* Optional Download/Upload Skeleton */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm flex-none">
               <Skeleton className="h-6 w-40 mb-4" />
               <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
             <div className="flex-1 min-h-0 p-6 rounded-3xl bg-slate-900 border border-slate-700 backdrop-blur-sm flex flex-col gap-6 overflow-hidden">
                <div className="flex-none">
                   <Skeleton className="h-6 w-48 mb-6" />
                   {/* Charts Skeleton */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => (
                         <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 h-24 flex flex-col justify-center gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-6 w-10" />
                         </div>
                      ))}
                   </div>
                   <div className="mt-6">
                      <Skeleton className="h-64 w-full rounded-xl bg-slate-800/20" />
                   </div>
                </div>
                
                <div className="flex-1 min-h-0 pt-6 border-t border-slate-700 flex flex-col overflow-hidden">
                   <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                      {/* Findings List Skeleton */}
                      <div className="flex justify-between items-center mb-4">
                         <Skeleton className="h-6 w-24" />
                         <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex gap-4 mb-4">
                         <Skeleton className="h-8 w-24 rounded" />
                         <Skeleton className="h-8 w-24 rounded" />
                      </div>
                      {[1, 2, 3, 4, 5].map(i => (
                         <div key={i} className="p-4 rounded-lg bg-slate-800/20 border border-slate-700/50 flex justify-between items-center">
                            <div className="space-y-2">
                               <Skeleton className="h-4 w-48" />
                               <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded" />
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
