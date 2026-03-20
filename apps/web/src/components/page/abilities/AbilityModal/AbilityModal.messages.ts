export const enAbilityModalMessages = {
  "abilities.modal.title": "Find atypical open ports",
  "abilities.modal.general": "General",
  "abilities.modal.executors": "Executors",
  "abilities.modal.requirement": "Requirement",
  "abilities.modal.configuration": "Configuration",
  "abilities.modal.save": "Save",
  "abilities.modal.cancel": "Cancel",
} as const;

type AbilityModalMessageKey = keyof typeof enAbilityModalMessages;

export const koAbilityModalMessages: Record<AbilityModalMessageKey, string> = {
  "abilities.modal.title": "비정상적인 열린 포트 찾기",
  "abilities.modal.general": "일반",
  "abilities.modal.executors": "실행기",
  "abilities.modal.requirement": "요구사항",
  "abilities.modal.configuration": "설정",
  "abilities.modal.save": "저장",
  "abilities.modal.cancel": "취소",
};
