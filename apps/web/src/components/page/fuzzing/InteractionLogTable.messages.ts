export const enFuzzingInteractionLogTableMessages = {
  "fuzzing.logs.column.type": "Type",
  "fuzzing.logs.column.input": "Input",
  "fuzzing.logs.column.output": "Output",
  "fuzzing.logs.column.result": "Result",
  "fuzzing.logs.searchPlaceholder": "Search logs...",
  "fuzzing.logs.allResults": "All Results",
  "fuzzing.logs.allTypes": "All Types",
  "fuzzing.logs.sortBy": "Sort by:",
  "fuzzing.logs.sortDefault": "Default",
  "fuzzing.logs.sortType": "Type",
  "fuzzing.logs.sortResult": "Result",
  "fuzzing.logs.sortInput": "Input",
  "fuzzing.logs.toggleSortDirection": "Toggle Sort Direction",
  "fuzzing.logs.showingEntries": "Showing {start} to {end} of {total} entries",
  "fuzzing.logs.perPage": "{count} / page",
  "fuzzing.logs.pageOf": "Page {page} of {total}",
} as const;

type FuzzingInteractionLogTableMessageKey = keyof typeof enFuzzingInteractionLogTableMessages;

export const koFuzzingInteractionLogTableMessages: Record<FuzzingInteractionLogTableMessageKey, string> = {
  "fuzzing.logs.column.type": "유형",
  "fuzzing.logs.column.input": "입력",
  "fuzzing.logs.column.output": "출력",
  "fuzzing.logs.column.result": "결과",
  "fuzzing.logs.searchPlaceholder": "로그 검색...",
  "fuzzing.logs.allResults": "전체 결과",
  "fuzzing.logs.allTypes": "전체 유형",
  "fuzzing.logs.sortBy": "정렬 기준:",
  "fuzzing.logs.sortDefault": "기본값",
  "fuzzing.logs.sortType": "유형",
  "fuzzing.logs.sortResult": "결과",
  "fuzzing.logs.sortInput": "입력",
  "fuzzing.logs.toggleSortDirection": "정렬 방향 전환",
  "fuzzing.logs.showingEntries": "총 {total}개 중 {start}~{end} 표시",
  "fuzzing.logs.perPage": "{count}개 / 페이지",
  "fuzzing.logs.pageOf": "{total}페이지 중 {page}페이지",
};
