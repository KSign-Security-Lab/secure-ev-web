export const enAbilityModalExecutorsTabMessages = {
  "abilities.executors.executorIndex": "Executor Index: {index}",
  "abilities.executors.command": "Command",
  "abilities.executors.timeout": "Timeout",
  "abilities.executors.cleanup": "Cleanup",
  "abilities.executors.payloadPlaceholder": "Enter content...",
} as const;

type AbilityModalExecutorsTabMessageKey = keyof typeof enAbilityModalExecutorsTabMessages;

export const koAbilityModalExecutorsTabMessages: Record<AbilityModalExecutorsTabMessageKey, string> = {
  "abilities.executors.executorIndex": "실행기 인덱스: {index}",
  "abilities.executors.command": "명령",
  "abilities.executors.timeout": "타임아웃",
  "abilities.executors.cleanup": "정리",
  "abilities.executors.payloadPlaceholder": "내용 입력...",
};
