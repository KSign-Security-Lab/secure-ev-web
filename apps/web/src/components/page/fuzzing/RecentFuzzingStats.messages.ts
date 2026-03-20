export const enFuzzingRecentStatsMessages = {
  "fuzzing.recentStats.title": "Recent Activity",
  "fuzzing.recentStats.subtitle": "Key metrics over the last 24 hours",
  "fuzzing.recentStats.totalCreatedTitle": "Created Jobs",
  "fuzzing.recentStats.totalCreatedDesc": "Total fuzzing sessions started",
  "fuzzing.recentStats.runningTitle": "Running Jobs",
  "fuzzing.recentStats.runningDesc": "Sessions currently in progress",
  "fuzzing.recentStats.failedTitle": "Failed Jobs",
  "fuzzing.recentStats.failedDesc": "Jobs that terminated unexpectedly",
} as const;

type FuzzingRecentStatsMessageKey = keyof typeof enFuzzingRecentStatsMessages;

export const koFuzzingRecentStatsMessages: Record<FuzzingRecentStatsMessageKey, string> = {
  "fuzzing.recentStats.title": "최근 활동",
  "fuzzing.recentStats.subtitle": "지난 24시간 주요 지표",
  "fuzzing.recentStats.totalCreatedTitle": "생성된 작업",
  "fuzzing.recentStats.totalCreatedDesc": "시작된 전체 퍼징 세션",
  "fuzzing.recentStats.runningTitle": "진행 중인 작업",
  "fuzzing.recentStats.runningDesc": "현재 실행 중인 세션",
  "fuzzing.recentStats.failedTitle": "실패한 작업",
  "fuzzing.recentStats.failedDesc": "예상치 못하게 종료된 작업",
};
