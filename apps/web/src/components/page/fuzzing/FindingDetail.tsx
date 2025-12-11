"use client";

import React from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { Tag, TAG_COLOR_MAP } from "~/components/common/Tag/Tag";
import type { FuzzingFinding } from "~/types/fuzzing";
import {
  getSeverityColor,
  getCategoryLabel,
} from "~/server/trpc/utils/fuzzing";

interface FindingDetailProps {
  finding: FuzzingFinding;
  onClose: () => void;
}

export function FindingDetail({ finding, onClose }: FindingDetailProps) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Finding Details"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        <div>
          <label className="text-sm text-neutral-400">Title</label>
          <h3 className="text-xl font-bold text-white mt-1">{finding.title}</h3>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="text-sm text-neutral-400">Severity</label>
            <div className="mt-1">
              <Tag
                label={finding.severity.toUpperCase()}
                color={getSeverityColor(finding.severity)}
                size="md"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-400">Category</label>
            <p className="text-white font-medium mt-1">
              {getCategoryLabel(finding.category)}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm text-neutral-400">Description</label>
          <p className="text-white mt-1 whitespace-pre-wrap">
            {finding.description}
          </p>
        </div>

        {finding.evidence && (
          <div>
            <label className="text-sm text-neutral-400">Evidence</label>
            <div className="mt-1 bg-base-800 p-4 rounded border border-base-700">
              <pre className="text-sm text-neutral-200 whitespace-pre-wrap font-mono">
                {finding.evidence}
              </pre>
            </div>
          </div>
        )}

        {finding.affectedMessages && finding.affectedMessages.length > 0 && (
          <div>
            <label className="text-sm text-neutral-400">Affected Messages</label>
            <ul className="mt-1 space-y-1">
              {finding.affectedMessages.map((msg, idx) => (
                <li key={idx} className="text-white bg-base-800 p-2 rounded">
                  {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {finding.recommendation && (
          <div>
            <label className="text-sm text-neutral-400">Recommendation</label>
            <div className="mt-1 bg-green-500/10 border border-green-500/50 p-4 rounded">
              <p className="text-green-300 whitespace-pre-wrap">
                {finding.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

