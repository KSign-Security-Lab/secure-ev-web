export const enFuzzingJobDetailPageMessages = {
  "fuzzing.jobDetail.loading": "Loading job details...",
  "fuzzing.jobDetail.notFound": "Job not found",
  "fuzzing.jobDetail.returnToJobs": "Return to Fuzzing Jobs",
  "fuzzing.jobDetail.exportReport": "Export Report",
  "fuzzing.jobDetail.fuzzerSetup": "Fuzzer Setup",
  "fuzzing.jobDetail.noReportTitle": "No Report Available",
  "fuzzing.jobDetail.noReportCompleted": "The job has completed. Please upload a report to view the analysis.",
  "fuzzing.jobDetail.noReportPending": "Wait for the job to complete to view the report.",
  "fuzzing.jobDetail.tab.overview": "Overview",
  "fuzzing.jobDetail.tab.logs": "Interaction Log",
} as const;

type FuzzingJobDetailPageMessageKey = keyof typeof enFuzzingJobDetailPageMessages;

export const koFuzzingJobDetailPageMessages: Record<FuzzingJobDetailPageMessageKey, string> = {
  "fuzzing.jobDetail.loading": "작업 상세 정보를 불러오는 중...",
  "fuzzing.jobDetail.notFound": "작업을 찾을 수 없습니다",
  "fuzzing.jobDetail.returnToJobs": "퍼징 작업 목록으로 돌아가기",
  "fuzzing.jobDetail.exportReport": "리포트 내보내기",
  "fuzzing.jobDetail.fuzzerSetup": "퍼저 설정",
  "fuzzing.jobDetail.noReportTitle": "리포트가 없습니다",
  "fuzzing.jobDetail.noReportCompleted": "작업이 완료되었습니다. 분석을 보려면 리포트를 업로드하세요.",
  "fuzzing.jobDetail.noReportPending": "리포트를 보려면 작업 완료까지 기다려주세요.",
  "fuzzing.jobDetail.tab.overview": "개요",
  "fuzzing.jobDetail.tab.logs": "상호작용 로그",
};
