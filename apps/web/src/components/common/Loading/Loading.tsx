"use client";

import React from "react";

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Custom Spinner */}
        <div className="spinner w-12 h-12"></div>

        {/* Loading Text */}
        <span className="text-sm font-medium text-neutral-500">{text}</span>
      </div>

      <style jsx>{`
        .spinner {
          border: 4px solid #2563eb; /* blue-600 */
          border-top: 4px solid transparent;
          border-radius: 9999px;
          width: 48px;
          height: 48px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
