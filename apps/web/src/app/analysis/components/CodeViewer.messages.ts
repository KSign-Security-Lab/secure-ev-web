export const enAnalysisCodeViewerMessages = {
  "analysis.codeViewer.binaryUnavailable": "This is a binary file and cannot be previewed.",
  "analysis.codeViewer.largeUnavailable": "This file is too large to render completely.",
  "analysis.codeViewer.loadTruncatedPreview": "Load Truncated Preview",
  "analysis.codeViewer.contentUnavailable": "File content unavailable.",
} as const;

type AnalysisCodeViewerMessageKey = keyof typeof enAnalysisCodeViewerMessages;

export const koAnalysisCodeViewerMessages: Record<AnalysisCodeViewerMessageKey, string> = {
  "analysis.codeViewer.binaryUnavailable": "바이너리 파일은 미리보기할 수 없습니다.",
  "analysis.codeViewer.largeUnavailable": "파일이 너무 커서 전체를 렌더링할 수 없습니다.",
  "analysis.codeViewer.loadTruncatedPreview": "축약 미리보기 로드",
  "analysis.codeViewer.contentUnavailable": "파일 내용을 불러올 수 없습니다.",
};
