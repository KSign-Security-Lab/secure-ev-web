"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ChevronDown, ChevronRight, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useI18n } from "~/i18n/I18nProvider";
import { isLocale } from "~/i18n/messages";

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
    const { locale, setLocale, t } = useI18n();
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

    const handleLocaleChange = (value: string) => {
      if (!isLocale(value)) {
        return;
      }

      setLocale(value);
    };

    const toggleLocale = () => {
      setLocale(locale === "en" ? "ko" : "en");
    };

    return (
      <div
        className={clsx(
          "h-screen bg-white border-r transition-all duration-300 flex flex-col",
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

        <nav className="mt-5 space-y-2 flex-1 overflow-y-auto">
          {menus.map((item) => (
            <div key={item.url} className="relative group">
              {item.children ? (
                <div
                  onClick={handleAssetClick}
                  className={clsx(
                    "flex items-center py-2 px-6 cursor-pointer text-sm font-medium rounded-md transition-colors duration-200 group/item relative",
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

                  {!expanded && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-900 shadow-xl whitespace-nowrap opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all pointer-events-none z-50">
                      {item.name}
                      {/* Tooltip Arrow */}
                      <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-gray-200" />
                      <div className="absolute left-px top-1/2 -translate-x-full -translate-y-1/2 border-y-[5px] border-y-transparent border-r-[5px] border-r-white" />
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.url}>
                  <div
                    className={clsx(
                      "flex items-center py-2 px-6 text-sm font-medium rounded-md transition-colors duration-200 group/item relative",
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

                    {!expanded && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-900 shadow-xl whitespace-nowrap opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all pointer-events-none z-50">
                        {item.name}
                        {/* Tooltip Arrow */}
                        <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-gray-200" />
                        <div className="absolute left-px top-1/2 -translate-x-full -translate-y-1/2 border-y-[5px] border-y-transparent border-r-[5px] border-r-white" />
                      </div>
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
            </div>
          ))}
        </nav>

        <div
          className={clsx(
            "border-t border-gray-200",
            expanded ? "px-3 py-4" : "p-2 flex justify-center"
          )}
        >
          {expanded ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t("sidebar.language")}
              </label>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-500 shrink-0" />
                <select
                  value={locale}
                  onChange={(event) => handleLocaleChange(event.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                  aria-label={t("sidebar.toggleLanguage")}
                >
                  <option value="en">{t("language.english")}</option>
                  <option value="ko">{t("language.korean")}</option>
                </select>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleLocale}
              className="group/item relative flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
              aria-label={t("sidebar.toggleLanguage")}
            >
              <Globe size={18} />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-900 shadow-xl whitespace-nowrap opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all pointer-events-none z-50">
                {t("sidebar.language")}:{" "}
                {locale === "en" ? t("language.english") : t("language.korean")}
                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-gray-200" />
                <div className="absolute left-px top-1/2 -translate-x-full -translate-y-1/2 border-y-[5px] border-y-transparent border-r-[5px] border-r-white" />
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }
);
