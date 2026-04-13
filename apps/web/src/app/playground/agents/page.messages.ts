export const enAgentsPageMessages = {
  "agents.page.title": "Connect Agents",
  "agents.page.subtitle": "Active agents connected to the bridge",
  "agents.page.empty": "No Data Available",
} as const;

type AgentsPageMessageKey = keyof typeof enAgentsPageMessages;

export const koAgentsPageMessages: Record<AgentsPageMessageKey, string> = {
  "agents.page.title": "연결된 에이전트",
  "agents.page.subtitle": "브릿지에 연결된 활성 에이전트 목록",
  "agents.page.empty": "데이터가 없습니다",
};
