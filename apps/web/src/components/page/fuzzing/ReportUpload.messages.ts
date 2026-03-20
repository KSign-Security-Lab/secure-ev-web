import type { LocalizedMessages } from "~/i18n/I18nProvider";

export type ReportUploadMessageKey =
  | "fileMustBeJson"
  | "fileTooLarge"
  | "selectFile"
  | "invalidJson"
  | "uploadFailed"
  | "selectReport"
  | "maxSize"
  | "uploadSuccess"
  | "uploading"
  | "uploadReport";

export const reportUploadMessages: LocalizedMessages<ReportUploadMessageKey> = {
  en: {
    fileMustBeJson: "File must be a JSON file",
    fileTooLarge: "File size must be less than 10MB",
    selectFile: "Please select a file",
    invalidJson: "Invalid JSON file content",
    uploadFailed: "Failed to upload report",
    selectReport: "Select Report File (JSON)",
    maxSize: "Maximum file size: 10MB",
    uploadSuccess: "Report uploaded successfully!",
    uploading: "Uploading...",
    uploadReport: "Upload Report",
  },
  ko: {
    fileMustBeJson: "파일은 JSON 형식이어야 합니다",
    fileTooLarge: "파일 크기는 10MB 이하여야 합니다",
    selectFile: "파일을 선택해 주세요",
    invalidJson: "유효하지 않은 JSON 파일 내용입니다",
    uploadFailed: "리포트 업로드에 실패했습니다",
    selectReport: "리포트 파일 선택 (JSON)",
    maxSize: "최대 파일 크기: 10MB",
    uploadSuccess: "리포트가 성공적으로 업로드되었습니다!",
    uploading: "업로드 중...",
    uploadReport: "리포트 업로드",
  },
};
