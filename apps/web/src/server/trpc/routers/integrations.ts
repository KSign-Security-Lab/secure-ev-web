import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { router, publicProcedure } from "../init";
import prisma from "~/lib/prisma";
import { ADAPTERS, getAdapter } from "~/server/connectors/registry";
import { buildInstallSteps } from "~/server/connectors/installScript";
import { ConnectorError } from "~/server/connectors/types";
import { generateSecureToken, hashToken } from "../utils/fuzzing";
import {
  adapterKeyInputSchema,
  collectedLogsResponseSchema,
  installScriptResponseSchema,
  integrationsListResponseSchema,
  syncResponseSchema,
  testConnectionResponseSchema,
  upsertIntegrationInputSchema,
} from "../schemas/integrations";

/** Show enough of a stored secret to recognise it, never enough to use it. */
function maskSecret(secret: string | null): string | null {
  if (!secret) {
    return null;
  }
  return `••••${secret.slice(-4)}`;
}

function toMessage(error: unknown): string {
  if (error instanceof ConnectorError || error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

function requireAdapter(adapterKey: string) {
  const adapter = getAdapter(adapterKey);
  if (!adapter) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Unknown adapter: ${adapterKey}`,
    });
  }
  return adapter;
}

async function requireConfigured(adapterKey: string) {
  const integration = await prisma.integration.findUnique({
    where: { adapterKey },
  });
  if (!integration) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: `${adapterKey} has not been configured yet`,
    });
  }
  return integration;
}

export const integrationsRouter = router({
  /**
   * Every supported product, configured or not, so the page always reports the
   * full supported count rather than only what happens to be connected.
   */
  list: publicProcedure
    .output(integrationsListResponseSchema)
    .query(async () => {
      const [configured, counts] = await Promise.all([
        prisma.integration.findMany(),
        prisma.collectedLog.groupBy({
          by: ["integrationId"],
          _count: { _all: true },
        }),
      ]);

      const byKey = new Map(configured.map((row) => [row.adapterKey, row]));
      const countById = new Map(
        counts.map((row) => [row.integrationId, row._count._all])
      );

      return ADAPTERS.map((adapter) => {
        const row = byKey.get(adapter.key);

        return {
          adapterKey: adapter.key,
          name: adapter.name,
          vendor: adapter.vendor,
          category: adapter.category,
          mode: row?.mode ?? adapter.supportedModes[0],
          supportedModes: adapter.supportedModes,
          status: row?.status ?? "PENDING",
          configured: Boolean(row),
          requiresBaseUrl: adapter.requiresBaseUrl,
          requiresSecret: adapter.requiresSecret,
          baseUrlExample: adapter.baseUrlExample ?? null,
          baseUrl: row?.baseUrl ?? null,
          secretMasked: maskSecret(row?.secret ?? null),
          insecureTls: row?.insecureTls ?? false,
          lastSyncAt: row?.lastSyncAt?.toISOString() ?? null,
          lastError: row?.lastError ?? null,
          collectedCount: row ? (countById.get(row.id) ?? 0) : 0,
        };
      });
    }),

  /** Create or update connection details for one product. */
  upsert: publicProcedure
    .input(upsertIntegrationInputSchema)
    .output(testConnectionResponseSchema)
    .mutation(async ({ input }) => {
      const adapter = requireAdapter(input.adapterKey);

      if (!adapter.supportedModes.includes(input.mode)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${adapter.name} cannot be reached over ${input.mode}`,
        });
      }

      // Endpoint and credentials only matter when polling the product's API.
      if (input.mode === "API" && adapter.requiresBaseUrl && !input.baseUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${adapter.name} requires an endpoint`,
        });
      }

      const existing = await prisma.integration.findUnique({
        where: { adapterKey: adapter.key },
      });

      if (
        input.mode === "API" &&
        adapter.requiresSecret &&
        !input.secret &&
        !existing?.secret
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${adapter.name} requires credentials`,
        });
      }

      await prisma.integration.upsert({
        where: { adapterKey: adapter.key },
        create: {
          adapterKey: adapter.key,
          name: adapter.name,
          vendor: adapter.vendor,
          category: adapter.category,
          mode: input.mode,
          baseUrl: input.baseUrl ?? null,
          secret: input.secret ?? null,
          insecureTls: input.insecureTls ?? false,
        },
        update: {
          mode: input.mode,
          // Omit a field to keep its stored value, so toggling one setting
          // (e.g. insecureTls) never wipes the endpoint or secret.
          ...(input.baseUrl === undefined ? {} : { baseUrl: input.baseUrl }),
          ...(input.secret ? { secret: input.secret } : {}),
          ...(input.insecureTls === undefined
            ? {}
            : { insecureTls: input.insecureTls }),
        },
      });

      return { ok: true, message: `${adapter.name} saved` };
    }),

  /** API mode: prove the product answers, and record the verdict. */
  testConnection: publicProcedure
    .input(adapterKeyInputSchema)
    .output(testConnectionResponseSchema)
    .mutation(async ({ input }) => {
      const adapter = requireAdapter(input.adapterKey);
      const integration = await requireConfigured(adapter.key);

      if (integration.mode !== "API" || !adapter.healthCheck) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${adapter.name} is set to agent collection and has no endpoint to test`,
        });
      }

      try {
        await adapter.healthCheck({
          baseUrl: integration.baseUrl,
          secret: integration.secret,
          insecureTls: integration.insecureTls,
        });
      } catch (error) {
        const message = toMessage(error);
        await prisma.integration.update({
          where: { id: integration.id },
          data: { status: "ERROR", lastError: message },
        });
        return { ok: false, message };
      }

      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "CONNECTED", lastError: null },
      });
      return { ok: true, message: `${adapter.name} responded normally` };
    }),

  /** API mode: pull the latest records and store them. */
  sync: publicProcedure
    .input(adapterKeyInputSchema)
    .output(syncResponseSchema)
    .mutation(async ({ input }) => {
      const adapter = requireAdapter(input.adapterKey);
      const integration = await requireConfigured(adapter.key);

      if (integration.mode !== "API" || !adapter.fetchLogs) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${adapter.name} pushes logs through the agent instead`,
        });
      }

      let logs;
      try {
        logs = await adapter.fetchLogs({
          baseUrl: integration.baseUrl,
          secret: integration.secret,
          insecureTls: integration.insecureTls,
        });
      } catch (error) {
        const message = toMessage(error);
        await prisma.integration.update({
          where: { id: integration.id },
          data: { status: "ERROR", lastError: message },
        });
        return { ok: false, collected: 0, message };
      }

      if (logs.length > 0) {
        await prisma.collectedLog.createMany({
          data: logs.map((log) => ({
            integrationId: integration.id,
            source: log.source,
            severity: log.severity,
            message: log.message,
            occurredAt: log.occurredAt ?? null,
            raw: log.raw as never,
          })),
        });
      }

      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          status: "CONNECTED",
          lastError: null,
          lastSyncAt: new Date(),
        },
      });

      return {
        ok: true,
        collected: logs.length,
        message: `Collected ${logs.length} records from ${adapter.name}`,
      };
    }),

  /**
   * AGENT mode: issue a fresh ingest token and render the install script the
   * operator runs on the target host. Only the hash is persisted, so calling
   * this again invalidates the previous script.
   */
  installScript: publicProcedure
    .input(adapterKeyInputSchema)
    .output(installScriptResponseSchema)
    .mutation(async ({ input }) => {
      const adapter = requireAdapter(input.adapterKey);

      if (!adapter.supportedModes.includes("AGENT") || !adapter.agentInputs) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${adapter.name} connects over its own API`,
        });
      }

      const token = generateSecureToken();
      const requestHeaders = await headers();
      const origin =
        requestHeaders.get("origin") ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:4200";
      const ingestUrl = new URL("/api/ingest", origin).toString();

      await prisma.integration.upsert({
        where: { adapterKey: adapter.key },
        create: {
          adapterKey: adapter.key,
          name: adapter.name,
          vendor: adapter.vendor,
          category: adapter.category,
          mode: "AGENT",
          ingestTokenHash: hashToken(token),
        },
        update: { mode: "AGENT", ingestTokenHash: hashToken(token) },
      });

      return {
        steps: buildInstallSteps(adapter, ingestUrl, token),
        ingestUrl,
        token,
      };
    }),

  /** Most recent records collected from one product. */
  logs: publicProcedure
    .input(adapterKeyInputSchema)
    .output(collectedLogsResponseSchema)
    .query(async ({ input }) => {
      const integration = await prisma.integration.findUnique({
        where: { adapterKey: input.adapterKey },
      });

      if (!integration) {
        return [];
      }

      // Agents deliver in batches and out of order, so order by when the event
      // happened. MySQL sorts NULL last under DESC, which keeps undated
      // records behind dated ones.
      const logs = await prisma.collectedLog.findMany({
        where: { integrationId: integration.id },
        orderBy: [{ occurredAt: "desc" }, { collectedAt: "desc" }],
        take: 100,
      });

      return logs.map((log) => ({
        id: log.id,
        source: log.source,
        severity: log.severity,
        message: log.message,
        occurredAt: log.occurredAt?.toISOString() ?? null,
        collectedAt: log.collectedAt.toISOString(),
        raw: log.raw,
      }));
    }),
});
