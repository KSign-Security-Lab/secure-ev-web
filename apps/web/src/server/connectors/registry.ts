import type { ConnectorAdapter } from "./types";
import { wazuhAdapter } from "./adapters/wazuh";
import { shuffleAdapter } from "./adapters/shuffle";
import { virustotalAdapter } from "./adapters/virustotal";
import { zeekAdapter } from "./adapters/zeek";
import { windowsDefenderAdapter } from "./adapters/windows-defender";
import { linuxAuditdAdapter } from "./adapters/linux-auditd";

/**
 * Every product the platform can integrate with. The length of this list is
 * the "연동 수량" reported on the Integrations page.
 */
export const ADAPTERS: ConnectorAdapter[] = [
  wazuhAdapter,
  shuffleAdapter,
  virustotalAdapter,
  zeekAdapter,
  windowsDefenderAdapter,
  linuxAuditdAdapter,
];

const BY_KEY = new Map(ADAPTERS.map((adapter) => [adapter.key, adapter]));

export function getAdapter(key: string): ConnectorAdapter | undefined {
  return BY_KEY.get(key);
}

export const ADAPTER_KEYS = ADAPTERS.map((adapter) => adapter.key);
