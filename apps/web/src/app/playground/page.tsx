"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlaygroundRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/playground/agents");
  }, [router]);

  return null;
}
