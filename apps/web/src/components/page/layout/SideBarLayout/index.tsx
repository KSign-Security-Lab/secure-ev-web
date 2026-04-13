"use client";

import React, { useRef } from "react";
import {
  FlaskConical,
  Gauge,
  MenuIcon,
  Zap,
  SearchCode,
  Terminal,
  Users,
  Database,
  ClipboardCheck,
} from "lucide-react";
import { MenuItemType, Sidebar, SidebarRef } from "./SideBar";
import Topbar from "./TopBar";
import { usePathname } from "next/navigation";
import { useI18n } from "~/i18n/I18nProvider";

export default function SideBarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const sidebarRef = useRef<SidebarRef>(null);
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
          url: "/playground/connect-agent",
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

  const getTitle = (currentPathname: string) => {
    for (const item of menuItems) {
      if (item.url === currentPathname) return item.name;
      if (item.children) {
        const child = item.children.find((c) => c.url === currentPathname);
        if (child) return child.name;
      }
    }
    return "";
  };

  // Check if current page is within the fuzzing section (Landing or Jobs)
  const isFuzzingSection = pathname?.startsWith("/fuzzing");

  return (
    <div className="flex h-screen min-h-screen overflow-hidden text-white">
      <Sidebar ref={sidebarRef} menus={menuItems} />
      
      <div
        className={`flex w-full flex-1 flex-col bg-base-950 min-w-0 min-h-0 overflow-hidden ${
          isFuzzingSection ? "p-0" : "p-6"
        }`}
      >
        {!isFuzzingSection && (
          <Topbar
            leftEnhancer={
              <button
                onClick={() => {
                  sidebarRef.current?.toggle();
                }}
              >
                <MenuIcon color={"white"} size={32} />
              </button>
            }
            title={getTitle(pathname || "")}
          />
        )}
        <main className="flex flex-col w-full flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
