export const enNavigationMessages = {
  "menu.dashboard": "Dashboard",
  "menu.fuzzing": "Fuzzing",
  "menu.agents": "Agents",
  "menu.abilities": "Abilities",
  "menu.playground": "Playground",
  "menu.analysisWorkspace": "Analysis Workspace",
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
  "menu.abilities": "능력",
  "menu.playground": "플레이그라운드",
  "menu.analysisWorkspace": "분석 워크스페이스",
  "sidebar.language": "언어",
  "sidebar.toggleLanguage": "언어 전환",
  "language.english": "영어",
  "language.korean": "한국어",
};
