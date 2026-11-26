export const enAbilityModalRequirementTabMessages = {
  "abilities.requirement.facts": "Facts used by the command",
  "abilities.requirement.factsEmpty": "This command has no #{fact} placeholders.",
  "abilities.requirement.derived": "Provided by the agent",
  "abilities.requirement.required": "Enter or capture before running",
  "abilities.requirement.payloads": "Payload files",
  "abilities.requirement.payloadsEmpty": "This ability downloads no payload files.",
  "abilities.requirement.available": "On the C2",
  "abilities.requirement.missing": "Missing on the C2",
  "abilities.requirement.unknown": "C2 unreachable",
  "abilities.requirement.loading": "Checking requirements…",
  "abilities.requirement.failed": "Could not check the requirements.",
} as const;

type AbilityModalRequirementTabMessageKey = keyof typeof enAbilityModalRequirementTabMessages;

export const koAbilityModalRequirementTabMessages: Record<AbilityModalRequirementTabMessageKey, string> = {
  "abilities.requirement.facts": "명령에 쓰이는 변수",
  "abilities.requirement.factsEmpty": "이 명령에는 #{fact} 변수가 없습니다.",
  "abilities.requirement.derived": "에이전트가 자동 제공",
  "abilities.requirement.required": "실행 전 입력 또는 추출 필요",
  "abilities.requirement.payloads": "페이로드 파일",
  "abilities.requirement.payloadsEmpty": "이 Ability는 내려받는 페이로드 파일이 없습니다.",
  "abilities.requirement.available": "C2에 있음",
  "abilities.requirement.missing": "C2에 없음",
  "abilities.requirement.unknown": "C2 연결 불가",
  "abilities.requirement.loading": "요구사항 확인 중…",
  "abilities.requirement.failed": "요구사항을 확인하지 못했습니다.",
};
