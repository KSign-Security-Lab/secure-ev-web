export const enFuzzingFindingsListMessages = {
  "fuzzing.findings.title": "Interaction Log",
  "fuzzing.findings.showing": "Showing {filtered} of {total} interactions",
  "fuzzing.findings.filterResult": "Filter by Result",
  "fuzzing.findings.allResults": "All Results",
} as const;

type FuzzingFindingsListMessageKey = keyof typeof enFuzzingFindingsListMessages;

export const koFuzzingFindingsListMessages: Record<FuzzingFindingsListMessageKey, string> = {
  "fuzzing.findings.title": "상호작용 로그",
  "fuzzing.findings.showing": "상호작용 {total}개 중 {filtered}개 표시",
  "fuzzing.findings.filterResult": "결과별 필터",
  "fuzzing.findings.allResults": "전체 결과",
};
