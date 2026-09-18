export const enIntegrationsTableMessages = {
  "integrations.table.name": "Product",
  "integrations.table.vendor": "Vendor",
  "integrations.table.category": "Category",
  "integrations.table.mode": "Mode",
  "integrations.table.endpoint": "Endpoint",
  "integrations.table.status": "Status",
  "integrations.table.lastSync": "Last Sync",
  "integrations.table.collected": "Records",
  "integrations.table.modeApi": "API",
  "integrations.table.modeAgent": "Agent",
  "integrations.table.statusPending": "Awaiting Setup",
  "integrations.table.statusConnected": "Connected",
  "integrations.table.statusError": "Error",
  "integrations.table.statusDisabled": "Disabled",
  "integrations.table.noEndpoint": "-",
  "integrations.table.neverSynced": "Never",
} as const;

type IntegrationsTableMessageKey = keyof typeof enIntegrationsTableMessages;

export const koIntegrationsTableMessages: Record<
  IntegrationsTableMessageKey,
  string
> = {
  "integrations.table.name": "제품",
  "integrations.table.vendor": "제조사",
  "integrations.table.category": "범주",
  "integrations.table.mode": "연동 방식",
  "integrations.table.endpoint": "엔드포인트",
  "integrations.table.status": "상태",
  "integrations.table.lastSync": "최근 수집",
  "integrations.table.collected": "수집 건수",
  "integrations.table.modeApi": "API",
  "integrations.table.modeAgent": "에이전트",
  "integrations.table.statusPending": "설치 대기",
  "integrations.table.statusConnected": "정상",
  "integrations.table.statusError": "오류",
  "integrations.table.statusDisabled": "비활성",
  "integrations.table.noEndpoint": "-",
  "integrations.table.neverSynced": "없음",
};
