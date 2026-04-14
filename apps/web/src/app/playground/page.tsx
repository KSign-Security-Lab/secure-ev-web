"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlaygroundRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/playground/agent-terminal");
  }, [router]);

  return null;
}
