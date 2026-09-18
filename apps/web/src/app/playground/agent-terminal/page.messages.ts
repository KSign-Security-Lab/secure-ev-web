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
  "playground.page.log.cannotSend": "Cannot send command: the agent is not reachable.",
  "playground.page.warnNotConnected": "[warn] Could not queue the command for this agent.",
  "playground.page.warnNoSession": "[warn] Select an agent first.",
  "playground.page.log.commandTimeout":
    "[warn] No result within 90s. The agent may be offline or the command is still running.",
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
  "playground.page.log.cannotSend": "명령을 보낼 수 없습니다: 에이전트에 연결할 수 없습니다.",
  "playground.page.warnNotConnected": "[경고] 이 에이전트에 명령을 등록하지 못했습니다.",
  "playground.page.warnNoSession": "[경고] 먼저 에이전트를 선택하세요.",
  "playground.page.log.commandTimeout":
    "[경고] 90초 내에 결과가 없습니다. 에이전트가 오프라인이거나 명령이 아직 실행 중일 수 있습니다.",
};
