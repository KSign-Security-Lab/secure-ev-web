export const enAbilityModalConfigurationTabMessages = {
  "abilities.configuration.singleton": "Singleton:",
  "abilities.configuration.repeatable": "Repeatable:",
  "abilities.configuration.deletePayload": "Delete payload:",
} as const;

type AbilityModalConfigurationTabMessageKey = keyof typeof enAbilityModalConfigurationTabMessages;

export const koAbilityModalConfigurationTabMessages: Record<AbilityModalConfigurationTabMessageKey, string> = {
  "abilities.configuration.singleton": "싱글톤:",
  "abilities.configuration.repeatable": "반복 가능:",
  "abilities.configuration.deletePayload": "페이로드 삭제:",
};
