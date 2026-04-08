export const enAbilitiesPageMessages = {
  "abilities.page.register": "Register",
  "abilities.page.delete": "Delete",
  "abilities.page.empty": "No Data Available",
} as const;

type AbilitiesPageMessageKey = keyof typeof enAbilitiesPageMessages;

export const koAbilitiesPageMessages: Record<AbilitiesPageMessageKey, string> = {
  "abilities.page.register": "등록",
  "abilities.page.delete": "삭제",
  "abilities.page.empty": "데이터가 없습니다",
};
