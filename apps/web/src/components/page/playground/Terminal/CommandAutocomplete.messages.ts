export const enPlaygroundCommandAutocompleteMessages = {
  "playground.autocomplete.searching": "Searching commands...",
  "playground.autocomplete.selectedCount": "{current} of {total} selected",
  "playground.autocomplete.navigationHint": "Use arrows to navigate, Tab/Enter to select, Esc to close.",
} as const;

type PlaygroundCommandAutocompleteMessageKey = keyof typeof enPlaygroundCommandAutocompleteMessages;

export const koPlaygroundCommandAutocompleteMessages: Record<PlaygroundCommandAutocompleteMessageKey, string> = {
  "playground.autocomplete.searching": "명령 검색 중...",
  "playground.autocomplete.selectedCount": "{current}/{total} 선택됨",
  "playground.autocomplete.navigationHint": "화살표 이동, Tab/Enter 선택, Esc 닫기",
};
