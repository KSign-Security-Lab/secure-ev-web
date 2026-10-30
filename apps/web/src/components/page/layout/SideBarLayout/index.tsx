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
  Crosshair,
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
          name: t("menu.operations"),
          icon: <Crosshair />,
          url: "/playground/operations",
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

  // Analysis uses bounded-height full-width panes (code viewer / split views
  // that rely on flex-1 + min-h-0). All other pages render centered in a
  // max-w-7xl column.
  const isAnalysisSection = pathname?.startsWith("/analysis");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-100 text-neutral-900">
      <AppTopBar menus={menuItems} />

      <main className="flex w-full flex-1 flex-col min-h-0 overflow-y-auto">
        {isAnalysisSection ? (
          <div className="flex w-full flex-1 flex-col min-h-0 p-4">
            {children}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl px-4 py-5">{children}</div>
        )}
      </main>
    </div>
  );
}
