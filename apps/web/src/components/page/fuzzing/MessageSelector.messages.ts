export const enFuzzingMessageSelectorMessages = {
  "fuzzing.messageSelector.selectMessages": "Select Messages",
  "fuzzing.messageSelector.selectAll": "Select All",
  "fuzzing.messageSelector.deselectAll": "Deselect All",
  "fuzzing.messageSelector.selectedCount": "{count} selected",
  "fuzzing.messageSelector.totalMessages": "{count} total messages",
} as const;

type FuzzingMessageSelectorMessageKey = keyof typeof enFuzzingMessageSelectorMessages;

export const koFuzzingMessageSelectorMessages: Record<FuzzingMessageSelectorMessageKey, string> = {
  "fuzzing.messageSelector.selectMessages": "메시지 선택",
  "fuzzing.messageSelector.selectAll": "전체 선택",
  "fuzzing.messageSelector.deselectAll": "전체 해제",
  "fuzzing.messageSelector.selectedCount": "{count}개 선택됨",
  "fuzzing.messageSelector.totalMessages": "총 메시지 {count}개",
};
