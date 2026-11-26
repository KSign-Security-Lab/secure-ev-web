export const enAbilityModalMessages = {
  "abilities.modal.general": "General",
  "abilities.modal.executors": "Executors",
  "abilities.modal.requirement": "Requirement",
  "abilities.modal.configuration": "Configuration",
  "abilities.modal.save": "Save",
  "abilities.modal.cancel": "Cancel",
  "abilities.modal.runOnAgent": "Run on agent",
  "abilities.modal.saveFailed": "Could not save. Please try again.",
  "abilities.modal.saved": "Ability saved.",
  "abilities.create.title": "New ability",
  "abilities.create.namePlaceholder": "e.g. Collect OS version",
  "abilities.create.techniqueInvalid": "Use an ATT&CK technique ID such as T1082 or T1059.004.",
  "abilities.create.commandHint": "Use #{fact} placeholders for values captured at run time, e.g. #{host.ip}.",
  "abilities.create.saved": "Ability created.",
  "abilities.create.failed": "Could not create the ability.",
} as const;

type AbilityModalMessageKey = keyof typeof enAbilityModalMessages;

export const koAbilityModalMessages: Record<AbilityModalMessageKey, string> = {
  "abilities.modal.general": "일반",
  "abilities.modal.executors": "실행 환경",
  "abilities.modal.requirement": "요구사항",
  "abilities.modal.configuration": "설정",
  "abilities.modal.save": "저장",
  "abilities.modal.cancel": "취소",
  "abilities.modal.runOnAgent": "에이전트에서 실행",
  "abilities.modal.saveFailed": "저장하지 못했습니다. 다시 시도하세요.",
  "abilities.modal.saved": "Ability를 저장했습니다.",
  "abilities.create.title": "새 Ability",
  "abilities.create.namePlaceholder": "예: OS 버전 수집",
  "abilities.create.techniqueInvalid": "T1082, T1059.004 같은 ATT&CK 기법 ID를 입력하세요.",
  "abilities.create.commandHint": "실행 중 추출한 값은 #{fact} 변수로 넣으세요. 예: #{host.ip}",
  "abilities.create.saved": "Ability를 등록했습니다.",
  "abilities.create.failed": "Ability를 등록하지 못했습니다.",
};
