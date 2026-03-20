export const enFuzzingSharedMessages = {
  "fuzzing.target.iso15118Charger": "ISO 15118 Charger",
  "fuzzing.target.ocppCharger": "OCPP Charger",
  "fuzzing.target.ocppServer": "OCPP Server",
  "fuzzing.environment.dev": "Development",
  "fuzzing.environment.stage": "Staging",
  "fuzzing.environment.prod": "Production",
  "fuzzing.runResult.ok": "OK",
  "fuzzing.runResult.error": "Error",
  "fuzzing.runResult.timeout": "Timeout",
} as const;

type FuzzingSharedMessageKey = keyof typeof enFuzzingSharedMessages;

export const koFuzzingSharedMessages: Record<FuzzingSharedMessageKey, string> = {
  "fuzzing.target.iso15118Charger": "ISO 15118 충전기",
  "fuzzing.target.ocppCharger": "OCPP 충전기",
  "fuzzing.target.ocppServer": "OCPP 서버",
  "fuzzing.environment.dev": "개발",
  "fuzzing.environment.stage": "스테이징",
  "fuzzing.environment.prod": "운영",
  "fuzzing.runResult.ok": "정상",
  "fuzzing.runResult.error": "오류",
  "fuzzing.runResult.timeout": "타임아웃",
};
