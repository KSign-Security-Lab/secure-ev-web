export const enFuzzingRecentActivityChartMessages = {
  "fuzzing.activity.title": "Recent Activity",
  "fuzzing.activity.subtitle": "Fuzzing jobs started over time",
  "fuzzing.activity.totalJobs": "Total Jobs",
  "fuzzing.activity.tooltipTitle": "{hour} - Activity",
  "fuzzing.activity.tooltipJobsStarted": "{count} jobs started",
} as const;

type FuzzingRecentActivityChartMessageKey = keyof typeof enFuzzingRecentActivityChartMessages;

export const koFuzzingRecentActivityChartMessages: Record<FuzzingRecentActivityChartMessageKey, string> = {
  "fuzzing.activity.title": "최근 활동",
  "fuzzing.activity.subtitle": "시간대별 시작된 퍼징 작업",
  "fuzzing.activity.totalJobs": "전체 작업",
  "fuzzing.activity.tooltipTitle": "{hour} - 활동",
  "fuzzing.activity.tooltipJobsStarted": "시작된 작업 {count}개",
};
