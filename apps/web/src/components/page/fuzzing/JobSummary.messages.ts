export const enFuzzingJobSummaryMessages = {
  "fuzzing.jobSummary.title": "Job Overview",
  "fuzzing.jobSummary.status": "Current Status",
  "fuzzing.jobSummary.target": "Target",
  "fuzzing.jobSummary.environment": "Environment",
  "fuzzing.jobSummary.created": "Created",
  "fuzzing.jobSummary.updated": "Updated",
} as const;

type FuzzingJobSummaryMessageKey = keyof typeof enFuzzingJobSummaryMessages;

export const koFuzzingJobSummaryMessages: Record<FuzzingJobSummaryMessageKey, string> = {
  "fuzzing.jobSummary.title": "작업 개요",
  "fuzzing.jobSummary.status": "현재 상태",
  "fuzzing.jobSummary.target": "대상",
  "fuzzing.jobSummary.environment": "환경",
  "fuzzing.jobSummary.created": "생성됨",
  "fuzzing.jobSummary.updated": "업데이트됨",
};
