export const enAnalysisSimilarSignaturesMessages = {
  "analysis.similar.title": "Similarity Candidates",
  "analysis.similar.foundCount": "Found {count} functionally similar signatures",
  "analysis.similar.target": "Target: {name}",
  "analysis.similar.compareRuns": "Compare Runs",
  "analysis.similar.compareRunsPlaceholder": "Compare Runs feature is a placeholder and will be implemented later.",
  "analysis.similar.rank": "Rank #{rank}",
  "analysis.similar.whySimilar": "Why Similar:",
  "analysis.similar.breakdown": "4-Axis Similarity Breakdown",
  "analysis.similar.embedding": "Embedding",
  "analysis.similar.tag": "TAG",
  "analysis.similar.dfFlow": "DF Flow",
  "analysis.similar.coreLogic": "Core Logic",
  "analysis.similar.empty": "No similar signatures found for this analysis run.",
} as const;

type AnalysisSimilarSignaturesMessageKey = keyof typeof enAnalysisSimilarSignaturesMessages;

export const koAnalysisSimilarSignaturesMessages: Record<AnalysisSimilarSignaturesMessageKey, string> = {
  "analysis.similar.title": "유사도 후보",
  "analysis.similar.foundCount": "유사한 케이퍼빌리티를 가진 시그니처 {count}개를 찾았습니다",
  "analysis.similar.target": "대상: {name}",
  "analysis.similar.compareRuns": "실행 비교",
  "analysis.similar.compareRunsPlaceholder": "실행 비교 기능은 현재 플레이스홀더이며 이후 구현될 예정입니다.",
  "analysis.similar.rank": "{rank}순위",
  "analysis.similar.whySimilar": "유사한 이유:",
  "analysis.similar.breakdown": "4축 유사도 분석",
  "analysis.similar.embedding": "임베딩",
  "analysis.similar.tag": "태그",
  "analysis.similar.dfFlow": "DF 흐름",
  "analysis.similar.coreLogic": "핵심 로직",
  "analysis.similar.empty": "이번 분석 실행에서는 유사 시그니처를 찾지 못했습니다.",
};
