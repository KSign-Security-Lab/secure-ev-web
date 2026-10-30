/**
 * Executor resolution — which shell on the agent runs a given command.
 *
 * This is the single home for the logic that used to be duplicated in the two
 * `protocol.ts` copies. The agent reports the executors it supports (`psh`,
 * `cmd`, `sh`, `bash`, `proc`, ...); an ability declares which it was written
 * for in its `shell_type` field (which may list several, e.g. "psh,pwsh").
 */

/** Default executor for a platform, used when tasking from the terminal. */
export function defaultExecutor(platform: string, executors: string[]): string {
  const preferred = platform === "windows" ? ["psh", "cmd"] : ["sh", "bash"];
  return preferred.find((name) => executors.includes(name)) ?? executors[0] ?? "sh";
}

/** Split an ability `shell_type` ("psh, pwsh") into individual executor names. */
export function parseShellTypes(shellType: string): string[] {
  return shellType
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

/**
 * Pick the executor to task an ability with on a given agent: the first of the
 * ability's declared executors the agent actually supports. Returns null when
 * the agent supports none of them — the step cannot run there.
 */
export function resolveExecutor(shellType: string, agentExecutors: string[]): string | null {
  const wanted = parseShellTypes(shellType);
  for (const name of wanted) {
    if (agentExecutors.includes(name)) return name;
  }
  // `pwsh` and `psh` are both PowerShell; accept one for the other.
  if (wanted.includes("pwsh") && agentExecutors.includes("psh")) return "psh";
  if (wanted.includes("psh") && agentExecutors.includes("pwsh")) return "pwsh";
  return null;
}
