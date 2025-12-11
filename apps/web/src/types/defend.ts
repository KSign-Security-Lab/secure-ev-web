import { Ability } from "~/prisma";

export interface AttackExecutor {
  platform: string;
  payloads: string[];
  command: string;
  timeout: number;
  cleanup: number;
}

export interface AttackDataItem extends Omit<Ability, "createdAt" | "updatedAt"> {
  createdAt: string | Date;
  updatedAt: string | Date;
  executors?: AttackExecutor[];
}
