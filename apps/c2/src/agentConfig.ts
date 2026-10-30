import prisma from "./prisma.js";
import type { AgentConfig } from "@secure-ev-web/prisma";

/**
 * The singleton AgentConfig row (id 1) holds the beacon timers the C2 applies
 * to new agents. The operator UI owns this row (it sets c2Url and the implant
 * name from the deploy modal); the C2 only reads the timers and the implant
 * name, and creates the row from schema defaults if it beacons before the UI
 * has ever written it.
 */
export function getAgentConfig(): Promise<AgentConfig> {
  return prisma.agentConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
