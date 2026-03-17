"use client";

import React, { useState } from "react";
import UploadView from "./components/UploadView";
import LoadingView from "./components/LoadingView";
import ResultsView from "./components/ResultsView";
import type { MockFile } from "./components/mockData";

export type ViewState = "upload" | "loading" | "results";

export default function AnalysisWorkspacePage() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<MockFile[]>([]);

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-100px)] p-6 gap-6">
      {viewState === "upload" && (
        <UploadView onStartAnalysis={(files) => { setUploadedFiles(files); setViewState("loading"); }} />
      )}
      {viewState === "loading" && (
        <LoadingView onComplete={() => setViewState("results")} />
      )}
      {viewState === "results" && <ResultsView uploadedFiles={uploadedFiles} />}
    </div>
  );
}
