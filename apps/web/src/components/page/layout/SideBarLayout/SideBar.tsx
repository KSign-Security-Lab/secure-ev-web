"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export interface MenuItemType {
  name: string;
  icon: React.ReactNode;
  url: string;
  children?: MenuItemType[];
}

export interface SidebarRef {
  toggle: () => void;
}

interface SidebarProps {
  menus: MenuItemType[];
}

export const Sidebar = forwardRef<SidebarRef, SidebarProps>(
  ({ menus }, ref) => {
    const pathname = usePathname();
    const isActive = (url: string) => {
      if (url === "/" || url === "") return pathname === url;
      return pathname === url || pathname.startsWith(url + "/");
    };
    const [expanded, setExpanded] = useState(true);
    const [assetOpen, setAssetOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      toggle: () => setExpanded((prev) => !prev),
    }));

    const handleAssetClick = () => {
      if (!expanded) {
        setExpanded(true);
        if (!assetOpen) {
          setTimeout(() => {
            setAssetOpen(true);
          }, 300);
        }
      } else {
        setAssetOpen((prev) => !prev);
      }
    };

    return (
      <div
        className={clsx(
          "h-screen bg-white border-r transition-all duration-300",
          expanded ? "w-56" : "w-16"
        )}
      >
        <Link href={"/"}>
          <div className="flex items-center justify-between p-4 ml-1">
            <div className={clsx("relative h-10", expanded ? "w-56" : "w-16")}>
              <Image
                src={expanded ? "/assets/logo-dark.png" : "/assets/logo-sm.png"}
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </Link>

        <nav className="mt-5 space-y-2">
          {menus.map((item) => (
            <div key={item.url} className="relative group">
              {item.children ? (
                <div
                  onClick={handleAssetClick}
                  className={clsx(
                    "flex items-center py-2 px-6 cursor-pointer text-sm font-medium rounded-md transition-colors duration-200",
                    isActive(item.url)
                      ? "text-blue-500"
                      : "text-gray-700 hover:bg-gray-100",
                    !expanded ? "justify-center" : ""
                  )}
                >
                  <div className="w-6 h-6">{item.icon}</div>
                  {expanded && (
                    <div className="flex flex-row items-center justify-between w-full">
                      <div>
                        <span className="ml-3 whitespace-nowrap">
                          {item.name}
                        </span>
                      </div>
                      <div>
                        {assetOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.url}>
                  <div
                    className={clsx(
                      "flex items-center py-2 px-6 text-sm font-medium rounded-md transition-colors duration-200",
                      isActive(item.url)
                        ? "text-blue-500"
                        : "text-gray-700 hover:bg-gray-100",
                      !expanded ? "justify-center" : ""
                    )}
                  >
                    <div className="w-6 h-6">{item.icon}</div>
                    {expanded && (
                      <span className="ml-3 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {item.children && expanded && assetOpen && (
                <div className="flex flex-col space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.url}
                      href={child.url}
                      className={clsx(
                        "flex items-center py-1 px-6 gap-2 rounded-md transition-colors duration-200 text-sm",
                        isActive(child.url)
                          ? "text-blue-500 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <div className="w-4 h-4">{child.icon}</div>
                      <span className="whitespace-nowrap">{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {!expanded && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 rounded bg-gray-800 text-sm shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    );
  }
);
