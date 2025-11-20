"use client";

import React, { useRef } from "react";
import { Database, FlaskConical, Gauge, MenuIcon, Server } from "lucide-react";
import { MenuItemType, Sidebar, SidebarRef } from "./SideBar";
import Topbar from "./TopBar";
import { usePathname } from "next/navigation";

const MENU_ITEMS: MenuItemType[] = [
  { name: "Dashboard", icon: <Gauge />, url: "/" },
  { name: "Agents", icon: <Server />, url: "/agents" },
  { name: "Abilities", icon: <Database />, url: "/abilities" },
  { name: "Playground", icon: <FlaskConical />, url: "/playground" },
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

  return (
    <div className="flex h-screen min-h-screen overflow-hidden text-white">
      <Sidebar ref={sidebarRef} menus={MENU_ITEMS} />
      <div className="flex w-full flex-1 flex-col bg-base-950 p-6 min-w-0 min-h-0 overflow-hidden">
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
          title={getTitle(pathname)}
        />
        <main className="flex w-full flex-1 min-h-0 min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
