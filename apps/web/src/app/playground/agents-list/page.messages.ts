export const enAgentsPageMessages = {
  "agents.page.empty": "No Data Available",
} as const;

type AgentsPageMessageKey = keyof typeof enAgentsPageMessages;

export const koAgentsPageMessages: Record<AgentsPageMessageKey, string> = {
  "agents.page.empty": "데이터가 없습니다",
};
