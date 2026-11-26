"use client";

import React from "react";
import {
  FlaskConical,
  Gauge,
  Zap,
  SearchCode,
  ScanSearch,
  Users,
  Database,
  ClipboardCheck,
  Plug,
  Crosshair,
  Grid3x3,
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
          name: t("menu.coverage"),
          icon: <Grid3x3 />,
          url: "/playground/coverage",
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
      icon: <ScanSearch />,
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

  // Inspect Code renders split panes (code viewer) that rely on a bounded
  // flex height; every page still shares the same max-w-7xl column as the
  // header so edges line up.
  const needsBoundedHeight = pathname?.startsWith("/analysis/inspect-code");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-100 text-neutral-900">
      {/* The single scroll container. A stable gutter keeps content from
          shifting when the scrollbar appears/disappears; the (sticky) header
          lives inside it so header and content share the same width. */}
      <main className="flex w-full flex-1 flex-col min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
        <AppTopBar menus={menuItems} />
        <div
          className={
            needsBoundedHeight
              ? "mx-auto flex w-full max-w-7xl flex-1 flex-col min-h-0 px-4 py-5"
              : "mx-auto w-full max-w-7xl px-4 py-5"
          }
        >
          {children}
        </div>
      </main>
    </div>
  );
}
