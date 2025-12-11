import type { FuzzingRun } from "~/types/fuzzing";

export interface FuzzingRunStats {
  total: number;
  ok: number;
  crashes: number; // result === 'error'
  timeouts: number; // result === 'timeout'
}

export interface AnalyzedFuzzingReport {
  stats: FuzzingRunStats;
  failures: FuzzingRun[];
}

/**
 * Analyzes a list of fuzzing runs to produce statistics and identify failures.
 */
export function analyzeRuns(runs: FuzzingRun[] = []): AnalyzedFuzzingReport {
  const stats: FuzzingRunStats = {
    total: runs.length,
    ok: 0,
    crashes: 0,
    timeouts: 0,
  };

  const failures: FuzzingRun[] = [];

  runs.forEach((run) => {
    switch (run.result) {
      case "ok":
        stats.ok++;
        break;
      case "error":
        stats.crashes++;
        failures.push(run);
        break;
      case "timeout":
        stats.timeouts++;
        failures.push(run);
        break;
    }
  });

  return {
    stats,
    failures,
  };
}

/**
 * Get display color for a run result
 */
export function getRunResultColor(result: FuzzingRun["result"]): "green" | "red" | "yellow" {
  switch (result) {
    case "ok":
      return "green";
    case "error":
      return "red";
    case "timeout":
      return "yellow";
  }
}

/**
 * Get display label for a run result
 */
export function getRunResultLabel(result: FuzzingRun["result"]): string {
  switch (result) {
    case "ok":
      return "OK";
    case "error":
      return "Error";
    case "timeout":
      return "Timeout";
  }
}
