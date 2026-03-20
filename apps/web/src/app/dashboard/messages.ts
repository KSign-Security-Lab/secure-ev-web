import { enDashboardPageMessages, koDashboardPageMessages } from "~/app/page.messages";
import { enDashboardChartMessages, koDashboardChartMessages } from "~/components/dashboard/chart.messages";

export const enDashboardMessages = {
  ...enDashboardPageMessages,
  ...enDashboardChartMessages,
} as const;

type DashboardMessageKey = keyof typeof enDashboardMessages;

export const koDashboardMessages: Record<DashboardMessageKey, string> = {
  ...koDashboardPageMessages,
  ...koDashboardChartMessages,
};
