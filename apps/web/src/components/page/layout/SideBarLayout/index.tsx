"use client";

import React from "react";
import {
  FlaskConical,
  Gauge,
  Zap,
  SearchCode,
  Terminal,
  Users,
  Database,
  ClipboardCheck,
  Plug,
} from "lucide-react";
import { AppTopBar, MenuItemType } from "../TopBar/AppTopBar";
import { usePathname } from "next/navigation";
import { useI18n } from "~/i18n/I18nProvider";

export default function SideBarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();

  const menuItems: MenuItemType[] = [
    { name: t("menu.dashboard"), icon: <Gauge />, url: "/" },
    { name: t("menu.fuzzing"), icon: <Zap />, url: "/fuzzing" },
    {
      name: t("menu.playground"),
      icon: <FlaskConical />,
      url: "/playground",
      children: [
        {
          name: t("menu.agentTerminal"),
          icon: <Terminal />,
          url: "/playground/agent-terminal",
        },
        {
          name: t("menu.agents"),
          icon: <Users />,
          url: "/playground/agents",
        },
        {
          name: t("menu.abilities"),
          icon: <Zap />,
          url: "/playground/abilities",
        },
        {
          name: t("menu.assessment"),
          icon: <ClipboardCheck />,
          url: "/playground/assessment",
        },
        {
          name: t("menu.integrations"),
          icon: <Plug />,
          url: "/playground/integrations",
        },
      ],
    },
    {
      name: t("menu.analysis"),
      icon: <SearchCode />,
      url: "/analysis",
      children: [
        {
          name: t("menu.inspectCode"),
          icon: <SearchCode />,
          url: "/analysis/inspect-code",
        },
        {
          name: t("menu.vulnDb"),
          icon: <Database />,
          url: "/analysis/vuln-db",
        },
      ],
    },
  ];

  // Fuzzing section (landing + xyflow canvases) renders full-bleed.
  const isFuzzingSection = pathname?.startsWith("/fuzzing");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
      <AppTopBar menus={menuItems} />

      <main
        className={
          isFuzzingSection
            ? "w-full flex-1"
            : "mx-auto w-full max-w-7xl flex-1 px-4 py-5"
        }
      >
        {children}
      </main>
    </div>
  );
}
