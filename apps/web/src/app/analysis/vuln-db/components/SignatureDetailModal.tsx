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
      hideHeader={true}
      className="lg:max-w-6xl h-[94vh] p-0 border-none shadow-none bg-base-950"
    >
      <div className="h-full overflow-hidden">
        <SignatureDetail data={data} onClose={onClose} />
      </div>
    </Modal>
  );
}
