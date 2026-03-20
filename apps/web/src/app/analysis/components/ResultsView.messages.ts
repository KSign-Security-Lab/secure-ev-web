export const enAnalysisResultsViewMessages = {
  "analysis.results.title": "Analysis Results",
  "analysis.results.issuesFound": "{count} Issues Found",
  "analysis.results.subtitle": "Review detected issues and trace data flows.",
  "analysis.results.exportReport": "Export Report",
  "analysis.results.exportPlaceholder": "Export report feature is a placeholder and will be implemented later.",
  "analysis.results.filesAndIssues": "Files & Issues",
} as const;

type AnalysisResultsViewMessageKey = keyof typeof enAnalysisResultsViewMessages;

export const koAnalysisResultsViewMessages: Record<AnalysisResultsViewMessageKey, string> = {
  "analysis.results.title": "분석 결과",
  "analysis.results.issuesFound": "이슈 {count}건 발견",
  "analysis.results.subtitle": "탐지된 이슈를 검토하고 데이터 흐름을 추적하세요.",
  "analysis.results.exportReport": "리포트 내보내기",
  "analysis.results.exportPlaceholder": "리포트 내보내기 기능은 현재 플레이스홀더이며 이후 구현될 예정입니다.",
  "analysis.results.filesAndIssues": "파일 및 이슈",
};
