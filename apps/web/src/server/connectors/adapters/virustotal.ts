import {
  ConnectorError,
  connectorFetch,
  type ConnectorAdapter,
  type ConnectorContext,
  type FetchedLog,
} from "../types";

const DEFAULT_BASE_URL = "https://www.virustotal.com";

/**
 * SHA-256 of the 68-byte EICAR test string. Every engine knows it, so the
 * lookup returns a full multi-engine verdict without touching real malware,
 * and it is the same signature the Windows Defender integration detects.
 */
const EICAR_SHA256 =
  "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f";

/** Engine verdicts mapped onto the platform's severity scale. */
const CATEGORY_SEVERITY: Record<string, string> = {
  malicious: "critical",
  suspicious: "warning",
  undetected: "info",
  harmless: "info",
};

interface EngineResult {
  category?: string;
  engine_name?: string;
  engine_version?: string;
  engine_update?: string;
  method?: string;
  result?: string | null;
}

async function getFileReport(ctx: ConnectorContext, sha256: string) {
  if (!ctx.secret) {
    throw new ConnectorError("VirusTotal requires an API key");
  }

  const endpoint = new URL(`/api/v3/files/${sha256}`, ctx.baseUrl || DEFAULT_BASE_URL);
  const response = await connectorFetch(endpoint.toString(), {
    headers: { "x-apikey": ctx.secret },
  });

  if (!response.ok) {
    // VirusTotal names the failure (WrongCredentialsError, QuotaExceededError,
    // ...) in the body, which says far more than the status code.
    const body = await response.json().catch(() => null);
    const code = body?.error?.code ?? response.statusText;
    const message = body?.error?.message;
    throw new ConnectorError(
      `${response.status} ${code}${message ? `: ${message}` : ""}`
    );
  }

  const body = await response.json();
  const attributes = body?.data?.attributes;
  if (!attributes) {
    throw new ConnectorError("File report response had no attributes");
  }
  return attributes;
}

export const virustotalAdapter: ConnectorAdapter = {
  key: "virustotal",
  name: "VirusTotal",
  vendor: "Google",
  category: "INTEL",
  supportedModes: ["API"],
  requiresBaseUrl: false,
  requiresSecret: true,
  baseUrlExample: DEFAULT_BASE_URL,

  // The public API allows 4 requests a minute; a test plus a sync spends two.
  async healthCheck(ctx) {
    await getFileReport(ctx, EICAR_SHA256);
  },

  async fetchLogs(ctx) {
    const attributes = await getFileReport(ctx, EICAR_SHA256);

    const analyzedAt =
      typeof attributes.last_analysis_date === "number"
        ? new Date(attributes.last_analysis_date * 1000)
        : null;
    const stats = attributes.last_analysis_stats ?? {};
    const results: Record<string, EngineResult> =
      attributes.last_analysis_results ?? {};
    const engines = Object.values(results);
    const name = attributes.meaningful_name ?? EICAR_SHA256;

    const summary: FetchedLog = {
      source: "virustotal/files",
      severity: (stats.malicious ?? 0) > 0 ? "critical" : "info",
      message: `${name}: ${stats.malicious ?? 0}/${engines.length} engines flagged malicious (sha256 ${EICAR_SHA256})`,
      occurredAt: analyzedAt,
      raw: {
        sha256: EICAR_SHA256,
        meaningful_name: attributes.meaningful_name,
        type_description: attributes.type_description,
        size: attributes.size,
        last_analysis_date: attributes.last_analysis_date,
        last_analysis_stats: stats,
      },
    };

    const perEngine = engines.map<FetchedLog>((engine) => ({
      source: "virustotal/engines",
      severity: CATEGORY_SEVERITY[engine.category ?? ""] ?? "debug",
      message: `${engine.engine_name ?? "unknown"}: ${engine.result ?? engine.category ?? "no verdict"}`,
      occurredAt: analyzedAt,
      raw: { sha256: EICAR_SHA256, ...engine },
    }));

    return [summary, ...perEngine];
  },
};
