"use client";

import React, { useState, useEffect } from "react";
import type {
  FuzzingTargetType,
  ISO15118ConnectionConfig,
  OCPPChargerConnectionConfig,
  OCPPServerConnectionConfig,
} from "~/types/fuzzing";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              Charger IP / Hostname *
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
              Port *
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
            <label className="text-sm text-white">TLS Enabled</label>
          </div>
          {(localConfig as ISO15118ConnectionConfig).tlsEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Certificate Path (optional)
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
                  Key Path (optional)
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
              Listen IP *
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
              Port *
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
              OCPP Version *
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
              WebSocket Path *
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
              Server URL (ws/wss) *
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
              Charge Point Identity *
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
              OCPP Version *
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

