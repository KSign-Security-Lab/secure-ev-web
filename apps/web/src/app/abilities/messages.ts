import { enAbilitiesPageMessages, koAbilitiesPageMessages } from "~/app/abilities/page.messages";
import { enAbilitiesTableMessages, koAbilitiesTableMessages } from "~/components/page/abilities/AbilitiesTable.messages";
import { enAbilityModalMessages, koAbilityModalMessages } from "~/components/page/abilities/AbilityModal/AbilityModal.messages";
import { enAbilityModalGeneralTabMessages, koAbilityModalGeneralTabMessages } from "~/components/page/abilities/AbilityModal/GeneralTab.messages";
import { enAbilityModalExecutorsTabMessages, koAbilityModalExecutorsTabMessages } from "~/components/page/abilities/AbilityModal/ExecutorsTab.messages";
import { enAbilityModalRequirementTabMessages, koAbilityModalRequirementTabMessages } from "~/components/page/abilities/AbilityModal/RequirementTab.messages";
import { enAbilityModalConfigurationTabMessages, koAbilityModalConfigurationTabMessages } from "~/components/page/abilities/AbilityModal/ConfigurationTab.messages";

export const enAbilitiesMessages = {
  ...enAbilitiesPageMessages,
  ...enAbilitiesTableMessages,
  ...enAbilityModalMessages,
  ...enAbilityModalGeneralTabMessages,
  ...enAbilityModalExecutorsTabMessages,
  ...enAbilityModalRequirementTabMessages,
  ...enAbilityModalConfigurationTabMessages,
} as const;

type AbilitiesMessageKey = keyof typeof enAbilitiesMessages;

export const koAbilitiesMessages: Record<AbilitiesMessageKey, string> = {
  ...koAbilitiesPageMessages,
  ...koAbilitiesTableMessages,
  ...koAbilityModalMessages,
  ...koAbilityModalGeneralTabMessages,
  ...koAbilityModalExecutorsTabMessages,
  ...koAbilityModalRequirementTabMessages,
  ...koAbilityModalConfigurationTabMessages,
};
