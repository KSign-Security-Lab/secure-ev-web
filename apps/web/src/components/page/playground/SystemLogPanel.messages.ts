export const enPlaygroundSystemLogPanelMessages = {
  "playground.systemLog.title": "System Log",
  "playground.systemLog.clear": "Clear",
  "playground.systemLog.noEvents": "No recent events.",
} as const;

type PlaygroundSystemLogPanelMessageKey = keyof typeof enPlaygroundSystemLogPanelMessages;

export const koPlaygroundSystemLogPanelMessages: Record<PlaygroundSystemLogPanelMessageKey, string> = {
  "playground.systemLog.title": "시스템 로그",
  "playground.systemLog.clear": "지우기",
  "playground.systemLog.noEvents": "최근 이벤트가 없습니다.",
};
