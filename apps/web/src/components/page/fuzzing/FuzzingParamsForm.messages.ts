import type { LocalizedMessages } from "~/i18n/I18nProvider";

export type FuzzingParamsMessageKey =
  | "duration"
  | "durationHint"
  | "maxCases"
  | "maxCasesHint"
  | "aggressiveness"
  | "low"
  | "medium"
  | "high"
  | "mutate"
  | "jitter";

export const fuzzingParamsMessages: LocalizedMessages<FuzzingParamsMessageKey> = {
  en: {
    duration: "Duration (seconds)",
    durationHint: "Leave empty for unlimited duration",
    maxCases: "Max Test Cases",
    maxCasesHint: "Leave empty for unlimited test cases",
    aggressiveness: "Aggressiveness Level",
    low: "Low",
    medium: "Medium",
    high: "High",
    mutate: "Mutate Payload Fields",
    jitter: "Timing Jitter",
  },
  ko: {
    duration: "지속 시간 (초)",
    durationHint: "무제한 실행하려면 비워두세요",
    maxCases: "최대 테스트 케이스",
    maxCasesHint: "무제한 케이스로 실행하려면 비워두세요",
    aggressiveness: "공격성 수준",
    low: "낮음",
    medium: "보통",
    high: "높음",
    mutate: "페이로드 필드 변형",
    jitter: "타이밍 지터",
  },
};
