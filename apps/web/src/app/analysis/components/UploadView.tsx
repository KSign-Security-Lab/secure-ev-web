"use client";

import React, { useState } from "react";
import { UploadCloud, File as FileIcon, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface UploadViewProps {
  onStartAnalysis: () => void;
}

export default function UploadView({ onStartAnalysis }: UploadViewProps) {
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);

  const handleMockUpload = () => {
    setFiles([
      ...files,
      { name: "src/parser/network.c", size: "14.2 KB" },
      { name: "src/core/registry.c", size: "8.1 KB" },
    ]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto h-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Analysis Workspace</h1>
        <p className="text-gray-400">Upload source code files to begin</p>
      </div>

      <div
        className="w-full border-2 border-dashed border-gray-600 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={handleMockUpload}
      >
        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-300 font-medium">Click to browse or drag and drop files here</p>
        <p className="text-gray-500 text-sm mt-1">.c, .cpp, .h, .py, .js</p>
      </div>

      {files.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-3">Uploaded Files</h3>
          <div className="space-y-2 mb-6">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-200">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={onStartAnalysis}>
              Run Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
