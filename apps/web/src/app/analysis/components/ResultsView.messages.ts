export const enAnalysisResultsViewMessages = {
  "analysis.results.title": "Analysis Results",
  "analysis.results.issuesFound": "{count} Issues Found",
  "analysis.results.subtitle": "Review detected issues and trace data flows.",
  "analysis.results.filesAndIssues": "Files & Issues",
} as const;

type AnalysisResultsViewMessageKey = keyof typeof enAnalysisResultsViewMessages;

export const koAnalysisResultsViewMessages: Record<AnalysisResultsViewMessageKey, string> = {
  "analysis.results.title": "분석 결과",
  "analysis.results.issuesFound": "이슈 {count}건 발견",
  "analysis.results.subtitle": "탐지된 이슈를 검토하고 데이터 흐름을 추적하세요.",
  "analysis.results.filesAndIssues": "파일 및 이슈",
};
