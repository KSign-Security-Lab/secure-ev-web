"use client";

import React, { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";

export function ConfigDownload() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  // Placeholder binary URL - in production this would be a real endpoint
  const downloadUrl = "/downloads/fuzzer";
  const fileName = "fuzzer";

  const command = `./fuzzer`;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <a
            href={downloadUrl}
            download={fileName}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition w-full justify-center"
          >
            <Download size={16} />
            {t("fuzzing.configDownload.button")}
          </a>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3">
            {t("fuzzing.configDownload.instructionsTitle")}
          </h3>
          
          <div className="space-y-4 text-sm text-slate-300">
             <p>
                <span className="font-bold text-white mr-2">1.</span> 
                {t("fuzzing.configDownload.step1", { binary: fileName })}
             </p>

             <div>
                <p className="mb-2">
                   <span className="font-bold text-white mr-2">2.</span> 
                   {t("fuzzing.configDownload.step2")}
                </p>
                <div className="bg-slate-950 p-3 rounded font-mono text-sm text-white flex items-center justify-between border border-slate-800 ml-5">
                    <code className="flex-1 overflow-x-auto">chmod +x fuzzer && {command}</code>
                    <button
                      onClick={() => {
                         navigator.clipboard.writeText("chmod +x fuzzer && ./fuzzer");
                         setCopied(true);
                         setTimeout(() => setCopied(false), 2000);
                      }}
                      className="ml-2 p-1 hover:bg-slate-800 rounded transition shrink-0"
                      title={t("fuzzing.configDownload.copyCommand")}
                    >
                      {copied ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-slate-400" />
                      )}
                    </button>
                </div>
             </div>

             <p>
                <span className="font-bold text-white mr-2">3.</span> 
                {t("fuzzing.configDownload.step3", { file: "report.json" })}
             </p>

             <p>
                 <span className="font-bold text-white mr-2">4.</span> 
                 {t("fuzzing.configDownload.step4", { file: "report.json" })}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
