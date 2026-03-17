"use client";

import { useState, useEffect } from "react";
import Loading from "~/components/common/Loading/Loading";
import { AgentsTable } from "~/components/page/agents/AgentsTable";
import trpc, { type RouterOutputs } from "~/lib/trpc";

export type AgentsListResponse = RouterOutputs["agents"]["list"];

export default function Abilities() {
  const [data, setData] = useState<AgentsListResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await trpc.agents.list.query();

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setData(undefined);
        }
      } finally {
        if (!cancelled) {
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col w-full bg-base-900 p-8 rounded-xl">
      {/* Main Content */}
      <div className="mt-4 flex flex-col space-y-6 min-h-[700px]">
        {isLoading ? (
          <Loading />
        ) : data ? (
          <AgentsTable data={data} />
        ) : (
          <div className="text-center text-gray-400 py-8">
            No Data Available
          </div>
        )}
      </div>
    </div>
  );
}
