import type {
  IntegrationCategory,
  IntegrationMode,
} from "@secure-ev-web/prisma";

/**
 * Connection details a configured integration hands to its adapter.
 */
export interface ConnectorContext {
  baseUrl: string | null;
  secret: string | null;
  /**
   * Accept a self-signed / untrusted TLS certificate. Security products such
   * as Wazuh ship one by default on their API port, so a real deployment needs
   * this even though it must stay opt-in per integration.
   */
  insecureTls?: boolean;
}

/**
 * A single normalized record pulled from (or pushed by) an integrated product.
 */
export interface FetchedLog {
  source: string;
  severity: string | null;
  message: string;
  /** When the product says the event happened, if it says. */
  occurredAt?: Date | null;
  raw: unknown;
}

/**
 * Static description of a supported product plus its transport implementation.
 *
 * Adapters reachable over API implement healthCheck/fetchLogs. Adapters
 * reachable by agent declare agentInputs, which become the Fluent Bit install
 * script, and receive records through /api/ingest. An adapter may do both.
 */
export interface ConnectorAdapter {
  key: string;
  name: string;
  vendor: string;
  category: IntegrationCategory;
  /**
   * How this product can be reached, in preference order. Most products offer
   * exactly one route — Zeek and auditd expose no API, VirusTotal writes no
   * local logs — so the operator only gets a choice where both really work.
   */
  supportedModes: IntegrationMode[];
  /** Shown in the connect form; AGENT adapters need neither. */
  requiresBaseUrl: boolean;
  requiresSecret: boolean;
  /** Placeholder shown under the endpoint field. */
  baseUrlExample?: string;
  /** API mode: throws with a readable message when the product is unreachable. */
  healthCheck?: (ctx: ConnectorContext) => Promise<void>;
  /** API mode: pulls the most recent records. */
  fetchLogs?: (ctx: ConnectorContext) => Promise<FetchedLog[]>;
  /** AGENT mode: Fluent Bit inputs rendered into the install script. */
  agentInputs?: AgentInput[];
}

/**
 * One Fluent Bit input stanza.
 *
 * Windows channels use `winevtlog`, not the older `winlog`: winlog reads the
 * legacy Event Logging API and silently returns the Application log when given
 * a modern channel name containing a slash, which looks like success while
 * collecting the wrong events.
 */
export interface AgentInput {
  type: "tail" | "winevtlog";
  /** File glob for `tail`, comma-separated channel list for `winevtlog`. */
  target: string;
  tag: string;
  /** Offset database, so a restart does not re-collect everything. */
  dbPath?: string;
  /**
   * Parse each tail line as JSON so its fields land at the top level. Zeek
   * writes one JSON object per line; without this the whole object arrives as
   * an opaque `log` string and its `ts` never reaches occurredAt.
   */
  parser?: "json";
}

/**
 * Adapters signal an unreachable product with this so the router can store
 * the message on the integration row instead of leaking a stack trace.
 */
export class ConnectorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectorError";
  }
}

/**
 * Shared fetch wrapper: applies a timeout and normalizes transport failures.
 *
 * `insecure` accepts an untrusted TLS certificate. The global fetch cannot be
 * told to per request (its dispatcher is not reachable here), so those go
 * through node:https instead and come back as a real Response.
 */
export async function connectorFetch(
  url: string,
  init: RequestInit & { timeoutMs?: number; insecure?: boolean } = {}
): Promise<Response> {
  const { timeoutMs = 10_000, insecure = false, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (insecure && new URL(url).protocol === "https:") {
      return await insecureHttpsFetch(url, rest, controller.signal);
    }
    return await fetch(url, { ...rest, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ConnectorError(`Request timed out after ${timeoutMs}ms`);
    }
    // Node wraps transport failures as a bare "fetch failed"; the cause holds
    // the part an operator can act on (ECONNREFUSED, certificate errors, DNS).
    const cause = error instanceof Error ? error.cause : undefined;
    const detail =
      cause instanceof Error
        ? cause.message
        : typeof cause === "string"
          ? cause
          : undefined;
    const message = error instanceof Error ? error.message : "Request failed";
    throw new ConnectorError(detail ? `${message}: ${detail}` : message);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * A minimal HTTPS fetch that does not verify the server certificate, used only
 * when an integration opts in. Returns a genuine Response so callers see the
 * same shape as the trusted path.
 */
async function insecureHttpsFetch(
  url: string,
  init: RequestInit,
  signal: AbortSignal
): Promise<Response> {
  const { request } = await import("node:https");

  return new Promise<Response>((resolve, reject) => {
    const headers: Record<string, string> = {};
    new Headers(init.headers).forEach((value, key) => {
      headers[key] = value;
    });

    const req = request(
      url,
      {
        method: init.method ?? "GET",
        headers,
        rejectUnauthorized: false,
        signal,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk as Buffer));
        res.on("end", () => {
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode ?? 502,
              statusText: res.statusMessage ?? "",
            })
          );
        });
      }
    );

    req.on("error", reject);
    if (typeof init.body === "string") {
      req.write(init.body);
    }
    req.end();
  });
}
