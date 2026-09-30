"use client";

import { useState } from "react";
import trpc from "~/lib/trpc";

type JsonValue = unknown;

export default function TrpcTest() {
  const [result, setResult] = useState<JsonValue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadAbilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trpc.abilities.list.query({ page: 1, pageSize: 5 });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trpc.agents.list.query();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 flex flex-col items-center space-y-4">
      <div className="space-x-4">
        <button
          onClick={handleLoadAbilities}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Test tRPC: Abilities"}
        </button>
        <button
          onClick={handleLoadAgents}
          className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded text-white font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Test tRPC: Agents"}
        </button>
      </div>
      {error && (
        <pre className="text-red-400 whitespace-pre-wrap break-all max-w-3xl">
          {error}
        </pre>
      )}
      {result !== null && (
        <pre className="text-neutral-100 bg-neutral-950 p-4 rounded max-w-3xl overflow-auto w-full">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
