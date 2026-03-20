export const enFuzzingRecentJobsMessages = {
  "fuzzing.recentJobs.emptyTitle": "No Recent Jobs",
  "fuzzing.recentJobs.emptyDescription": "Start your first fuzzing session to see it here.",
  "fuzzing.recentJobs.goToDashboard": "Go to Jobs Dashboard",
  "fuzzing.recentJobs.title": "Recent Activity",
  "fuzzing.recentJobs.viewAll": "View all jobs",
} as const;

type FuzzingRecentJobsMessageKey = keyof typeof enFuzzingRecentJobsMessages;

export const koFuzzingRecentJobsMessages: Record<FuzzingRecentJobsMessageKey, string> = {
  "fuzzing.recentJobs.emptyTitle": "최근 작업이 없습니다",
  "fuzzing.recentJobs.emptyDescription": "첫 퍼징 세션을 시작하면 여기에 표시됩니다.",
  "fuzzing.recentJobs.goToDashboard": "작업 대시보드로 이동",
  "fuzzing.recentJobs.title": "최근 활동",
  "fuzzing.recentJobs.viewAll": "전체 작업 보기",
};
