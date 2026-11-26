export const enAgentsPageMessages = {
  "agents.page.title": "Agents",
  "agents.page.subtitle": "Active agents connected to the bridge",
  "agents.page.empty": "No agents deployed",
  "agents.page.deploy": "Deploy Agent",
  "agents.page.emptyDesc": "Deploy an agent to a target host; it appears here once it checks in.",

  "agents.terminate.title": "Terminate agent {host}?",
  "agents.terminate.description":
    "Kills the implant process on {host} at its next check-in, then deletes the agent and its command history from the console. This cannot be undone — the connection cannot be restored.",
  "agents.terminate.confirm": "Terminate agent",
  "agents.terminate.done": "Terminated {host} and removed it from the console",
  "agents.terminate.failed": "Could not terminate {host}",
  "agents.terminate.pending":
    "The stop command for {host} is queued but not yet delivered. The agent stops at its next check-in; remove it once it shows as untrusted.",
} as const;

type AgentsPageMessageKey = keyof typeof enAgentsPageMessages;

export const koAgentsPageMessages: Record<AgentsPageMessageKey, string> = {
  "agents.page.title": "에이전트",
  "agents.page.subtitle": "브리지에 연결된 활성 에이전트 목록",
  "agents.page.empty": "배포된 에이전트가 없습니다",
  "agents.page.deploy": "에이전트 배포",
  "agents.page.emptyDesc": "대상 호스트에 에이전트를 배포하면 접속 후 여기에 표시됩니다.",

  "agents.terminate.title": "{host} 에이전트를 종료할까요?",
  "agents.terminate.description":
    "{host}이(가) 다음에 접속할 때 임플란트 프로세스를 종료한 뒤, 콘솔에서 에이전트와 명령 기록을 삭제합니다. 이 작업은 되돌릴 수 없으며 연결을 복구할 수 없습니다.",
  "agents.terminate.confirm": "에이전트 종료",
  "agents.terminate.done": "{host}을(를) 종료하고 콘솔에서 제거했습니다",
  "agents.terminate.failed": "{host}을(를) 종료하지 못했습니다",
  "agents.terminate.pending":
    "{host}의 종료 명령이 대기 중이며 아직 전달되지 않았습니다. 다음 접속 시 종료되며, 비신뢰로 표시된 뒤 다시 종료하면 콘솔에서 제거됩니다.",
};
