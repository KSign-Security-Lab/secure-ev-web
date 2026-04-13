export const enAssessmentPageMessages = {
  "assessment.page.title": "Attack Assessment",
  "assessment.page.subtitle": "Evaluate defense performance and security of charging infrastructure",
  "assessment.page.register": "Register",
  "assessment.page.delete": "Delete",
  "assessment.page.searchPlaceholder": "Search assessment items...",
  "assessment.page.empty": "No assessment data found.",
} as const;

export const koAssessmentPageMessages: Record<
  keyof typeof enAssessmentPageMessages,
  string
> = {
  "assessment.page.title": "공격 평가",
  "assessment.page.subtitle": "충전 인프라의 방어 성능 및 보안성 평가 관리",
  "assessment.page.register": "등록",
  "assessment.page.delete": "삭제",
  "assessment.page.searchPlaceholder": "평가 항목 검색...",
  "assessment.page.empty": "평가 데이터가 없습니다.",
};
