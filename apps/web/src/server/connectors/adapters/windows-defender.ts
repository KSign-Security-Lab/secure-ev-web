import type { ConnectorAdapter } from "../types";

export const windowsDefenderAdapter: ConnectorAdapter = {
  key: "windows-defender",
  name: "Windows Defender",
  vendor: "Microsoft",
  category: "OS",
  supportedModes: ["AGENT"],
  requiresBaseUrl: false,
  requiresSecret: false,
  agentInputs: [
    {
      type: "winevtlog",
      target: "Microsoft-Windows-Windows Defender/Operational",
      tag: "windows.defender",
      dbPath: "C:\\Program Files\\fluent-bit\\defender.sqlite",
    },
    {
      type: "winevtlog",
      target:
        "Microsoft-Windows-Windows Firewall With Advanced Security/Firewall",
      tag: "windows.firewall",
      dbPath: "C:\\Program Files\\fluent-bit\\firewall.sqlite",
    },
  ],
};
