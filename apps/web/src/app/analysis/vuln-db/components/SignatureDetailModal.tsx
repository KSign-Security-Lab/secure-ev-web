"use client";

import React from "react";
import { Modal } from "~/components/common/Modal/Modal";
import { SignatureDetail } from "./SignatureDetail";
import { SignatureDetail as SignatureDetailType } from "../mockData";

interface SignatureDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: SignatureDetailType | null;
}

export function SignatureDetailModal({ open, onClose, data }: SignatureDetailModalProps) {
  if (!data) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={"Signature Analysis Detail"}
      className="lg:max-w-[1200px]"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-sm font-bold transition-all text-white shadow-lg shadow-blue-500/10"
            onClick={() => {
                // Future: Implement save or export
                onClose();
            }}
          >
            Export Report
          </button>
          <button
            className="bg-base-800 hover:bg-neutral-500 px-6 py-2 rounded text-sm font-bold transition-all text-white border border-base-850"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="custom-scrollbar overflow-y-auto max-h-[70vh] pr-2">
        <SignatureDetail data={data} onBack={onClose} />
      </div>
    </Modal>
  );
}
