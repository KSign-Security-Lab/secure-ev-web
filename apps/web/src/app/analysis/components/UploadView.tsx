
"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, Trash2, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MockFile } from "./mockData";
import JSZip from "jszip";

interface UploadViewProps {
  onStartAnalysis: (files: MockFile[]) => void;
}

const ALLOWED_EXTENSIONS = ['.c', '.cpp', '.cc', '.h', '.hpp', '.java'];

export default function UploadView({ onStartAnalysis }: UploadViewProps) {
  const [files, setFiles] = useState<MockFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidExtension = (filename: string) => {
    return ALLOWED_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const processFile = async (file: File) => {
    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);
        const newMockFiles: MockFile[] = [];

        for (const [relativePath, zipEntry] of Object.entries(zipData.files)) {
          if (!zipEntry.dir && isValidExtension(relativePath)) {
            const content = await zipEntry.async("string");
            newMockFiles.push({
              path: relativePath,
              content: content,
              type: "source"
            });
          }
        }

        if (newMockFiles.length === 0) {
           setError("The ZIP archive did not contain any valid C/C++/Java source files.");
        } else {
           setFiles(prev => [...prev, ...newMockFiles]);
           setError(null);
        }
      } catch {
        setError("Failed to extract ZIP archive.");
      }
    } else if (isValidExtension(file.name)) {
       const text = await file.text();
       setFiles(prev => [...prev, {
         path: file.name,
         content: text,
         type: "source"
       }]);
       setError(null);
    } else {
       setError(`File type not allowed: ${file.name}. Only C/C++/Java files and ZIPs are supported.`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        await processFile(e.target.files[i]);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto h-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Analysis Workspace</h1>
        <p className="text-[#8b949e]">Upload source code files to begin</p>
      </div>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".c,.cpp,.cc,.h,.hpp,.java,.zip"
      />

      <div
        className="w-full border-2 border-dashed border-[#8b949e] rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-12 h-12 text-[#8b949e] mb-4" />
        <p className="text-[#8b949e] font-medium">Click to browse or drag and drop files here</p>
        <p className="text-[#8b949e] text-sm mt-1">.c, .cpp, .java or .zip archives</p>
      </div>

      {error && (
        <div className="w-full p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-md flex items-center gap-3">
           <AlertCircle className="w-5 h-5 shrink-0" />
           <p className="text-sm">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-3">Uploaded Files</h3>
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-[#21262d] rounded-md border border-[#30363d]"
              >
                <div className="flex items-center space-x-3 truncate mr-4">
                  <FileIcon className="w-5 h-5 text-[#79c0ff] shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium text-[#c9d1d9] truncate">{file.path}</p>
                    <p className="text-xs text-[#8b949e]">{formatSize(file.content?.length || 0)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 shrink-0 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-[#ff7b72] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => onStartAnalysis(files)}>
              Run Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
