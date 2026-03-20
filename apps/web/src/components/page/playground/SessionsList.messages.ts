export const enPlaygroundSessionsListMessages = {
  "playground.sessions.title": "Sessions",
  "playground.sessions.total": "{count} total",
  "playground.sessions.found": "{count} found",
  "playground.sessions.none": "No sessions",
  "playground.sessions.noMatches": "No matches",
} as const;

type PlaygroundSessionsListMessageKey = keyof typeof enPlaygroundSessionsListMessages;

export const koPlaygroundSessionsListMessages: Record<PlaygroundSessionsListMessageKey, string> = {
  "playground.sessions.title": "세션",
  "playground.sessions.total": "총 {count}개",
  "playground.sessions.found": "{count}개 찾음",
  "playground.sessions.none": "세션 없음",
  "playground.sessions.noMatches": "검색 결과 없음",
};
