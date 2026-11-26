export const enAbilityModalGeneralTabMessages = {
  "abilities.general.abilityId": "Ability ID",
  "abilities.general.name": "Name",
  "abilities.general.description": "Description",
  "abilities.general.state": "State",
  "abilities.general.relatedThreatGroup": "Related Threat Group",
  "abilities.general.relatedCve": "Related CVE",
  "abilities.general.placeholderName": "Name",
  "abilities.general.placeholderContent": "Enter content...",
  "abilities.general.techniqueId": "ATT&CK Technique ID",
  "abilities.general.status.active": "Active",
  "abilities.general.status.disabled": "Disabled",
  "abilities.general.placeholderThreatGroup": "Type a group (e.g. APT29) and press Enter",
  "abilities.general.placeholderCve": "Type a CVE (e.g. CVE-2021-44228) and press Enter",
  "abilities.general.invalidCve": "Use the CVE-YYYY-NNNN format.",
  "abilities.general.removeTag": "Remove {value}",
} as const;

type AbilityModalGeneralTabMessageKey = keyof typeof enAbilityModalGeneralTabMessages;

export const koAbilityModalGeneralTabMessages: Record<AbilityModalGeneralTabMessageKey, string> = {
  "abilities.general.abilityId": "Ability ID",
  "abilities.general.name": "이름",
  "abilities.general.description": "설명",
  "abilities.general.state": "상태",
  "abilities.general.relatedThreatGroup": "관련 위협 그룹",
  "abilities.general.relatedCve": "관련 CVE",
  "abilities.general.placeholderName": "이름",
  "abilities.general.placeholderContent": "내용 입력...",
  "abilities.general.techniqueId": "ATT&CK 기법 ID",
  "abilities.general.status.active": "활성",
  "abilities.general.status.disabled": "비활성",
  "abilities.general.placeholderThreatGroup": "그룹명 입력 후 Enter (예: APT29)",
  "abilities.general.placeholderCve": "CVE 입력 후 Enter (예: CVE-2021-44228)",
  "abilities.general.invalidCve": "CVE-YYYY-NNNN 형식으로 입력하세요.",
  "abilities.general.removeTag": "{value} 삭제",
};
