export const enAnalysisDFInfoCardsMessages = {
  "analysis.df.destination": "Destination",
  "analysis.df.capacity": "Capacity",
  "analysis.df.request": "Request",
  "analysis.df.validation": "Validation",
  "analysis.df.diagnostics": "Diagnostics",
  "analysis.df.rootCause": "Root Cause",
} as const;

type AnalysisDFInfoCardsMessageKey = keyof typeof enAnalysisDFInfoCardsMessages;

export const koAnalysisDFInfoCardsMessages: Record<AnalysisDFInfoCardsMessageKey, string> = {
  "analysis.df.destination": "대상 버퍼",
  "analysis.df.capacity": "버퍼 크기",
  "analysis.df.request": "요청 크기",
  "analysis.df.validation": "검증",
  "analysis.df.diagnostics": "진단",
  "analysis.df.rootCause": "근본 원인",
};
