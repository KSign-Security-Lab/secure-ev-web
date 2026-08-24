export const enAbilitiesPageMessages = {
  "abilities.page.title": "Abilities",
  "abilities.page.subtitle": "Manage and deploy security testing capabilities.",
  "abilities.page.register": "Register",
  "abilities.page.delete": "Delete",
  "abilities.page.empty": "No Data Available",
  "abilities.page.searchPlaceholder": "Search abilities...",
  "abilities.page.save": "Save",
} as const;

type AbilitiesPageMessageKey = keyof typeof enAbilitiesPageMessages;

export const koAbilitiesPageMessages: Record<AbilitiesPageMessageKey, string> = {
  "abilities.page.title": "어빌리티",
  "abilities.page.subtitle": "보안 테스트 어빌리티를 관리하고 배포하세요.",
  "abilities.page.register": "등록",
  "abilities.page.delete": "삭제",
  "abilities.page.empty": "데이터가 없습니다",
  "abilities.page.searchPlaceholder": "어빌리티 검색...",
  "abilities.page.save": "저장",
};
