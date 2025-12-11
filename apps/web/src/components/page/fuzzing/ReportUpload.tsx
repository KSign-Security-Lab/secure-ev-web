"use client";

import React, { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";

interface ReportUploadProps {
  jobId: string;
  onUploadSuccess?: () => void;
}

import trpc from "~/lib/trpc";

export function ReportUpload({ jobId, onUploadSuccess }: ReportUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize mutation
  // const uploadMutation = trpc.fuzzing.uploadReport.useMutation(); // Not available on proxy client

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        !selectedFile.type.includes("json") &&
        !selectedFile.name.endsWith(".json")
      ) {
        setError("File must be a JSON file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Read file content
      const text = await file.text();
      let jsonContent;
      try {
        jsonContent = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON file content");
      }

      await trpc.fuzzing.uploadReport.mutate({
        jobId,
        report: jsonContent,
      });

      setSuccess(true);
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to upload report"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Select Report File (JSON)
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="w-full bg-slate-950 p-2 rounded-lg border border-slate-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer hover:border-slate-600 transition-colors"
          />
          <p className="text-xs text-neutral-400 mt-1">
            Maximum file size: 10MB
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded p-3">
            <p className="text-sm text-green-300">
              Report uploaded successfully!
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload Report"}
        </button>
      </div>
    </div>
  );
}

