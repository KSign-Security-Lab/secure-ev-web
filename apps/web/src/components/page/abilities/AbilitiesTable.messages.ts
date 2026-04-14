export const enAbilitiesTableMessages = {
  "abilities.table.abilityName": "Ability Name",
  "abilities.table.tactics": "Tactics",
  "abilities.table.techniqueId": "Technique ID",
  "abilities.table.techniqueName": "Technique Name",
  "abilities.table.type": "Type",
} as const;

type AbilitiesTableMessageKey = keyof typeof enAbilitiesTableMessages;

export const koAbilitiesTableMessages: Record<AbilitiesTableMessageKey, string> = {
  "abilities.table.abilityName": "어빌리티 이름",
  "abilities.table.tactics": "전술",
  "abilities.table.techniqueId": "기법 ID",
  "abilities.table.techniqueName": "기법 이름",
  "abilities.table.type": "유형",
};
