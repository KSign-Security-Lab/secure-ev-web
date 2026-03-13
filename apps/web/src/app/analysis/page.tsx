"use client";

import React, { useState } from "react";
import UploadView from "./components/UploadView";
import LoadingView from "./components/LoadingView";
import ResultsView from "./components/ResultsView";

export type ViewState = "upload" | "loading" | "results";

export default function AnalysisWorkspacePage() {
  const [viewState, setViewState] = useState<ViewState>("upload");

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-100px)] p-6 gap-6">
      {viewState === "upload" && (
        <UploadView onStartAnalysis={() => setViewState("loading")} />
      )}
      {viewState === "loading" && (
        <LoadingView onComplete={() => setViewState("results")} />
      )}
      {viewState === "results" && <ResultsView />}
    </div>
  );
}
