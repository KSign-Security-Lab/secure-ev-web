import { enFuzzingSharedMessages, koFuzzingSharedMessages } from "~/components/page/fuzzing/shared.messages";
import { enFuzzingLandingPageMessages, koFuzzingLandingPageMessages } from "~/app/fuzzing/page.messages";
import { enFuzzingJobsPageMessages, koFuzzingJobsPageMessages } from "~/app/fuzzing/jobs/page.messages";
import { enFuzzingJobDetailPageMessages, koFuzzingJobDetailPageMessages } from "~/app/fuzzing/jobs/[jobId]/page.messages";
import { enFuzzingJobSummaryMessages, koFuzzingJobSummaryMessages } from "~/components/page/fuzzing/JobSummary.messages";
import { enFuzzingConfigDownloadMessages, koFuzzingConfigDownloadMessages } from "~/components/page/fuzzing/ConfigDownload.messages";
import { enFuzzingCreateJobModalMessages, koFuzzingCreateJobModalMessages } from "~/components/page/fuzzing/CreateJobModal.messages";
import { enFuzzingFindingDetailMessages, koFuzzingFindingDetailMessages } from "~/components/page/fuzzing/FindingDetail.messages";
import { enFuzzingFindingsListMessages, koFuzzingFindingsListMessages } from "~/components/page/fuzzing/FindingsList.messages";
import { enFuzzingInterpretationMessages, koFuzzingInterpretationMessages } from "~/components/page/fuzzing/FuzzingInterpretation.messages";
import { enFuzzingInteractionLogTableMessages, koFuzzingInteractionLogTableMessages } from "~/components/page/fuzzing/InteractionLogTable.messages";
import { enFuzzingMessageSelectorMessages, koFuzzingMessageSelectorMessages } from "~/components/page/fuzzing/MessageSelector.messages";
import { enFuzzingRecentActivityChartMessages, koFuzzingRecentActivityChartMessages } from "~/components/page/fuzzing/RecentFuzzingActivityChart.messages";
import { enFuzzingRecentJobsMessages, koFuzzingRecentJobsMessages } from "~/components/page/fuzzing/RecentFuzzingJobs.messages";
import { enFuzzingRecentStatsMessages, koFuzzingRecentStatsMessages } from "~/components/page/fuzzing/RecentFuzzingStats.messages";
import { enFuzzingVulnerabilityChartsMessages, koFuzzingVulnerabilityChartsMessages } from "~/components/page/fuzzing/VulnerabilityCharts.messages";

export const enFuzzingMessages = {
  ...enFuzzingSharedMessages,
  ...enFuzzingLandingPageMessages,
  ...enFuzzingJobsPageMessages,
  ...enFuzzingJobDetailPageMessages,
  ...enFuzzingJobSummaryMessages,
  ...enFuzzingConfigDownloadMessages,
  ...enFuzzingCreateJobModalMessages,
  ...enFuzzingFindingDetailMessages,
  ...enFuzzingFindingsListMessages,
  ...enFuzzingInterpretationMessages,
  ...enFuzzingInteractionLogTableMessages,
  ...enFuzzingMessageSelectorMessages,
  ...enFuzzingRecentActivityChartMessages,
  ...enFuzzingRecentJobsMessages,
  ...enFuzzingRecentStatsMessages,
  ...enFuzzingVulnerabilityChartsMessages,
} as const;

type FuzzingMessageKey = keyof typeof enFuzzingMessages;

export const koFuzzingMessages: Record<FuzzingMessageKey, string> = {
  ...koFuzzingSharedMessages,
  ...koFuzzingLandingPageMessages,
  ...koFuzzingJobsPageMessages,
  ...koFuzzingJobDetailPageMessages,
  ...koFuzzingJobSummaryMessages,
  ...koFuzzingConfigDownloadMessages,
  ...koFuzzingCreateJobModalMessages,
  ...koFuzzingFindingDetailMessages,
  ...koFuzzingFindingsListMessages,
  ...koFuzzingInterpretationMessages,
  ...koFuzzingInteractionLogTableMessages,
  ...koFuzzingMessageSelectorMessages,
  ...koFuzzingRecentActivityChartMessages,
  ...koFuzzingRecentJobsMessages,
  ...koFuzzingRecentStatsMessages,
  ...koFuzzingVulnerabilityChartsMessages,
};
