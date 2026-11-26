export const enPlaygroundSystemLogPanelMessages = {
  "playground.systemLog.title": "System Log",
  "playground.systemLog.clear": "Clear",
  "playground.systemLog.collapse": "Collapse log",
  "playground.systemLog.expand": "Expand log",
  "playground.systemLog.noEvents": "No recent events",
  "playground.systemLog.noEventsDesc": "Connection and command events appear here once you select a session.",
} as const;

type PlaygroundSystemLogPanelMessageKey = keyof typeof enPlaygroundSystemLogPanelMessages;

export const koPlaygroundSystemLogPanelMessages: Record<PlaygroundSystemLogPanelMessageKey, string> = {
  "playground.systemLog.title": "시스템 로그",
  "playground.systemLog.clear": "지우기",
  "playground.systemLog.collapse": "로그 접기",
  "playground.systemLog.expand": "로그 펼치기",
  "playground.systemLog.noEvents": "최근 이벤트가 없습니다",
  "playground.systemLog.noEventsDesc": "세션을 선택하면 연결 및 명령 이벤트가 여기에 표시됩니다.",
};
