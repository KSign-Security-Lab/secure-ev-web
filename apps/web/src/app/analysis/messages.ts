import { enAnalysisUploadViewMessages, koAnalysisUploadViewMessages } from "~/app/analysis/components/UploadView.messages";
import { enAnalysisLoadingViewMessages, koAnalysisLoadingViewMessages } from "~/app/analysis/components/LoadingView.messages";
import { enAnalysisResultsViewMessages, koAnalysisResultsViewMessages } from "~/app/analysis/components/ResultsView.messages";
import { enAnalysisCodeViewerMessages, koAnalysisCodeViewerMessages } from "~/app/analysis/components/CodeViewer.messages";
import { enAnalysisResultDetailMessages, koAnalysisResultDetailMessages } from "~/app/analysis/components/ResultDetail.messages";
import { enAnalysisExplainabilityPanelsMessages, koAnalysisExplainabilityPanelsMessages } from "~/app/analysis/components/ExplainabilityPanels.messages";
import { enAnalysisDFInfoCardsMessages, koAnalysisDFInfoCardsMessages } from "~/app/analysis/components/DFInfoCards.messages";
import { enAnalysisSimilarSignaturesMessages, koAnalysisSimilarSignaturesMessages } from "~/app/analysis/components/SimilarSignatures.messages";

export const enAnalysisMessages = {
  ...enAnalysisUploadViewMessages,
  ...enAnalysisLoadingViewMessages,
  ...enAnalysisResultsViewMessages,
  ...enAnalysisCodeViewerMessages,
  ...enAnalysisResultDetailMessages,
  ...enAnalysisExplainabilityPanelsMessages,
  ...enAnalysisDFInfoCardsMessages,
  ...enAnalysisSimilarSignaturesMessages,
} as const;

type AnalysisMessageKey = keyof typeof enAnalysisMessages;

export const koAnalysisMessages: Record<AnalysisMessageKey, string> = {
  ...koAnalysisUploadViewMessages,
  ...koAnalysisLoadingViewMessages,
  ...koAnalysisResultsViewMessages,
  ...koAnalysisCodeViewerMessages,
  ...koAnalysisResultDetailMessages,
  ...koAnalysisExplainabilityPanelsMessages,
  ...koAnalysisDFInfoCardsMessages,
  ...koAnalysisSimilarSignaturesMessages,
};
