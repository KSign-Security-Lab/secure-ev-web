import type { RouterOutputs } from "~/lib/trpc";

export interface AttackExecutor {
  platform: string;
  shell?: string;
  payloads: string[];
  command: string;
  timeout: number;
  cleanup: number;
}

export type AttackDataItem = RouterOutputs["abilities"]["list"]["abilities"][number] & {
  executors?: AttackExecutor[];
};
