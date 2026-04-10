import { enNavigationMessages, koNavigationMessages } from "~/components/page/layout/SideBarLayout/messages";
import { enVulnDBMessages, koVulnDBMessages } from "~/app/analysis/vuln-db/vuln-db.messages";
import { enCommonMessages, koCommonMessages } from "~/components/common/messages";
import { enAbilitiesPageMessages, koAbilitiesPageMessages } from "~/app/playground/abilities/page.messages";
import { enAnalysisCodeViewerMessages, koAnalysisCodeViewerMessages } from "~/app/analysis/components/CodeViewer.messages";
import { enAnalysisDFInfoCardsMessages, koAnalysisDFInfoCardsMessages } from "~/app/analysis/components/DFInfoCards.messages";
import { enAnalysisExplainabilityPanelsMessages, koAnalysisExplainabilityPanelsMessages } from "~/app/analysis/components/ExplainabilityPanels.messages";
import { enAnalysisLoadingViewMessages, koAnalysisLoadingViewMessages } from "~/app/analysis/components/LoadingView.messages";
import { enAnalysisResultDetailMessages, koAnalysisResultDetailMessages } from "~/app/analysis/components/ResultDetail.messages";
import { enAnalysisResultsViewMessages, koAnalysisResultsViewMessages } from "~/app/analysis/components/ResultsView.messages";
import { enAnalysisSimilarSignaturesMessages, koAnalysisSimilarSignaturesMessages } from "~/app/analysis/components/SimilarSignatures.messages";
import { enAnalysisUploadViewMessages, koAnalysisUploadViewMessages } from "~/app/analysis/components/UploadView.messages";
import { enFuzzingJobDetailPageMessages, koFuzzingJobDetailPageMessages } from "~/app/fuzzing/jobs/[jobId]/page.messages";
import { enFuzzingJobsPageMessages, koFuzzingJobsPageMessages } from "~/app/fuzzing/jobs/page.messages";
import { enFuzzingLandingPageMessages, koFuzzingLandingPageMessages } from "~/app/fuzzing/page.messages";
import { enDashboardPageMessages, koDashboardPageMessages } from "~/app/page.messages";
import { enAgentsPageMessages, koAgentsPageMessages } from "~/app/playground/agents/page.messages";
import { enPlaygroundPageMessages, koPlaygroundPageMessages } from "~/app/playground/connect-agent/page.messages";
import { enDashboardChartMessages, koDashboardChartMessages } from "~/components/dashboard/chart.messages";
import { enAbilitiesTableMessages, koAbilitiesTableMessages } from "~/components/page/abilities/AbilitiesTable.messages";
import { enAbilityModalMessages, koAbilityModalMessages } from "~/components/page/abilities/AbilityModal/AbilityModal.messages";
import { enAbilityModalConfigurationTabMessages, koAbilityModalConfigurationTabMessages } from "~/components/page/abilities/AbilityModal/ConfigurationTab.messages";
import { enAbilityModalExecutorsTabMessages, koAbilityModalExecutorsTabMessages } from "~/components/page/abilities/AbilityModal/ExecutorsTab.messages";
import { enAbilityModalGeneralTabMessages, koAbilityModalGeneralTabMessages } from "~/components/page/abilities/AbilityModal/GeneralTab.messages";
import { enAbilityModalRequirementTabMessages, koAbilityModalRequirementTabMessages } from "~/components/page/abilities/AbilityModal/RequirementTab.messages";
import { enAgentsTableMessages, koAgentsTableMessages } from "~/components/page/agents/AgentsTable.messages";
import { enFuzzingConfigDownloadMessages, koFuzzingConfigDownloadMessages } from "~/components/page/fuzzing/ConfigDownload.messages";
import { enFuzzingCreateJobModalMessages, koFuzzingCreateJobModalMessages } from "~/components/page/fuzzing/CreateJobModal.messages";
import { enFuzzingFindingDetailMessages, koFuzzingFindingDetailMessages } from "~/components/page/fuzzing/FindingDetail.messages";
import { enFuzzingFindingsListMessages, koFuzzingFindingsListMessages } from "~/components/page/fuzzing/FindingsList.messages";
import { enFuzzingInterpretationMessages, koFuzzingInterpretationMessages } from "~/components/page/fuzzing/FuzzingInterpretation.messages";
import { enFuzzingInteractionLogTableMessages, koFuzzingInteractionLogTableMessages } from "~/components/page/fuzzing/InteractionLogTable.messages";
import { enFuzzingJobSummaryMessages, koFuzzingJobSummaryMessages } from "~/components/page/fuzzing/JobSummary.messages";
import { enFuzzingMessageSelectorMessages, koFuzzingMessageSelectorMessages } from "~/components/page/fuzzing/MessageSelector.messages";
import { enFuzzingRecentActivityChartMessages, koFuzzingRecentActivityChartMessages } from "~/components/page/fuzzing/RecentFuzzingActivityChart.messages";
import { enFuzzingRecentJobsMessages, koFuzzingRecentJobsMessages } from "~/components/page/fuzzing/RecentFuzzingJobs.messages";
import { enFuzzingRecentStatsMessages, koFuzzingRecentStatsMessages } from "~/components/page/fuzzing/RecentFuzzingStats.messages";
import { enFuzzingVulnerabilityChartsMessages, koFuzzingVulnerabilityChartsMessages } from "~/components/page/fuzzing/VulnerabilityCharts.messages";
import { enFuzzingSharedMessages, koFuzzingSharedMessages } from "~/components/page/fuzzing/shared.messages";
import { enPlaygroundCommandFilterDropdownMessages, koPlaygroundCommandFilterDropdownMessages } from "~/components/page/playground/CommandFilterDropdown.messages";
import { enPlaygroundConnectionPillMessages, koPlaygroundConnectionPillMessages } from "~/components/page/playground/ConnectionPill.messages";
import { enPlaygroundPageHeaderMessages, koPlaygroundPageHeaderMessages } from "~/components/page/playground/PageHeader.messages";
import { enPlaygroundSessionsListMessages, koPlaygroundSessionsListMessages } from "~/components/page/playground/SessionsList.messages";
import { enPlaygroundSystemLogPanelMessages, koPlaygroundSystemLogPanelMessages } from "~/components/page/playground/SystemLogPanel.messages";
import { enPlaygroundCommandAutocompleteMessages, koPlaygroundCommandAutocompleteMessages } from "~/components/page/playground/Terminal/CommandAutocomplete.messages";
import { enPlaygroundTerminalMessages, koPlaygroundTerminalMessages } from "~/components/page/playground/Terminal/Terminal.messages";

export const SUPPORTED_LOCALES = ["en", "ko"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const defaultLocale: Locale = "en";

const enMessages = {
  ...enNavigationMessages,
  ...enVulnDBMessages,
  ...enCommonMessages,
  ...enAbilitiesPageMessages,
  ...enAnalysisCodeViewerMessages,
  ...enAnalysisDFInfoCardsMessages,
  ...enAnalysisExplainabilityPanelsMessages,
  ...enAnalysisLoadingViewMessages,
  ...enAnalysisResultDetailMessages,
  ...enAnalysisResultsViewMessages,
  ...enAnalysisSimilarSignaturesMessages,
  ...enAnalysisUploadViewMessages,
  ...enFuzzingJobDetailPageMessages,
  ...enFuzzingJobsPageMessages,
  ...enFuzzingLandingPageMessages,
  ...enDashboardPageMessages,
  ...enAgentsPageMessages,
  ...enPlaygroundPageMessages,
  ...enDashboardChartMessages,
  ...enAbilitiesTableMessages,
  ...enAbilityModalMessages,
  ...enAbilityModalConfigurationTabMessages,
  ...enAbilityModalExecutorsTabMessages,
  ...enAbilityModalGeneralTabMessages,
  ...enAbilityModalRequirementTabMessages,
  ...enAgentsTableMessages,
  ...enFuzzingConfigDownloadMessages,
  ...enFuzzingCreateJobModalMessages,
  ...enFuzzingFindingDetailMessages,
  ...enFuzzingFindingsListMessages,
  ...enFuzzingInterpretationMessages,
  ...enFuzzingInteractionLogTableMessages,
  ...enFuzzingJobSummaryMessages,
  ...enFuzzingMessageSelectorMessages,
  ...enFuzzingRecentActivityChartMessages,
  ...enFuzzingRecentJobsMessages,
  ...enFuzzingRecentStatsMessages,
  ...enFuzzingVulnerabilityChartsMessages,
  ...enFuzzingSharedMessages,
  ...enPlaygroundCommandFilterDropdownMessages,
  ...enPlaygroundConnectionPillMessages,
  ...enPlaygroundPageHeaderMessages,
  ...enPlaygroundSessionsListMessages,
  ...enPlaygroundSystemLogPanelMessages,
  ...enPlaygroundCommandAutocompleteMessages,
  ...enPlaygroundTerminalMessages,
} as const;

export type TranslationKey = keyof typeof enMessages;

const koMessages: Record<TranslationKey, string> = {
  ...koNavigationMessages,
  ...koVulnDBMessages,
  ...koCommonMessages,
  ...koAbilitiesPageMessages,
  ...koAnalysisCodeViewerMessages,
  ...koAnalysisDFInfoCardsMessages,
  ...koAnalysisExplainabilityPanelsMessages,
  ...koAnalysisLoadingViewMessages,
  ...koAnalysisResultDetailMessages,
  ...koAnalysisResultsViewMessages,
  ...koAnalysisSimilarSignaturesMessages,
  ...koAnalysisUploadViewMessages,
  ...koFuzzingJobDetailPageMessages,
  ...koFuzzingJobsPageMessages,
  ...koFuzzingLandingPageMessages,
  ...koDashboardPageMessages,
  ...koAgentsPageMessages,
  ...koPlaygroundPageMessages,
  ...koDashboardChartMessages,
  ...koAbilitiesTableMessages,
  ...koAbilityModalMessages,
  ...koAbilityModalConfigurationTabMessages,
  ...koAbilityModalExecutorsTabMessages,
  ...koAbilityModalGeneralTabMessages,
  ...koAbilityModalRequirementTabMessages,
  ...koAgentsTableMessages,
  ...koFuzzingConfigDownloadMessages,
  ...koFuzzingCreateJobModalMessages,
  ...koFuzzingFindingDetailMessages,
  ...koFuzzingFindingsListMessages,
  ...koFuzzingInterpretationMessages,
  ...koFuzzingInteractionLogTableMessages,
  ...koFuzzingJobSummaryMessages,
  ...koFuzzingMessageSelectorMessages,
  ...koFuzzingRecentActivityChartMessages,
  ...koFuzzingRecentJobsMessages,
  ...koFuzzingRecentStatsMessages,
  ...koFuzzingVulnerabilityChartsMessages,
  ...koFuzzingSharedMessages,
  ...koPlaygroundCommandFilterDropdownMessages,
  ...koPlaygroundConnectionPillMessages,
  ...koPlaygroundPageHeaderMessages,
  ...koPlaygroundSessionsListMessages,
  ...koPlaygroundSystemLogPanelMessages,
  ...koPlaygroundCommandAutocompleteMessages,
  ...koPlaygroundTerminalMessages,
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
