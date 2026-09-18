import prisma from "~/lib/prisma";
import { env } from "~/config/env";
import type { AgentConfig } from "@secure-ev-web/prisma";

/** The agent config is a single row; create it on first read. */
export async function getAgentConfig(): Promise<AgentConfig> {
  const existing = await prisma.agentConfig.findUnique({ where: { id: 1 } });
  if (existing) return existing;

  return prisma.agentConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      c2Url: env.C2_PUBLIC_URL,
    },
  });
}
