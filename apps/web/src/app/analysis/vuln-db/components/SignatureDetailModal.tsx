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
      disableDefaultStyles={true}
      className="max-w-7xl bg-slate-950 border border-slate-800 shadow-2xl p-0! overflow-hidden! m-0!"
    >
      <div 
        className="h-full overflow-hidden flex flex-col"
        style={{ height: '800px', maxHeight: '800px' }}
      >
        <SignatureDetail data={data} onClose={onClose} />
      </div>
    </Modal>
  );
}
