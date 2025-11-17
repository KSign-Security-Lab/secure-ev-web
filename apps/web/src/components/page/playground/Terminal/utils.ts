export function coerceToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof ArrayBuffer) return new TextDecoder().decode(value);
  if (Array.isArray(value))
    return value.map((v) => coerceToString(v)).join("\n");
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      // ignore
    }
  }
  return String(value ?? "");
}

export interface NormalizedMessage {
  lines: string[];
  meta: string[];
  raw: string;
}

/** Convert various WebSocket payloads to terminal-friendly lines. */
export function normalizeMessage(data: unknown): NormalizedMessage {
  const raw = coerceToString(data);
  if (!raw) return { lines: [], meta: [], raw: "" };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed === "object" && "response" in parsed) {
      const responseText = coerceToString(parsed.response);
      const lines: string[] = [];
      if (responseText)
        lines.push(...responseText.replace(/\r/g, "").split("\n"));
      const meta: string[] = [];
      if (typeof parsed.status !== "undefined")
        meta.push(`exit status: ${coerceToString(parsed.status)}`);
      if (typeof parsed.pwd !== "undefined")
        meta.push(`pwd: ${coerceToString(parsed.pwd)}`);
      if (typeof parsed.response_time !== "undefined")
        meta.push(`elapsed: ${coerceToString(parsed.response_time)}`);
      return { lines, meta, raw };
    }
  } catch {
    // not JSON, fall through
  }
  return { lines: raw.replace(/\r/g, "").split("\n"), meta: [], raw };
}
