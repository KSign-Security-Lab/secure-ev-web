"use client";

import React, { useState, useEffect } from "react";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type {
  FuzzingTargetType,
  ISO15118ConnectionConfig,
  OCPPChargerConnectionConfig,
  OCPPServerConnectionConfig,
} from "~/types/fuzzing";
import { useLocalI18n } from "~/i18n/I18nProvider";
import { targetConfigMessages } from "./TargetConfigForm.messages";

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
  onStatusChange?: (status: 'idle' | 'generating' | 'waiting') => void;
}

export function TargetConfigForm({
  targetType,
  config,
  onChange,
  onStatusChange,
}: TargetConfigFormProps) {
  const t = useLocalI18n(targetConfigMessages);
  const [status, setStatus] = useState<'idle' | 'generating' | 'waiting'>('idle');
  const [dummyUrl, setDummyUrl] = useState('');

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    if (targetType !== "OCPP_CHARGER") {
        const timer = setTimeout(() => {
            setStatus('idle');
            setDummyUrl('');
        }, 0);
        return () => clearTimeout(timer);
    }
  }, [targetType]);

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
          chargePointIdentity: "",
        } as OCPPChargerConnectionConfig;
      case "OCPP_SERVER":
        return {
          serverUrl: "ws://localhost:9000",
          chargePointIdentity: "",
          ocppVersion: "2.0.1" as const,
        } as OCPPServerConnectionConfig;
    }
  });

  const generationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
    };
  }, []);

  const handleStartGeneration = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!(localConfig as OCPPChargerConnectionConfig).chargePointIdentity) return;
    
    setStatus('generating');
    generationTimerRef.current = setTimeout(() => {
        setDummyUrl(`ws://fuzzer-cloud.local:9000/ocpp/${(localConfig as OCPPChargerConnectionConfig).chargePointIdentity || 'CP001'}`);
        setStatus('waiting');
    }, 2500);
  };


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
        <div className="space-y-5 p-2 animate-in fade-in duration-500">
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-tight text-slate-400">
              {t("chargerIp")}
            </label>
            <input
              type="text"
              value={(localConfig as ISO15118ConnectionConfig).chargerIp || ""}
              onChange={(e) => handleChange("chargerIp", e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-white outline-none transition-all placeholder:text-slate-600"
              placeholder="192.168.1.100"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-tight text-slate-400">
              {t("port")}
            </label>
            <input
              type="number"
              value={(localConfig as ISO15118ConnectionConfig).port || ""}
              onChange={(e) => handleChange("port", parseInt(e.target.value))}
              className="w-full bg-slate-900/50 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-white outline-none transition-all placeholder:text-slate-600"
              placeholder="15118"
              min="1"
              max="65535"
              required
            />
          </div>
          
          <div className="flex items-center px-4 py-3 bg-slate-900/40 rounded-xl border border-slate-800/50 group cursor-pointer transition-colors hover:bg-slate-900/60" onClick={() => handleChange("tlsEnabled", !(localConfig as ISO15118ConnectionConfig).tlsEnabled)}>
            <div className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center mr-3 transition-all",
              (localConfig as ISO15118ConnectionConfig).tlsEnabled 
                ? "bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                : "border-slate-700 bg-slate-950"
            )}>
              {(localConfig as ISO15118ConnectionConfig).tlsEnabled && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <label className="text-sm font-medium text-slate-300 cursor-pointer">{t("tlsEnabled")}</label>
          </div>

          {(localConfig as ISO15118ConnectionConfig).tlsEnabled && (
            <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="block text-sm font-semibold tracking-tight text-slate-400">
                  {t("certPath")}
                </label>
                <input
                  type="text"
                  value={
                    (localConfig as ISO15118ConnectionConfig).certificatePath || ""
                  }
                  onChange={(e) =>
                    handleChange("certificatePath", e.target.value)
                  }
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-white outline-none transition-all placeholder:text-slate-600"
                  placeholder="/path/to/certificate.pem"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold tracking-tight text-slate-400">
                  {t("keyPath")}
                </label>
                <input
                  type="text"
                  value={(localConfig as ISO15118ConnectionConfig).keyPath || ""}
                  onChange={(e) => handleChange("keyPath", e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-white outline-none transition-all placeholder:text-slate-600"
                  placeholder="/path/to/key.pem"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {targetType === "OCPP_CHARGER" && (
        <div className="p-2">
          {status === 'idle' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="relative overflow-hidden p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl group transition-all">
                    <div className="relative flex items-center gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                            <Loader2 className="w-4 h-4 animate-spin-slow" />
                        </div>
                        <p className="text-[13px] text-slate-400 font-medium leading-normal">
                            To generate a connection URL for your charger, please provide the Charge Point Identity and protocol version.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase px-1">
                            {t("chargePointIdentity")}
                        </label>
                        <input
                            type="text"
                            value={(localConfig as OCPPChargerConnectionConfig).chargePointIdentity || ""}
                            onChange={(e) => handleChange("chargePointIdentity", e.target.value)}
                            className="w-full h-12 bg-slate-900 border border-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 px-4 rounded-xl text-sm text-white outline-none transition-all placeholder:text-slate-500"
                            placeholder="e.g. CP001"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase px-1">
                            {t("ocppVersion")}
                        </label>
                        <div className="relative h-12">
                            <select
                                value={(localConfig as OCPPChargerConnectionConfig).ocppVersion || "2.0.1"}
                                onChange={(e) => handleChange("ocppVersion", e.target.value as "1.6J" | "2.0.1")}
                                className="w-full h-full appearance-none bg-slate-900 border border-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 px-4 rounded-xl text-sm text-white outline-none transition-all cursor-pointer"
                                required
                            >
                                <option value="1.6J" className="bg-slate-900">OCPP 1.6J</option>
                                <option value="2.0.1" className="bg-slate-900">OCPP 2.0.1</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <Button 
                    type="button" 
                    className={cn(
                        "w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 relative overflow-hidden group",
                        (localConfig as OCPPChargerConnectionConfig).chargePointIdentity
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "bg-slate-800 text-slate-500"
                    )}
                    disabled={!(localConfig as OCPPChargerConnectionConfig).chargePointIdentity}
                    onClick={handleStartGeneration}
                >
                    <span className="relative z-10">{t("createUrl")}</span>
                    {(localConfig as OCPPChargerConnectionConfig).chargePointIdentity && (
                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                </Button>
            </div>
          )}

          {status === 'generating' && (
            <div className="flex flex-col items-center justify-center p-16 py-20 bg-linear-to-br from-slate-900/40 to-slate-950/40 rounded-3xl border border-slate-800/80 border-dashed backdrop-blur-md animate-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <Loader2 className="w-14 h-14 text-blue-500 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{t("generatingWebSocket")}</h3>
                <div className="flex gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce" />
                </div>
            </div>
          )}

          {status === 'waiting' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="relative group">
                   <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                   <div className="relative p-5 bg-slate-950/50 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-md transition-all">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {t("webSocketUrl")}
                            </label>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase">
                                <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                                Ready
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 group/url hover:bg-slate-900/60 transition-all shadow-inner">
                            <code className="text-cyan-400 font-mono text-xs flex-1 break-all select-all selection:bg-cyan-500/20">
                                {dummyUrl}
                            </code>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 hover:bg-slate-800 transition-all rounded-lg group/btn active:scale-95"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(dummyUrl);
                                }}
                            >
                                 <Copy className="w-4 h-4 text-slate-500 group-hover/btn:text-blue-400 transition-all" />
                            </Button>
                        </div>
                   </div>
               </div>
               
               <div className="flex items-center gap-5 px-6 py-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl relative overflow-hidden group mt-2">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
                    <div className="relative shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping scale-150" />
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin relative z-10" />
                    </div>
                    <div className="flex-1">
                        <p className="text-blue-400 font-bold tracking-tight text-[15px]">
                            {t("waitingForCharger")}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Please connect your hardware or simulator to the URL above</p>
                    </div>
               </div>

               <div className="flex justify-center pt-4">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            setStatus('idle');
                        }}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-900/40 transition-all active:scale-95"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-blue-500 transition-colors" />
                        <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors tracking-widest uppercase">Reset configuration</span>
                    </button>
               </div>
            </div>
          )}

          <div className={cn("hidden")}>
             {/* Technical settings preserved but hidden for now */}
          </div>
        </div>
      )}

      {targetType === "OCPP_SERVER" && (
        <div className="space-y-6 p-2 animate-in fade-in duration-500">
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-tight text-slate-400 px-1">
              {t("serverUrl")}
            </label>
            <input
              type="text"
              value={(localConfig as OCPPServerConnectionConfig).serverUrl || ""}
              onChange={(e) => handleChange("serverUrl", e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 p-3.5 rounded-xl text-white outline-none transition-all placeholder:text-slate-600 font-medium"
              placeholder="ws://ocpp-server.example.com:9000"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-tight text-slate-400 px-1">
              {t("chargePointIdentity")}
            </label>
            <input
              type="text"
              value={
                (localConfig as OCPPServerConnectionConfig).chargePointIdentity || ""
              }
              onChange={(e) => handleChange("chargePointIdentity", e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 p-3.5 rounded-xl text-white outline-none transition-all placeholder:text-slate-600 font-medium"
              placeholder="CP001"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-tight text-slate-400 px-1">
              {t("ocppVersion")}
            </label>
            <div className="relative">
              <select
                value={(localConfig as OCPPServerConnectionConfig).ocppVersion || "2.0.1"}
                onChange={(e) =>
                  handleChange("ocppVersion", e.target.value as "1.6J" | "2.0.1")
                }
                className="w-full appearance-none bg-slate-900/50 border border-slate-800 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 p-3.5 rounded-xl text-white outline-none transition-all font-medium"
                required
              >
                <option value="1.6J" className="bg-slate-900">OCPP 1.6J</option>
                <option value="2.0.1" className="bg-slate-900">OCPP 2.0.1</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
