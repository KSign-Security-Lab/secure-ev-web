export const enAbilitiesPageMessages = {
  "abilities.page.title": "Abilities",
  "abilities.page.subtitle": "Manage and deploy security testing capabilities.",
  "abilities.page.register": "Register",
  "abilities.page.delete": "Delete",
  "abilities.page.empty": "No Data Available",
  "abilities.page.searchPlaceholder": "Search abilities...",
  "abilities.page.save": "Save",
  "abilities.page.deleteCount": "Delete ({count})",
  "abilities.page.deleted": "Deleted {count} abilities.",
  "abilities.page.deleteFailed": "Could not delete the selected abilities.",
  "abilities.page.deleteConfirmTitle": "Delete {count} abilities?",
  "abilities.page.deleteConfirmDesc": "This removes them from the library. Re-seed to restore the defaults.",
} as const;

type AbilitiesPageMessageKey = keyof typeof enAbilitiesPageMessages;

export const koAbilitiesPageMessages: Record<AbilitiesPageMessageKey, string> = {
  "abilities.page.title": "Ability",
  "abilities.page.subtitle": "보안 테스트용 Ability를 관리하고 배포하세요.",
  "abilities.page.register": "등록",
  "abilities.page.delete": "삭제",
  "abilities.page.empty": "데이터가 없습니다",
  "abilities.page.searchPlaceholder": "Ability 검색...",
  "abilities.page.save": "저장",
  "abilities.page.deleteCount": "삭제 ({count})",
  "abilities.page.deleted": "Ability {count}개를 삭제했습니다.",
  "abilities.page.deleteFailed": "선택한 Ability를 삭제하지 못했습니다.",
  "abilities.page.deleteConfirmTitle": "Ability {count}개를 삭제할까요?",
  "abilities.page.deleteConfirmDesc": "라이브러리에서 삭제됩니다. 기본 Ability는 시드 데이터를 다시 넣으면 복원됩니다.",
};
