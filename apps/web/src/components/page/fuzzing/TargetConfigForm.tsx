"use client";

import React, { useState, useEffect } from "react";
import type {
  FuzzingTargetType,
  ISO15118ConnectionConfig,
  OCPPChargerConnectionConfig,
  OCPPServerConnectionConfig,
} from "~/types/fuzzing";
import { useI18n } from "~/i18n/I18nProvider";

interface TargetConfigFormProps {
  targetType: FuzzingTargetType;
  config:
    | ISO15118ConnectionConfig
    | OCPPChargerConnectionConfig
    | OCPPServerConnectionConfig
    | null;
  onChange: (
    config:
      | ISO15118ConnectionConfig
      | OCPPChargerConnectionConfig
      | OCPPServerConnectionConfig
  ) => void;
}

export function TargetConfigForm({
  targetType,
  config,
  onChange,
}: TargetConfigFormProps) {
  const { locale } = useI18n();
  const text =
    locale === "ko"
      ? {
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
        }
      : {
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
        };

  const [localConfig, setLocalConfig] = useState(() => {
    if (config) return config;
    // Default values based on target type
    switch (targetType) {
      case "ISO15118":
        return {
          chargerIp: "",
          port: 15118,
          tlsEnabled: false,
          certificatePath: "",
          keyPath: "",
        } as ISO15118ConnectionConfig;
      case "OCPP_CHARGER":
        return {
          listenIp: "0.0.0.0",
          port: 9000,
          ocppVersion: "2.0.1" as const,
          websocketPath: "/ocpp",
        } as OCPPChargerConnectionConfig;
      case "OCPP_SERVER":
        return {
          serverUrl: "ws://localhost:9000",
          chargePointIdentity: "",
          ocppVersion: "2.0.1" as const,
        } as OCPPServerConnectionConfig;
    }
  });


  useEffect(() => {
    onChange(localConfig);
  }, [onChange, localConfig]);

  const handleChange = (
    field: string,
    value: string | number | boolean
  ) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);
    onChange(updated as typeof localConfig);
  };

  return (
    <div className="space-y-4">
      {targetType === "ISO15118" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.chargerIp}
            </label>
            <input
              type="text"
              value={(localConfig as ISO15118ConnectionConfig).chargerIp || ""}
              onChange={(e) => handleChange("chargerIp", e.target.value)}
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              placeholder="192.168.1.100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.port}
            </label>
            <input
              type="number"
              value={(localConfig as ISO15118ConnectionConfig).port || ""}
              onChange={(e) => handleChange("port", parseInt(e.target.value))}
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              placeholder="15118"
              min="1"
              max="65535"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={(localConfig as ISO15118ConnectionConfig).tlsEnabled || false}
              onChange={(e) => handleChange("tlsEnabled", e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-white">{text.tlsEnabled}</label>
          </div>
          {(localConfig as ISO15118ConnectionConfig).tlsEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  {text.certPath}
                </label>
                <input
                  type="text"
                  value={
                    (localConfig as ISO15118ConnectionConfig).certificatePath || ""
                  }
                  onChange={(e) =>
                    handleChange("certificatePath", e.target.value)
                  }
                  className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
                  placeholder="/path/to/certificate.pem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  {text.keyPath}
                </label>
                <input
                  type="text"
                  value={(localConfig as ISO15118ConnectionConfig).keyPath || ""}
                  onChange={(e) => handleChange("keyPath", e.target.value)}
                  className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
                  placeholder="/path/to/key.pem"
                />
              </div>
            </>
          )}
        </>
      )}

      {targetType === "OCPP_CHARGER" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.listenIp}
            </label>
            <input
              type="text"
              value={(localConfig as OCPPChargerConnectionConfig).listenIp || ""}
              onChange={(e) => handleChange("listenIp", e.target.value)}
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              placeholder="0.0.0.0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.port}
            </label>
            <input
              type="number"
              value={(localConfig as OCPPChargerConnectionConfig).port || ""}
              onChange={(e) => handleChange("port", parseInt(e.target.value))}
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              placeholder="9000"
              min="1"
              max="65535"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.ocppVersion}
            </label>
            <select
              value={(localConfig as OCPPChargerConnectionConfig).ocppVersion || "2.0.1"}
              onChange={(e) =>
                handleChange("ocppVersion", e.target.value as "1.6J" | "2.0.1")
              }
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              required
            >
              <option value="1.6J">1.6J</option>
              <option value="2.0.1">2.0.1</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.websocketPath}
            </label>
            <input
              type="text"
              value={
                (localConfig as OCPPChargerConnectionConfig).websocketPath || ""
              }
              onChange={(e) => handleChange("websocketPath", e.target.value)}
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              placeholder="/ocpp"
              required
            />
          </div>
        </>
      )}

      {targetType === "OCPP_SERVER" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.serverUrl}
            </label>
            <input
              type="text"
              value={(localConfig as OCPPServerConnectionConfig).serverUrl || ""}
              onChange={(e) => handleChange("serverUrl", e.target.value)}
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              placeholder="ws://ocpp-server.example.com:9000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.chargePointIdentity}
            </label>
            <input
              type="text"
              value={
                (localConfig as OCPPServerConnectionConfig).chargePointIdentity || ""
              }
              onChange={(e) => handleChange("chargePointIdentity", e.target.value)}
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              placeholder="CP001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {text.ocppVersion}
            </label>
            <select
              value={(localConfig as OCPPServerConnectionConfig).ocppVersion || "2.0.1"}
              onChange={(e) =>
                handleChange("ocppVersion", e.target.value as "1.6J" | "2.0.1")
              }
              className="w-full bg-base-800 p-2 rounded border border-base-850 text-white"
              required
            >
              <option value="1.6J">1.6J</option>
              <option value="2.0.1">2.0.1</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
