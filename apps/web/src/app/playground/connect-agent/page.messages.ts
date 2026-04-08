export const enPlaygroundPageMessages = {
  "playground.page.dynamic.statusLoading": "Status: loading",
  "playground.page.dynamic.loadingTerminal": "Loading terminal...",
  "playground.page.errorFetchSessions": "Failed to fetch sessions",
  "playground.page.log.connecting": "Connecting to session #{id}...",
  "playground.page.log.connected": "Connected to session #{id}.",
  "playground.page.log.connectionError": "Connection error.",
  "playground.page.log.connectionClosedReconnect": "Connection closed. Reconnecting...",
  "playground.page.log.connectionClosed": "Connection closed.",
  "playground.page.log.command": "Command: {command}",
  "playground.page.log.cannotSend": "Cannot send command: terminal is disconnected.",
  "playground.page.warnNotConnected": "[warn] Not connected. The terminal will automatically reconnect.",
} as const;

type PlaygroundPageMessageKey = keyof typeof enPlaygroundPageMessages;

export const koPlaygroundPageMessages: Record<PlaygroundPageMessageKey, string> = {
  "playground.page.dynamic.statusLoading": "상태: 로딩 중",
  "playground.page.dynamic.loadingTerminal": "터미널 로딩 중...",
  "playground.page.errorFetchSessions": "세션을 가져오지 못했습니다",
  "playground.page.log.connecting": "세션 #{id}에 연결 중...",
  "playground.page.log.connected": "세션 #{id}에 연결되었습니다.",
  "playground.page.log.connectionError": "연결 오류.",
  "playground.page.log.connectionClosedReconnect": "연결이 끊어졌습니다. 재연결 중...",
  "playground.page.log.connectionClosed": "연결이 종료되었습니다.",
  "playground.page.log.command": "명령: {command}",
  "playground.page.log.cannotSend": "명령을 보낼 수 없습니다: 터미널 연결이 끊겼습니다.",
  "playground.page.warnNotConnected": "[경고] 연결되지 않았습니다. 터미널이 자동으로 재연결됩니다.",
};
