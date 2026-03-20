export const enFuzzingInterpretationMessages = {
  "fuzzing.interpretation.criticalTitle": "Critical Failures Detected",
  "fuzzing.interpretation.criticalSummary": "The fuzzing session identified {count} critical failures (crashes). These issues typically indicate severe vulnerabilities that could lead to denial of service or remote code execution.",
  "fuzzing.interpretation.criticalAction": "Immediate investigation of the crash logs is recommended.",
  "fuzzing.interpretation.performanceTitle": "Performance Issues Detected",
  "fuzzing.interpretation.performanceSummary": "The scan detected {count} timeouts. While no direct crashes occurred, timeouts can indicate resource exhaustion bugs or potential denial-of-service vectors.",
  "fuzzing.interpretation.performanceAction": "Review timeout cases to ensure system responsiveness.",
  "fuzzing.interpretation.secureTitle": "System Appears Secure",
  "fuzzing.interpretation.secureSummary": "No significant issues were found across {count} test cases. The target handled malformed inputs without crashing or timing out.",
  "fuzzing.interpretation.secureAction": "Continue monitoring and perform regular regression testing.",
} as const;

type FuzzingInterpretationMessageKey = keyof typeof enFuzzingInterpretationMessages;

export const koFuzzingInterpretationMessages: Record<FuzzingInterpretationMessageKey, string> = {
  "fuzzing.interpretation.criticalTitle": "치명적 실패가 감지되었습니다",
  "fuzzing.interpretation.criticalSummary": "퍼징 세션에서 치명적 실패(크래시) {count}건이 확인되었습니다. 이는 서비스 거부나 원격 코드 실행으로 이어질 수 있는 심각한 취약점을 의미할 수 있습니다.",
  "fuzzing.interpretation.criticalAction": "크래시 로그를 즉시 조사하는 것을 권장합니다.",
  "fuzzing.interpretation.performanceTitle": "성능 이슈가 감지되었습니다",
  "fuzzing.interpretation.performanceSummary": "스캔 중 타임아웃 {count}건이 감지되었습니다. 직접적인 크래시는 없더라도 타임아웃은 자원 고갈 버그나 서비스 거부 가능성을 시사할 수 있습니다.",
  "fuzzing.interpretation.performanceAction": "시스템 응답성을 위해 타임아웃 케이스를 검토하세요.",
  "fuzzing.interpretation.secureTitle": "시스템이 안정적으로 보입니다",
  "fuzzing.interpretation.secureSummary": "총 {count}개의 테스트 케이스에서 유의미한 문제가 발견되지 않았습니다. 대상 시스템이 비정상 입력을 크래시나 타임아웃 없이 처리했습니다.",
  "fuzzing.interpretation.secureAction": "지속적인 모니터링과 정기적인 회귀 테스트를 권장합니다.",
};
