export const enFuzzingConfigDownloadMessages = {
  "fuzzing.configDownload.button": "Download Fuzzer Binary",
  "fuzzing.configDownload.instructionsTitle": "Instructions",
  "fuzzing.configDownload.step1": "Click the button above to download the {binary} binary.",
  "fuzzing.configDownload.step2": "Make the binary executable and run it:",
  "fuzzing.configDownload.step3": "Wait for the fuzzer to complete. It will generate a {file} file.",
  "fuzzing.configDownload.step4": "Upload the {file} file below to view the analysis.",
  "fuzzing.configDownload.copyCommand": "Copy command",
} as const;

type FuzzingConfigDownloadMessageKey = keyof typeof enFuzzingConfigDownloadMessages;

export const koFuzzingConfigDownloadMessages: Record<FuzzingConfigDownloadMessageKey, string> = {
  "fuzzing.configDownload.button": "퍼저 바이너리 다운로드",
  "fuzzing.configDownload.instructionsTitle": "안내",
  "fuzzing.configDownload.step1": "위 버튼을 눌러 {binary} 바이너리를 다운로드하세요.",
  "fuzzing.configDownload.step2": "바이너리에 실행 권한을 부여하고 실행하세요:",
  "fuzzing.configDownload.step3": "퍼저 실행이 완료될 때까지 기다리면 {file} 파일이 생성됩니다.",
  "fuzzing.configDownload.step4": "아래에서 {file} 파일을 업로드해 분석 결과를 확인하세요.",
  "fuzzing.configDownload.copyCommand": "명령 복사",
};
