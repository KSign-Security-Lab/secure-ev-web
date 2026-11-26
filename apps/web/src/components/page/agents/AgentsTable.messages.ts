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
  "agents.table.actions": "Actions",
  "agents.action.terminal": "Terminal",
  "agents.action.terminalTitle": "Open a live terminal on this agent",
  "agents.action.terminate": "Terminate",
  "agents.action.terminateTitle": "Kill the implant and remove it from the console",
} as const;

type AgentsTableMessageKey = keyof typeof enAgentsTableMessages;

export const koAgentsTableMessages: Record<AgentsTableMessageKey, string> = {
  "agents.table.idPaw": "ID (Paw)",
  "agents.table.host": "호스트",
  "agents.table.group": "그룹",
  "agents.table.platform": "플랫폼",
  "agents.table.contact": "통신 방식",
  "agents.table.pid": "PID",
  "agents.table.privilege": "권한",
  "agents.table.status": "상태",
  "agents.table.lastSeen": "최근 접속",
  "agents.table.trusted": "신뢰",
  "agents.table.untrusted": "비신뢰",
  "agents.table.actions": "작업",
  "agents.action.terminal": "터미널",
  "agents.action.terminalTitle": "이 에이전트의 실시간 터미널을 엽니다",
  "agents.action.terminate": "종료",
  "agents.action.terminateTitle": "임플란트를 종료하고 콘솔에서 제거합니다",
};
