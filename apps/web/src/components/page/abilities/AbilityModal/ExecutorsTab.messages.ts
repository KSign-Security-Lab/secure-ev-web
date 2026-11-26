export const enAbilityModalExecutorsTabMessages = {
  "abilities.executors.command": "Command",
  "abilities.executors.timeout": "Timeout",
  "abilities.executors.cleanup": "Cleanup",
  "abilities.executors.label": "Executor",
  "abilities.executors.option": "#{index} · {platform} · {shell}",
  "abilities.executors.platform": "Platform",
  "abilities.executors.shell": "Shell",
  "abilities.executors.payloads": "Payloads",
  "abilities.executors.noPayloads": "No payload files.",
  "abilities.executors.seconds": "{value}s",
  "abilities.executors.emptyTitle": "No executors",
  "abilities.executors.emptyDescription": "This ability has no command to run on an agent yet.",
} as const;

type AbilityModalExecutorsTabMessageKey = keyof typeof enAbilityModalExecutorsTabMessages;

export const koAbilityModalExecutorsTabMessages: Record<AbilityModalExecutorsTabMessageKey, string> = {
  "abilities.executors.command": "명령",
  "abilities.executors.timeout": "제한 시간",
  "abilities.executors.cleanup": "정리",
  "abilities.executors.label": "실행 환경",
  "abilities.executors.option": "#{index} · {platform} · {shell}",
  "abilities.executors.platform": "플랫폼",
  "abilities.executors.shell": "셸",
  "abilities.executors.payloads": "페이로드",
  "abilities.executors.noPayloads": "페이로드 파일 없음",
  "abilities.executors.seconds": "{value}초",
  "abilities.executors.emptyTitle": "등록된 실행 환경이 없습니다",
  "abilities.executors.emptyDescription": "이 Ability에는 에이전트에서 실행할 명령이 아직 없습니다.",
};
