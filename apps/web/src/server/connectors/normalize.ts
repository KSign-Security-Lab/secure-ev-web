/**
 * Turns one record pushed by a Fluent Bit agent into CollectedLog columns.
 *
 * Every field is optional in the input because each Fluent Bit input shapes
 * records differently; `raw` keeps the untouched original regardless.
 */
export type IngestRecord = Record<string, unknown>;

/**
 * When a tail input delivers a line that is itself a JSON object (Zeek writes
 * newline-delimited JSON), lift those fields to the top level so the rest of
 * the pipeline sees `ts`, `id.orig_h`, and so on directly. Agent-side parsing
 * would also do this, but it depends on a parsers file whose path varies by
 * install; doing it here works regardless. A non-JSON line (auditd, ufw) is
 * left untouched.
 */
export function flattenJsonLog(record: IngestRecord): IngestRecord {
  const line = record.log;
  if (typeof line !== "string") {
    return record;
  }
  const trimmed = line.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return record;
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      // Keep the agent-added envelope (source, collectedAt) but drop the now
      // redundant raw line; parsed fields win.
      const { log: _drop, ...envelope } = record;
      void _drop;
      return { ...envelope, ...parsed };
    }
  } catch {
    // Not JSON after all; fall through.
  }
  return record;
}

const MESSAGE_KEYS = ["message", "Message", "log", "msg"];
const MAX_MESSAGE = 4000;

/** Windows Event Log levels as sent by the winevtlog input. */
const WINDOWS_LEVELS: Record<number, string> = {
  0: "info", // LogAlways
  1: "critical",
  2: "error",
  3: "warning",
  4: "info",
  5: "debug", // Verbose
};

export function extractMessage(record: IngestRecord): string {
  for (const key of MESSAGE_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value.slice(0, MAX_MESSAGE);
    }
  }
  return JSON.stringify(record).slice(0, MAX_MESSAGE);
}

/** An auditd record line, e.g. `type=USER_AUTH msg=audit(1789606801.456:4522): ...`. */
const AUDIT_LINE = /^type=\S+ msg=audit\((\d+(?:\.\d+)?):\d+\)/;
/** A ufw kernel log line as written by rsyslog. */
const UFW_LINE = /\[UFW (BLOCK|ALLOW|AUDIT|LIMIT BLOCK)\]/;

/** The raw text a `tail` input delivers, if this record came from one. */
function lineOf(record: IngestRecord): string | null {
  return typeof record.log === "string" ? record.log : null;
}

export function extractSeverity(record: IngestRecord): string | null {
  for (const key of ["severity", "level", "Level"]) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value.slice(0, 32).toLowerCase();
    }
    // winevtlog sends Level as a number, which the string check alone missed.
    if (typeof value === "number" && value in WINDOWS_LEVELS) {
      return WINDOWS_LEVELS[value];
    }
  }

  // tail inputs carry no level field; read the verdict out of the line itself.
  const line = lineOf(record);
  if (line) {
    const ufw = line.match(UFW_LINE);
    if (ufw) {
      return ufw[1].endsWith("BLOCK") ? "warning" : "info";
    }
    if (AUDIT_LINE.test(line)) {
      return /\b(success=no|res=failed)\b/.test(line) ? "warning" : "info";
    }
  }
  return null;
}

/**
 * Which stream inside the integration a record came from. Prefer the tag the
 * generated config stamps on (`windows.firewall`), fall back to the Windows
 * channel for agents installed before that filter existed.
 */
export function extractSource(record: IngestRecord, fallback: string): string {
  for (const key of ["source", "Channel"]) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value.slice(0, 191);
    }
  }
  return fallback;
}

function toValidDate(value: Date): Date | null {
  return Number.isNaN(value.getTime()) ? null : value;
}

/**
 * When the event happened, not when it reached us.
 *
 * 1. `TimeCreated` — winevtlog, e.g. "2026-09-17 08:22:12 +0900"
 * 2. `ts`          — Zeek JSON logs, epoch seconds
 * 3. auditd line   — `msg=audit(1789606801.456:4522)`, epoch seconds
 * 4. syslog line   — leading RFC 3339 stamp, e.g. ufw.log under rsyslog's
 *    high-precision format. The traditional "Sep 17 09:00:00" form carries
 *    no year or zone, so it is deliberately left to the next fallback.
 * 5. `collectedAt` — Fluent Bit's own record time (Json_Date_Key, epoch
 *    seconds). This is when the agent read the event, so it can trail the
 *    real time by up to the input's Interval_Sec; still far closer than the
 *    server receive time, which also absorbs Flush delay and batching.
 */
export function extractOccurredAt(record: IngestRecord): Date | null {
  const created = record.TimeCreated;
  if (typeof created === "string") {
    const match = created.match(
      /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}(?:\.\d+)?) ([+-]\d{2})(\d{2})$/
    );
    if (match) {
      const [, date, time, hours, minutes] = match;
      const parsed = toValidDate(new Date(`${date}T${time}${hours}:${minutes}`));
      if (parsed) {
        return parsed;
      }
    }
  }

  const epochSeconds = (value: unknown): Date | null =>
    typeof value === "number" && Number.isFinite(value) && value > 0
      ? toValidDate(new Date(value * 1000))
      : null;

  const zeek = epochSeconds(record.ts);
  if (zeek) {
    return zeek;
  }

  const line = lineOf(record);
  if (line) {
    const audit = line.match(AUDIT_LINE);
    if (audit) {
      const parsed = epochSeconds(Number(audit[1]));
      if (parsed) {
        return parsed;
      }
    }
    const syslog = line.match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))\s/
    );
    if (syslog) {
      const parsed = toValidDate(new Date(syslog[1]));
      if (parsed) {
        return parsed;
      }
    }
  }

  return epochSeconds(record.collectedAt);
}
