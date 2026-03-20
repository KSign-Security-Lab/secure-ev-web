"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";

interface LoadingViewProps {
  onComplete: () => void;
}

export default function LoadingView({ onComplete }: LoadingViewProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const messages = [
    t("analysis.loading.step.initializing"),
    t("analysis.loading.step.parsing"),
    t("analysis.loading.step.cfg"),
    t("analysis.loading.step.df"),
    t("analysis.loading.step.signatures"),
    t("analysis.loading.step.report"),
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
            {t("analysis.loading.title")}
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
          {t("analysis.loading.hint")}
        </p>
      </div>
    </div>
  );
}
