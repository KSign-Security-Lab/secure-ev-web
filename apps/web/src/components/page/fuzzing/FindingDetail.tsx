"use client";

import React from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { Tag } from "~/components/common/Tag/Tag";
import type { FuzzingRun } from "~/types/fuzzing";
import { getRunResultColor, getRunResultLabel } from "~/utils/fuzzing.client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FindingDetailProps {
  run: FuzzingRun;
  onClose: () => void;
}

const formatContent = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 4);
  } catch {
    return content;
  }
};

export function FindingDetail({ run, onClose }: FindingDetailProps) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Interaction Details"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <div>
            <label className="text-sm text-neutral-400">Result</label>
            <div className="mt-1">
              <Tag
                label={getRunResultLabel(run.result)}
                color={getRunResultColor(run.result)}
                size="md"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm text-neutral-400">Input Payload</label>
          <div className="mt-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
             <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                wrapLongLines={true}
             >
                {formatContent(run.input)}
             </SyntaxHighlighter>
          </div>
        </div>

        <div>
          <label className="text-sm text-neutral-400">Output Response</label>
           <div className="mt-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
             <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                wrapLongLines={true}
             >
                {formatContent(run.output)}
             </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </Modal>
  );
}

