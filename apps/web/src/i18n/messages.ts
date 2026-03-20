import {
  enNavigationMessages,
  koNavigationMessages,
} from "~/components/page/layout/SideBarLayout/messages";
import { enCommonMessages, koCommonMessages } from "~/components/common/messages";
import { enAnalysisMessages, koAnalysisMessages } from "~/app/analysis/messages";
import { enDashboardMessages, koDashboardMessages } from "~/app/dashboard/messages";
import { enAgentsMessages, koAgentsMessages } from "~/app/agents/messages";
import { enAbilitiesMessages, koAbilitiesMessages } from "~/app/abilities/messages";
import {
  enPlaygroundMessages,
  koPlaygroundMessages,
} from "~/app/playground/messages";
import { enFuzzingMessages, koFuzzingMessages } from "~/app/fuzzing/messages";

export const SUPPORTED_LOCALES = ["en", "ko"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const defaultLocale: Locale = "en";

const enMessages = {
  ...enNavigationMessages,
  ...enCommonMessages,
  ...enAnalysisMessages,
  ...enDashboardMessages,
  ...enAgentsMessages,
  ...enAbilitiesMessages,
  ...enPlaygroundMessages,
  ...enFuzzingMessages,
} as const;

export type TranslationKey = keyof typeof enMessages;

const koMessages: Record<TranslationKey, string> = {
  ...koNavigationMessages,
  ...koCommonMessages,
  ...koAnalysisMessages,
  ...koDashboardMessages,
  ...koAgentsMessages,
  ...koAbilitiesMessages,
  ...koPlaygroundMessages,
  ...koFuzzingMessages,
};

export const messages: Record<Locale, Record<TranslationKey, string>> = {
  en: enMessages,
  ko: koMessages,
};

export const isLocale = (value: string | null | undefined): value is Locale => {
  if (!value) {
    return false;
  }

  return SUPPORTED_LOCALES.includes(value as Locale);
};
