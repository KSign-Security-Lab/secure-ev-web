import type { ConnectorAdapter } from "../types";

export const linuxAuditdAdapter: ConnectorAdapter = {
  key: "linux-auditd",
  name: "Linux auditd / ufw",
  vendor: "Linux",
  category: "OS",
  supportedModes: ["AGENT"],
  requiresBaseUrl: false,
  requiresSecret: false,
  agentInputs: [
    { type: "tail", target: "/var/log/audit/audit.log", tag: "linux.auditd" },
    { type: "tail", target: "/var/log/ufw.log", tag: "linux.ufw" },
  ],
};
