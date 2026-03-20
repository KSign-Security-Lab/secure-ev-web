export const enAgentsTableMessages = {
  "agents.table.idPaw": "ID (Paw)",
  "agents.table.host": "Host",
  "agents.table.group": "Group",
  "agents.table.platform": "Platform",
  "agents.table.contact": "Contact",
  "agents.table.pid": "PID",
  "agents.table.privilege": "Privilege",
  "agents.table.status": "Status",
  "agents.table.lastSeen": "Last Seen",
  "agents.table.trusted": "Trusted",
  "agents.table.untrusted": "Untrusted",
} as const;

type AgentsTableMessageKey = keyof typeof enAgentsTableMessages;

export const koAgentsTableMessages: Record<AgentsTableMessageKey, string> = {
  "agents.table.idPaw": "ID (Paw)",
  "agents.table.host": "호스트",
  "agents.table.group": "그룹",
  "agents.table.platform": "플랫폼",
  "agents.table.contact": "연락처",
  "agents.table.pid": "PID",
  "agents.table.privilege": "권한",
  "agents.table.status": "상태",
  "agents.table.lastSeen": "마지막 확인",
  "agents.table.trusted": "신뢰",
  "agents.table.untrusted": "비신뢰",
};
