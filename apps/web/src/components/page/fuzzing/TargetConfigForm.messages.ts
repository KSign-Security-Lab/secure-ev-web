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
  | "chargePointIdentity";

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
  },
};
