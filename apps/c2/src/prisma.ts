import { PrismaClient } from "@secure-ev-web/prisma";

/**
 * Shared Prisma client. The C2 service and the web app talk to each other only
 * through these tables — the terminal queues AgentInstruction rows, the beacon
 * claims them and writes AgentResult rows back.
 */
const prisma = new PrismaClient();

export default prisma;
