"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, FileDown } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { useToast } from "~/components/ToastProvider/ToastProvider";
import {
  copyText,
  downloadTextFile,
  highlightLanguage,
  normalizeScript,
  scriptFilename,
} from "~/utils/deployCommand";
import { PLATFORM_GLYPHS } from "./platformIcons";

interface CommandBlockProps {
  platform: string;
  executor: string;
  description: string;
  /** Already substituted, ready to run. */
  command: string;
  /** Fired the first time the operator takes the command away. */
  onCommandTaken?: () => void;
}

export const CommandBlock: React.FC<CommandBlockProps> = ({
  platform,
  executor,
  description,
  command,
  onCommandTaken,
}) => {
  const { t } = useI18n();
  const showToast = useToast();
  const [copied, setCopied] = React.useState(false);
  const Glyph = PLATFORM_GLYPHS[platform];

  const handleCopy = async () => {
    const ok = await copyText(command);
    if (!ok) {
      showToast(t("deploy.command.copyFailed"), { type: "error" });
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast(t("deploy.command.copied"), { type: "success" });
    onCommandTaken?.();
  };

  const handleDownloadScript = () => {
    const filename = scriptFilename(platform, executor);
    downloadTextFile(filename, normalizeScript(command, executor));
    showToast(t("deploy.command.scriptDownloaded", { filename }), {
      type: "success",
    });
    onCommandTaken?.();
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-950 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-2 min-w-0">
          {Glyph && <Glyph className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 shrink-0">
            {executor}
          </span>
          <span className="truncate text-xs text-neutral-400">{description}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleDownloadScript}
            className="flex items-center gap-1.5 h-7 px-2 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <FileDown size={13} />
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
              {t("deploy.command.downloadScript")}
            </span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 h-7 px-2 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            {copied ? (
              <Check size={13} className="text-green-500" />
            ) : (
              <Copy size={13} />
            )}
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
              {copied ? t("deploy.command.copiedShort") : t("deploy.command.copy")}
            </span>
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={highlightLanguage(executor)}
        style={vscDarkPlus}
        wrapLongLines
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "12px",
          lineHeight: "1.7",
        }}
        codeTagProps={{ className: "font-mono" }}
      >
        {command}
      </SyntaxHighlighter>
    </div>
  );
};
