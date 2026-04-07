import type { LocalizedMessages } from "~/i18n/I18nProvider";

export type TargetConfigMessageKey =
  | "chargerIp"
  | "port"
  | "tlsEnabled"
  | "certPath"
  | "keyPath"
  | "listenIp"
  | "ocppVersion"
  | "websocketPath"
  | "serverUrl"
  | "chargePointIdentity"
  | "generatingWebSocket"
  | "waitingForCharger"
  | "webSocketUrl"
  | "createUrl"
  | "cpidRequired";

export const targetConfigMessages: LocalizedMessages<TargetConfigMessageKey> = {
  en: {
    chargerIp: "Charger IP / Hostname *",
    port: "Port *",
    tlsEnabled: "TLS Enabled",
    certPath: "Certificate Path (optional)",
    keyPath: "Key Path (optional)",
    listenIp: "Listen IP *",
    ocppVersion: "OCPP Version *",
    websocketPath: "WebSocket Path *",
    serverUrl: "Server URL (ws/wss) *",
    chargePointIdentity: "Charge Point Identity *",
    generatingWebSocket: "Generating WebSocket URL...",
    waitingForCharger: "Waiting for charger to connect...",
    webSocketUrl: "WebSocket URL",
    createUrl: "Create Connection URL",
    cpidRequired: "Please enter Charge Point Identity first",
  },
  ko: {
    chargerIp: "충전기 IP / 호스트명 *",
    port: "포트 *",
    tlsEnabled: "TLS 활성화",
    certPath: "인증서 경로 (선택)",
    keyPath: "키 경로 (선택)",
    listenIp: "수신 IP *",
    ocppVersion: "OCPP 버전 *",
    websocketPath: "WebSocket 경로 *",
    serverUrl: "서버 URL (ws/wss) *",
    chargePointIdentity: "충전기 ID *",
    generatingWebSocket: "WebSocket URL 생성 중...",
    waitingForCharger: "충전기 연결 대기 중...",
    webSocketUrl: "WebSocket URL",
    createUrl: "접속 URL 생성",
    cpidRequired: "먼저 충전기 ID를 입력해 주세요",
  },
};
