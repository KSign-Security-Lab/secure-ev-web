export const enFuzzingFindingDetailMessages = {
  "fuzzing.findingDetail.title": "Interaction Details",
  "fuzzing.findingDetail.result": "Result",
  "fuzzing.findingDetail.inputPayload": "Input Payload",
  "fuzzing.findingDetail.outputResponse": "Output Response",
} as const;

type FuzzingFindingDetailMessageKey = keyof typeof enFuzzingFindingDetailMessages;

export const koFuzzingFindingDetailMessages: Record<FuzzingFindingDetailMessageKey, string> = {
  "fuzzing.findingDetail.title": "상호작용 상세",
  "fuzzing.findingDetail.result": "결과",
  "fuzzing.findingDetail.inputPayload": "입력 페이로드",
  "fuzzing.findingDetail.outputResponse": "출력 응답",
};
