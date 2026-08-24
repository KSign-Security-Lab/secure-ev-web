"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalysisRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analysis/inspect-code");
  }, [router]);

  return null;
}
