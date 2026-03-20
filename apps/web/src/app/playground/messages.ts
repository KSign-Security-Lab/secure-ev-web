import { enPlaygroundPageMessages, koPlaygroundPageMessages } from "~/app/playground/page.messages";
import { enPlaygroundPageHeaderMessages, koPlaygroundPageHeaderMessages } from "~/components/page/playground/PageHeader.messages";
import { enPlaygroundConnectionPillMessages, koPlaygroundConnectionPillMessages } from "~/components/page/playground/ConnectionPill.messages";
import { enPlaygroundSessionsListMessages, koPlaygroundSessionsListMessages } from "~/components/page/playground/SessionsList.messages";
import { enPlaygroundSystemLogPanelMessages, koPlaygroundSystemLogPanelMessages } from "~/components/page/playground/SystemLogPanel.messages";
import { enPlaygroundCommandFilterDropdownMessages, koPlaygroundCommandFilterDropdownMessages } from "~/components/page/playground/CommandFilterDropdown.messages";
import { enPlaygroundCommandAutocompleteMessages, koPlaygroundCommandAutocompleteMessages } from "~/components/page/playground/Terminal/CommandAutocomplete.messages";
import { enPlaygroundTerminalMessages, koPlaygroundTerminalMessages } from "~/components/page/playground/Terminal/Terminal.messages";

export const enPlaygroundMessages = {
  ...enPlaygroundPageMessages,
  ...enPlaygroundPageHeaderMessages,
  ...enPlaygroundConnectionPillMessages,
  ...enPlaygroundSessionsListMessages,
  ...enPlaygroundSystemLogPanelMessages,
  ...enPlaygroundCommandFilterDropdownMessages,
  ...enPlaygroundCommandAutocompleteMessages,
  ...enPlaygroundTerminalMessages,
} as const;

type PlaygroundMessageKey = keyof typeof enPlaygroundMessages;

export const koPlaygroundMessages: Record<PlaygroundMessageKey, string> = {
  ...koPlaygroundPageMessages,
  ...koPlaygroundPageHeaderMessages,
  ...koPlaygroundConnectionPillMessages,
  ...koPlaygroundSessionsListMessages,
  ...koPlaygroundSystemLogPanelMessages,
  ...koPlaygroundCommandFilterDropdownMessages,
  ...koPlaygroundCommandAutocompleteMessages,
  ...koPlaygroundTerminalMessages,
};
