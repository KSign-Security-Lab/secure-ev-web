"use client";

import React, { useState } from "react";
import { SignatureList } from "./components/SignatureList";
import { SignatureDetailModal } from "./components/SignatureDetailModal";
import { Signature, mockSignatureDetails } from "./mockData";

export default function VulnDBPage() {
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (signature: Signature) => {
    setSelectedSignature(signature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Smooth transition: don't clear immediate to avoid visual jump
    setTimeout(() => {
        setSelectedSignature(null);
    }, 500);
  };

  const getDetailData = (sig: Signature | null) => {
    if (!sig) return null;
    return mockSignatureDetails[sig.id] || {
        ...sig,
        sid: `sid-auto-${sig.id}`,
        sinkStatement: "// Mock sink statement",
        bufferVsRequest: { capacity: 10, request: 12, unit: "bytes", details: "Mock details" },
        diagnostic: { class: "mock", taint: "mock", validation: { upper: false, lower: false } },
        codeContext: "// Mock code context",
        statementFlow: [],
        semanticTags: ["MOCK_TAG"]
    };
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 min-w-0 bg-base-950">
      {/* Main Content Section */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <SignatureList onSelect={handleSelect} />
      </div>

      {/* Detail Analysis Modal */}
      <SignatureDetailModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        data={getDetailData(selectedSignature)} 
      />
    </div>
  );
}

