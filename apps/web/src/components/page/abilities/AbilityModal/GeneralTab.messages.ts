export const enAbilityModalGeneralTabMessages = {
  "abilities.general.abilityId": "Ability ID",
  "abilities.general.abilityUid": "Ability UID",
  "abilities.general.name": "Name",
  "abilities.general.description": "Description",
  "abilities.general.state": "State",
  "abilities.general.relatedThreatGroup": "Related Threat Group",
  "abilities.general.relatedCve": "Related CVE",
  "abilities.general.placeholderId": "ID",
  "abilities.general.placeholderUid": "UID",
  "abilities.general.placeholderName": "Name",
  "abilities.general.placeholderContent": "Enter content...",
  "abilities.general.placeholderZip": "Please provide a valid zip.",
} as const;

type AbilityModalGeneralTabMessageKey = keyof typeof enAbilityModalGeneralTabMessages;

export const koAbilityModalGeneralTabMessages: Record<AbilityModalGeneralTabMessageKey, string> = {
  "abilities.general.abilityId": "능력 ID",
  "abilities.general.abilityUid": "능력 UID",
  "abilities.general.name": "이름",
  "abilities.general.description": "설명",
  "abilities.general.state": "상태",
  "abilities.general.relatedThreatGroup": "관련 위협 그룹",
  "abilities.general.relatedCve": "관련 CVE",
  "abilities.general.placeholderId": "ID",
  "abilities.general.placeholderUid": "UID",
  "abilities.general.placeholderName": "이름",
  "abilities.general.placeholderContent": "내용 입력...",
  "abilities.general.placeholderZip": "유효한 zip을 입력하세요.",
};
