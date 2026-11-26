"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The terminal now lives inside the Agents page (select an agent to open it),
 * so this standalone route just forwards there for any old links/bookmarks.
 */
export default function AgentTerminalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/playground/agents");
  }, [router]);

  return null;
}
