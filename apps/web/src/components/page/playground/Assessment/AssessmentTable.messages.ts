export const enAssessmentTableMessages = {
  "assessment.table.name": "Name",
  "assessment.table.target": "Assessment Target",
  "assessment.table.attackCount": "Registered Attacks",
  "assessment.table.repeatCount": "Repeat Count",
  "assessment.table.lastDate": "Last Execution Date",
  "assessment.table.notYet": "Not yet",
} as const;

export const koAssessmentTableMessages: Record<
  keyof typeof enAssessmentTableMessages,
  string
> = {
  "assessment.table.name": "이름",
  "assessment.table.target": "평가 대상",
  "assessment.table.attackCount": "등록 공격 수",
  "assessment.table.repeatCount": "반복 횟수",
  "assessment.table.lastDate": "최종 수행 날짜",
  "assessment.table.notYet": "미수행",
};
