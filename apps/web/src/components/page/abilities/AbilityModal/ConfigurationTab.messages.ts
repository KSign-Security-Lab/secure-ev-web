export const enAbilityModalConfigurationTabMessages = {
  "abilities.configuration.notice": "The execution engine runs each ability once per step and keeps payloads on the target. These options aren't supported yet.",
  "abilities.configuration.singleton": "Singleton",
  "abilities.configuration.singletonDesc": "Run on only one agent per operation, even when several are targeted.",
  "abilities.configuration.repeatable": "Repeatable",
  "abilities.configuration.repeatableDesc": "Allow the ability to run more than once on the same agent in an operation.",
  "abilities.configuration.deletePayload": "Delete payload",
  "abilities.configuration.deletePayloadDesc": "Remove downloaded payload files from the target after the step finishes.",
} as const;

type AbilityModalConfigurationTabMessageKey = keyof typeof enAbilityModalConfigurationTabMessages;

export const koAbilityModalConfigurationTabMessages: Record<AbilityModalConfigurationTabMessageKey, string> = {
  "abilities.configuration.notice": "현재 실행 엔진은 단계마다 Ability를 한 번 실행하고 페이로드를 대상에 남겨 둡니다. 아래 옵션은 아직 지원되지 않습니다.",
  "abilities.configuration.singleton": "단일 에이전트 실행",
  "abilities.configuration.singletonDesc": "여러 에이전트를 대상으로 해도 공격 실행당 한 에이전트에서만 실행합니다.",
  "abilities.configuration.repeatable": "반복 실행 허용",
  "abilities.configuration.repeatableDesc": "한 번의 공격 실행에서 같은 에이전트에 두 번 이상 실행할 수 있습니다.",
  "abilities.configuration.deletePayload": "페이로드 삭제",
  "abilities.configuration.deletePayloadDesc": "단계가 끝나면 대상에 내려받은 페이로드 파일을 삭제합니다.",
};
