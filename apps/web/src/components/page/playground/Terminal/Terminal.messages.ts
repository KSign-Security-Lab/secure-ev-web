export const enPlaygroundTerminalMessages = {
  "playground.terminal.welcome": "Interactive terminal. Type a command and press Enter to execute.",
  "playground.terminal.selectSessionPrompt": "Please select a session from the list to connect to the terminal.",
  "playground.terminal.warnNoSession": "[warn] No session selected. Please select a session from the list.",
  "playground.terminal.warnDisconnected": "[warn] Terminal is not connected. The terminal will automatically reconnect.",
} as const;

type PlaygroundTerminalMessageKey = keyof typeof enPlaygroundTerminalMessages;

export const koPlaygroundTerminalMessages: Record<PlaygroundTerminalMessageKey, string> = {
  "playground.terminal.welcome": "대화형 터미널입니다. 명령을 입력하고 Enter를 눌러 실행하세요.",
  "playground.terminal.selectSessionPrompt": "터미널에 연결하려면 목록에서 세션을 선택하세요.",
  "playground.terminal.warnNoSession": "[경고] 선택된 세션이 없습니다. 목록에서 세션을 선택하세요.",
  "playground.terminal.warnDisconnected": "[경고] 터미널이 연결되지 않았습니다. 자동으로 재연결됩니다.",
};
