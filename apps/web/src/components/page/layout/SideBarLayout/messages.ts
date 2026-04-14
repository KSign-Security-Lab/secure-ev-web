export const enNavigationMessages = {
  "menu.dashboard": "Dashboard",
  "menu.fuzzing": "Fuzzing",
  "menu.agents": "Agents",
  "menu.agentTerminal": "Agent Terminal",
  "menu.abilities": "Abilities",
  "menu.playground": "Playground",
  "menu.assessment": "Assessment",
  "menu.analysis": "Analysis",
  "menu.inspectCode": "Inspect Code",
  "menu.vulnDb": "Vuln DB",
  "sidebar.language": "Language",
  "sidebar.toggleLanguage": "Switch language",
  "language.english": "English",
  "language.korean": "Korean",
} as const;

type NavigationMessageKey = keyof typeof enNavigationMessages;

export const koNavigationMessages: Record<NavigationMessageKey, string> = {
  "menu.dashboard": "대시보드",
  "menu.fuzzing": "퍼징",
  "menu.agents": "에이전트",
  "menu.agentTerminal": "에이전트 터미널",
  "menu.abilities": "어빌리티",
  "menu.playground": "플레이그라운드",
  "menu.assessment": "평가",
  "menu.analysis": "분석",
  "menu.inspectCode": "코드 분석",
  "menu.vulnDb": "취약점 DB",
  "sidebar.language": "언어",
  "sidebar.toggleLanguage": "언어 전환",
  "language.english": "영어",
  "language.korean": "한국어",
};
