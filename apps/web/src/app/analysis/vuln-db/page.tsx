"use client";

import React from "react";
import { Database } from "lucide-react";

export default function VulnDBPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full h-full text-gray-400">
      <Database size={64} className="mb-4 opacity-20" />
      <h1 className="text-2xl font-bold text-gray-100 mb-2">Vulnerability Database</h1>
      <p className="text-gray-500">Coming Soon</p>
    </div>
  );
}
