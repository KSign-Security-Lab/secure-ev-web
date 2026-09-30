"use client";

import React, { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { useLocalI18n } from "~/i18n/I18nProvider";
import { reportUploadMessages } from "./ReportUpload.messages";

interface ReportUploadProps {
  jobId: string;
  onUploadSuccess?: () => void;
}

import trpc from "~/lib/trpc";

export function ReportUpload({ jobId, onUploadSuccess }: ReportUploadProps) {
  const t = useLocalI18n(reportUploadMessages);

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
        setError(t("fileMustBeJson"));
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError(t("fileTooLarge"));
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError(t("selectFile"));
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Read file content
      const fileContent = await file.text();
      let jsonContent;
      try {
        jsonContent = JSON.parse(fileContent);
      } catch {
        throw new Error(t("invalidJson"));
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
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        err instanceof Error ? err.message : t("uploadFailed")
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-900">
            {t("selectReport")}
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="w-full bg-neutral-50 p-2 rounded-lg border border-neutral-200 text-neutral-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer hover:border-neutral-300 transition-colors"
          />
          <p className="text-xs text-neutral-400 mt-1">
            {t("maxSize")}
          </p>
        </div>

        {error && (
          <div className="border border-rose-300 bg-rose-50 rounded p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-700 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="border border-green-300 bg-green-50 rounded p-3">
            <p className="text-sm text-green-700">
              {t("uploadSuccess")}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
        >
          <Upload size={16} />
          {uploading ? t("uploading") : t("uploadReport")}
        </button>
      </div>
    </div>
  );
}
