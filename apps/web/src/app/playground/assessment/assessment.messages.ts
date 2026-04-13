export const enAssessmentPageMessages = {
  "assessment.page.title": "Assessment",
  "assessment.page.register": "Register",
  "assessment.page.delete": "Delete",
  "assessment.page.searchPlaceholder": "Search...",
  "assessment.page.empty": "No assessment data found.",
} as const;

export const koAssessmentPageMessages: Record<
  keyof typeof enAssessmentPageMessages,
  string
> = {
  "assessment.page.title": "평가",
  "assessment.page.register": "등록",
  "assessment.page.delete": "삭제",
  "assessment.page.searchPlaceholder": "검색",
  "assessment.page.empty": "평가 데이터가 없습니다.",
};
