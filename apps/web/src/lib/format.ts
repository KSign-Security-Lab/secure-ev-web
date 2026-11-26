/**
 * Display-only formatting helpers shared across the console.
 * These never change stored values — they normalise how data is shown.
 */

export const EMPTY = "—";

const EMPTY_TOKENS = new Set(["", "-", "—", "없음", "n/a", "null", "undefined"]);

/** Returns the value, or the single em-dash placeholder when it is "empty". */
export function display(value: unknown): string {
  if (value === null || value === undefined) return EMPTY;
  const str = String(value).trim();
  return EMPTY_TOKENS.has(str.toLowerCase()) ? EMPTY : str;
}

const pad = (n: number) => String(n).padStart(2, "0");

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Global date format: `YYYY-MM-DD HH:mm` in local time. Date-only values
 * ("2026-04-10") are returned as-is — they carry no time, and parsing them
 * would invent one (UTC midnight shifted into the local zone).
 */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  if (typeof value === "string" && DATE_ONLY.test(value.trim())) return value.trim();
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return display(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `YYYY-MM-DD HH:mm:ss` in local time — for logs, where seconds matter. */
export function formatDateTimeSeconds(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return display(value);
  return `${formatDate(d)}:${pad(d.getSeconds())}`;
}

export const UNKNOWN_PLATFORM = "unknown";

const PLATFORM_LABELS: Record<string, string> = {
  windows: "Windows",
  linux: "Linux",
  darwin: "macOS",
  macos: "macOS",
  osx: "macOS",
  aws: "AWS",
  azure: "Azure",
  "azure ad": "Azure AD",
  gcp: "GCP",
  iaas: "IaaS",
  saas: "SaaS",
  paas: "PaaS",
  esxi: "ESXi",
  pre: "PRE",
  office: "Office",
  "office 365": "Office 365",
  "google workspace": "Google Workspace",
  "identity provider": "Identity Provider",
  "network devices": "Network Devices",
  kubernetes: "Kubernetes",
  containers: "Containers",
  unknown: UNKNOWN_PLATFORM,
};

const titleWords = (s: string) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** Splits composite values ("Linux,Darwin") into normalised labels. */
export function platformLabels(value: string | null | undefined): string[] {
  if (!value) return [];
  const out: string[] = [];
  for (const raw of value.split(/[,/|]+/)) {
    const key = raw.trim().toLowerCase();
    if (!key) continue;
    const label = PLATFORM_LABELS[key] ?? titleWords(raw.trim());
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

/** "Linux,Darwin" → "Linux, macOS"; "windows" → "Windows". */
export function platformLabel(value: string | null | undefined): string {
  const labels = platformLabels(value).filter((l) => l !== UNKNOWN_PLATFORM);
  return labels.length ? labels.join(", ") : EMPTY;
}

/** "Credential Access" / "credential_access" → "credential-access". */
export function tacticSlug(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Splits composite tactic fields ("Persistence, Privilege Escalation", "discovery/execution"). */
export function splitTactics(value: string | null | undefined): string[] {
  if (!value) return [];
  const out: string[] = [];
  for (const part of value.split(/[,/]/)) {
    const slug = tacticSlug(part);
    if (slug && !out.includes(slug)) out.push(slug);
  }
  return out;
}

export const TACTIC_KEYS = [
  "reconnaissance",
  "resource-development",
  "initial-access",
  "execution",
  "persistence",
  "privilege-escalation",
  "defense-evasion",
  "credential-access",
  "discovery",
  "lateral-movement",
  "collection",
  "command-and-control",
  "exfiltration",
  "impact",
] as const;

const titleCase = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => (w === "and" ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

/**
 * Human label for a tactic. `t` is the i18n function; it is looked up as
 * `tactic.<slug>` and falls back to Title Case for non-ATT&CK buckets.
 */
export function tacticLabel(
  value: string | null | undefined,
  t?: (key: string) => string
): string {
  const slugs = splitTactics(value);
  if (!slugs.length) return EMPTY;
  return slugs
    .map((slug) => {
      const key = `tactic.${slug}`;
      const translated = t?.(key);
      return translated && translated !== key ? translated : titleCase(slug);
    })
    .join(", ");
}

/** "T1059, T1059.004" → ["T1059", "T1059.004"] (deduped, order kept). */
export function splitTechniqueIds(value: string | null | undefined): string[] {
  if (!value) return [];
  const out: string[] = [];
  for (const part of value.split(/[,\s]+/)) {
    const id = part.trim().toUpperCase();
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

/** Parent technique ids, deduped: "T1059, T1059.004" → ["T1059"]. */
export function parentTechniqueIds(value: string | null | undefined): string[] {
  const out: string[] = [];
  for (const id of splitTechniqueIds(value)) {
    const parent = id.split(".")[0];
    if (parent && !out.includes(parent)) out.push(parent);
  }
  return out;
}

/** Unifies pattern ids: "CWE-121_foo" → "CWE121_foo". */
export function normalizePatternId(value: string | null | undefined): string {
  if (!value) return EMPTY;
  return value.replace(/^CWE-(\d+)/i, "CWE$1");
}
