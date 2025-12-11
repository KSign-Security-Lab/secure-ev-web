import React from "react";
import clsx from "clsx";

interface JobStatusBadgeProps {
  status: string;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  return (
    <span
      className={clsx(
        "text-xs font-mono px-2 py-0.5 rounded uppercase",
        {
          "bg-blue-500/20 text-blue-300 animate-pulse": status === "RUNNING",
          "bg-green-500/20 text-green-300": status === "COMPLETED",
          "bg-red-500/20 text-red-300": status === "FAILED",
          "bg-yellow-500/20 text-yellow-300": status === "PENDING",
          "bg-slate-800 text-slate-400": !["RUNNING", "COMPLETED", "FAILED", "PENDING"].includes(status),
        }
      )}
    >
      {status}
    </span>
  );
}
