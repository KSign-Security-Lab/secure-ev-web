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

/**
 * Robustly pretty-prints JSON-like strings (including those with huge numbers or Python-style formatting)
 * without losing precision or failing on loose syntax.
 */
export function formatJsonLike(input: string): string {
  if (!input) return "";
  
  // Try standard JSON parse first if it doesn't contain potentially large numbers
  // This helps with standard escaping. But if we see long digit sequences, skip it.
  const hasBigNumbers = /\d{16,}/.test(input);
  if (!hasBigNumbers) {
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Fallback to manual formatting
    }
  }

  let formatted = "";
  let indentLevel = 0;
  let inString = false;
  let quoteChar = "";
  let isEscaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inString) {
      formatted += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === quoteChar) {
        inString = false;
      }
    } else {
      if (/\s/.test(char)) continue;

      if (char === '"' || char === "'") {
        inString = true;
        quoteChar = char;
        formatted += char;
      } else if (char === "{" || char === "[") {
        indentLevel++;
        formatted += char + "\n" + "  ".repeat(indentLevel);
      } else if (char === "}" || char === "]") {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += "\n" + "  ".repeat(indentLevel) + char;
      } else if (char === ",") {
        formatted += char + "\n" + "  ".repeat(indentLevel);
      } else {
        formatted += char;
      }
    }
  }

  return formatted;
}
