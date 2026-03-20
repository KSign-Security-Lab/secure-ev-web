export const enAnalysisUploadViewMessages = {
  "analysis.upload.title": "Analysis Workspace",
  "analysis.upload.subtitle": "Upload source code files to begin",
  "analysis.upload.dropzoneInstruction": "Click to browse or drag and drop files here",
  "analysis.upload.dropzoneFormats": ".c, .cpp, .java or .zip archives",
  "analysis.upload.uploadedFiles": "Uploaded Files",
  "analysis.upload.runAnalysis": "Run Analysis",
  "analysis.upload.error.zipNoValidFiles": "The ZIP archive did not contain any valid C/C++/Java source files.",
  "analysis.upload.error.zipExtractFailed": "Failed to extract ZIP archive.",
  "analysis.upload.error.invalidFileType": "File type not allowed: {fileName}. Only C/C++/Java files and ZIPs are supported.",
} as const;

type AnalysisUploadViewMessageKey = keyof typeof enAnalysisUploadViewMessages;

export const koAnalysisUploadViewMessages: Record<AnalysisUploadViewMessageKey, string> = {
  "analysis.upload.title": "분석 워크스페이스",
  "analysis.upload.subtitle": "소스 코드 파일을 업로드해 분석을 시작하세요",
  "analysis.upload.dropzoneInstruction": "클릭하거나 파일을 드래그해 업로드하세요",
  "analysis.upload.dropzoneFormats": ".c, .cpp, .java 또는 .zip 아카이브",
  "analysis.upload.uploadedFiles": "업로드된 파일",
  "analysis.upload.runAnalysis": "분석 실행",
  "analysis.upload.error.zipNoValidFiles": "ZIP 아카이브에 유효한 C/C++/Java 소스 파일이 없습니다.",
  "analysis.upload.error.zipExtractFailed": "ZIP 아카이브를 추출하지 못했습니다.",
  "analysis.upload.error.invalidFileType": "허용되지 않은 파일 형식입니다: {fileName}. C/C++/Java 파일과 ZIP만 지원됩니다.",
};
