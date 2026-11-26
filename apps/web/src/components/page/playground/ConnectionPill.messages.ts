export const enPlaygroundConnectionPillMessages = {
  "playground.connection.connected": "Session connected",
  "playground.connection.connecting": "Session connecting",
  "playground.connection.disconnected": "No session",
  "playground.connection.error": "Session error",
} as const;

type PlaygroundConnectionPillMessageKey = keyof typeof enPlaygroundConnectionPillMessages;

export const koPlaygroundConnectionPillMessages: Record<PlaygroundConnectionPillMessageKey, string> = {
  "playground.connection.connected": "세션 연결됨",
  "playground.connection.connecting": "세션 연결 중",
  "playground.connection.disconnected": "세션 미연결",
  "playground.connection.error": "세션 오류",
};
