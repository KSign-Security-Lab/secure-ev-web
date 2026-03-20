"use client";

import React, { useRef } from "react";
import {
  Database,
  FlaskConical,
  Gauge,
  MenuIcon,
  Server,
  Zap,
  SearchCode,
} from "lucide-react";
import { MenuItemType, Sidebar, SidebarRef } from "./SideBar";
import Topbar from "./TopBar";
import { usePathname } from "next/navigation";

const MENU_ITEMS: MenuItemType[] = [
  { name: "대시보드 (Dashboard)", icon: <Gauge />, url: "/" },
  { name: "Fuzzing", icon: <Zap />, url: "/fuzzing" },
  { name: "에이전트 (Agents)", icon: <Server />, url: "/agents" },
  { name: "취약점 (Abilities)", icon: <Database />, url: "/abilities" },
  { name: "플레이그라운드 (Playground)", icon: <FlaskConical />, url: "/playground" },
  { name: "분석 워크스페이스 (Analysis)", icon: <SearchCode />, url: "/analysis" },
];

export default function SideBarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarRef = useRef<SidebarRef>(null);
  const pathname = usePathname();
  
  const getTitle = (pathname: string) => {
    const menu = MENU_ITEMS.find((menu) => menu.url === pathname);
    return menu?.name || "";
  };

  // Check if current page is within the fuzzing section (Landing or Jobs)
  const isFuzzingSection = pathname?.startsWith("/fuzzing");

  return (
    <div className="flex h-screen min-h-screen overflow-hidden text-white">
      <Sidebar ref={sidebarRef} menus={MENU_ITEMS} />
      
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
