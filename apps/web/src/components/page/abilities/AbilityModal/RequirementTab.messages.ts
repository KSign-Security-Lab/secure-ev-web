export const enAbilityModalRequirementTabMessages = {
  "abilities.requirement.title": "Fact Requirement Modules",
  "abilities.requirement.module": "Module",
  "abilities.requirement.source": "Source",
  "abilities.requirement.edge": "Edge",
  "abilities.requirement.targetOptional": "Target [optional]",
  "abilities.requirement.add": "Add",
  "abilities.requirement.delete": "Delete",
} as const;

type AbilityModalRequirementTabMessageKey = keyof typeof enAbilityModalRequirementTabMessages;

export const koAbilityModalRequirementTabMessages: Record<AbilityModalRequirementTabMessageKey, string> = {
  "abilities.requirement.title": "팩트 요구 모듈",
  "abilities.requirement.module": "모듈",
  "abilities.requirement.source": "소스",
  "abilities.requirement.edge": "엣지",
  "abilities.requirement.targetOptional": "대상 [선택]",
  "abilities.requirement.add": "추가",
  "abilities.requirement.delete": "삭제",
};
