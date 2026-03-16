"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingViewProps {
  onComplete: () => void;
}

export default function LoadingView({ onComplete }: LoadingViewProps) {
  const [step, setStep] = useState(0);
  const messages = [
    "Initializing analysis engines...",
    "Parsing Abstract Syntax Trees (AST)...",
    "Constructing Control Flow Graphs (CFG)...",
    "Running Data Flow (DF) analysis...",
    "Extracting similarity signatures...",
    "Generating report and evidence...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [messages.length, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh]">
      <div className="flex flex-col items-center space-y-6">
        <Loader2 className="w-16 h-16 text-[#58a6ff] animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-[#c9d1d9]">
            Analyzing Codebase
          </h2>
          <div className="h-6">
            <p className="text-[#79c0ff] font-medium animate-pulse">
              {messages[step]}
            </p>
          </div>
        </div>

        <div className="w-64 bg-[#21262d] rounded-full h-2 mt-8 overflow-hidden">
          <div
            className="bg-blue-500 h-2 transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, (step / messages.length) * 100)}%` }}
          />
        </div>

        <p className="text-xs text-[#8b949e] mt-4">
          This may take a few moments depending on codebase size...
        </p>
      </div>
    </div>
  );
}
