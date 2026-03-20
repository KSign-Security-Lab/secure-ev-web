import { enAgentsPageMessages, koAgentsPageMessages } from "~/app/agents/page.messages";
import { enAgentsTableMessages, koAgentsTableMessages } from "~/components/page/agents/AgentsTable.messages";

export const enAgentsMessages = {
  ...enAgentsPageMessages,
  ...enAgentsTableMessages,
} as const;

type AgentsMessageKey = keyof typeof enAgentsMessages;

export const koAgentsMessages: Record<AgentsMessageKey, string> = {
  ...koAgentsPageMessages,
  ...koAgentsTableMessages,
};
