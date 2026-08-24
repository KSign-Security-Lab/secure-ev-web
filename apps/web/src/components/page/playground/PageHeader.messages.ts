export const enPlaygroundPageHeaderMessages = {
  "playground.header.title": "Agent Terminal",
  "playground.header.subtitle": "Browse active sessions and interact with a live terminal.",
  "playground.header.sessionSelected": "Session #{id}",
  "playground.header.noSessionSelected": "No session selected",
  "playground.header.refreshSessions": "Refresh sessions list",
} as const;

type PlaygroundPageHeaderMessageKey = keyof typeof enPlaygroundPageHeaderMessages;

export const koPlaygroundPageHeaderMessages: Record<PlaygroundPageHeaderMessageKey, string> = {
  "playground.header.title": "에이전트 터미널",
  "playground.header.subtitle": "활성 세션을 탐색하고 라이브 터미널과 상호작용하세요.",
  "playground.header.sessionSelected": "세션 #{id}",
  "playground.header.noSessionSelected": "선택된 세션 없음",
  "playground.header.refreshSessions": "세션 목록 새로고침",
};
