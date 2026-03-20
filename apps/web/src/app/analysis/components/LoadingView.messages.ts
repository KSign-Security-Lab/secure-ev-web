export const enAnalysisLoadingViewMessages = {
  "analysis.loading.title": "Analyzing Codebase",
  "analysis.loading.hint": "This may take a few moments depending on codebase size...",
  "analysis.loading.step.initializing": "Initializing analysis engines...",
  "analysis.loading.step.parsing": "Parsing Abstract Syntax Trees (AST)...",
  "analysis.loading.step.cfg": "Constructing Control Flow Graphs (CFG)...",
  "analysis.loading.step.df": "Running Data Flow (DF) analysis...",
  "analysis.loading.step.signatures": "Extracting similarity signatures...",
  "analysis.loading.step.report": "Generating report and evidence...",
} as const;

type AnalysisLoadingViewMessageKey = keyof typeof enAnalysisLoadingViewMessages;

export const koAnalysisLoadingViewMessages: Record<AnalysisLoadingViewMessageKey, string> = {
  "analysis.loading.title": "코드베이스 분석 중",
  "analysis.loading.hint": "코드베이스 크기에 따라 잠시 시간이 걸릴 수 있습니다...",
  "analysis.loading.step.initializing": "분석 엔진을 초기화하는 중...",
  "analysis.loading.step.parsing": "추상 구문 트리(AST)를 파싱하는 중...",
  "analysis.loading.step.cfg": "제어 흐름 그래프(CFG)를 구성하는 중...",
  "analysis.loading.step.df": "데이터 흐름(DF) 분석을 실행하는 중...",
  "analysis.loading.step.signatures": "유사 시그니처를 추출하는 중...",
  "analysis.loading.step.report": "리포트와 근거를 생성하는 중...",
};
