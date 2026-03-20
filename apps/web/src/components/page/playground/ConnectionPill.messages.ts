export const enPlaygroundConnectionPillMessages = {
  "playground.connection.connected": "connected",
  "playground.connection.connecting": "connecting",
  "playground.connection.disconnected": "disconnected",
  "playground.connection.error": "error",
} as const;

type PlaygroundConnectionPillMessageKey = keyof typeof enPlaygroundConnectionPillMessages;

export const koPlaygroundConnectionPillMessages: Record<PlaygroundConnectionPillMessageKey, string> = {
  "playground.connection.connected": "연결됨",
  "playground.connection.connecting": "연결 중",
  "playground.connection.disconnected": "연결 끊김",
  "playground.connection.error": "오류",
};
