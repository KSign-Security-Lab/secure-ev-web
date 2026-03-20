export const enAnalysisResultDetailMessages = {
  "analysis.resultDetail.emptyState": "Select a vulnerability or code line to view details.",
  "analysis.resultDetail.title": "Issue Explanation",
  "analysis.resultDetail.riskBadge": "{risk} Risk",
  "analysis.resultDetail.requestCapacitySentence": "Request basis is {requestBasis} against capacity {capacity}.",
  "analysis.resultDetail.rootCause": "Root Cause:",
  "analysis.resultDetail.fullDataFlowAnalysis": "Full Data Flow Analysis",
  "analysis.resultDetail.fullDataFlowDescription": "Review how data travels through your code. This helps verify if a vulnerability is reachable and correctly diagnosed.",
  "analysis.resultDetail.explanation": "Explanation",
  "analysis.resultDetail.rawNodes": "Raw Data Flow Nodes",
  "analysis.resultDetail.close": "Close",
  "analysis.resultDetail.similarSignatures": "Similar Signatures",
  "analysis.resultDetail.similarSignaturesDescription": "Review other code segments in your project that share similar structural or data-flow patterns to this vulnerability.",
} as const;

type AnalysisResultDetailMessageKey = keyof typeof enAnalysisResultDetailMessages;

export const koAnalysisResultDetailMessages: Record<AnalysisResultDetailMessageKey, string> = {
  "analysis.resultDetail.emptyState": "상세 정보를 보려면 취약점 또는 코드 라인을 선택하세요.",
  "analysis.resultDetail.title": "이슈 설명",
  "analysis.resultDetail.riskBadge": "위험도 {risk}",
  "analysis.resultDetail.requestCapacitySentence": "요청 기준은 {requestBasis}이고 용량은 {capacity}입니다.",
  "analysis.resultDetail.rootCause": "근본 원인:",
  "analysis.resultDetail.fullDataFlowAnalysis": "전체 데이터 흐름 분석",
  "analysis.resultDetail.fullDataFlowDescription": "데이터가 코드에서 어떻게 흐르는지 확인하세요. 취약점 도달 가능성과 진단 정확성을 검증하는 데 도움이 됩니다.",
  "analysis.resultDetail.explanation": "설명",
  "analysis.resultDetail.rawNodes": "원시 데이터 흐름 노드",
  "analysis.resultDetail.close": "닫기",
  "analysis.resultDetail.similarSignatures": "유사 시그니처",
  "analysis.resultDetail.similarSignaturesDescription": "이 취약점과 구조 또는 데이터 흐름 패턴이 유사한 프로젝트 내 다른 코드 구간을 확인하세요.",
};
