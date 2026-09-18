import type { ConnectorAdapter } from "../types";

export const zeekAdapter: ConnectorAdapter = {
  key: "zeek",
  name: "Zeek",
  vendor: "Zeek Project",
  category: "NDR",
  supportedModes: ["AGENT"],
  requiresBaseUrl: false,
  requiresSecret: false,
  // Zeek writes newline-delimited JSON (LogAscii::use_json=T). The `current/`
  // directory is the running-cluster log path used by zeekctl / a supervised
  // deploy; a bare `zeek -i` run writes to its working dir instead.
  agentInputs: [
    { type: "tail", target: "/opt/zeek/logs/current/conn.log", tag: "zeek.conn", parser: "json" },
    { type: "tail", target: "/opt/zeek/logs/current/dns.log", tag: "zeek.dns", parser: "json" },
    { type: "tail", target: "/opt/zeek/logs/current/notice.log", tag: "zeek.notice", parser: "json" },
  ],
};
