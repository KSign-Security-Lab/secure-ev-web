"use client";

import React from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { Tag } from "~/components/common/Tag/Tag";
import type { FuzzingRun } from "~/types/fuzzing";
import { getRunResultColor, getRunResultLabel } from "~/utils/fuzzing.client";

interface FindingDetailProps {
  run: FuzzingRun;
  onClose: () => void;
}

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
          <div className="mt-1 bg-slate-900 border border-slate-700 p-4 rounded-lg overflow-x-auto">
             <pre className="text-sm font-mono text-blue-300 whitespace-pre-wrap break-all">
                {run.input}
             </pre>
          </div>
        </div>

        <div>
          <label className="text-sm text-neutral-400">Output Response</label>
           <div className="mt-1 bg-slate-900 border border-slate-700 p-4 rounded-lg overflow-x-auto">
             <pre className="text-sm font-mono text-green-300 whitespace-pre-wrap break-all">
                {run.output}
             </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
}

