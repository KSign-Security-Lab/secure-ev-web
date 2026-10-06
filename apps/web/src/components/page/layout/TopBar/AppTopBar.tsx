"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useI18n } from "~/i18n/I18nProvider";

export interface MenuItemType {
  name: string;
  icon: React.ReactNode;
  url: string;
  children?: MenuItemType[];
}

interface AppTopBarProps {
  menus: MenuItemType[];
}

/**
 * ev-fuzzer-style sticky top bar. Replaces the former sidebar while keeping the
 * same menu data, active-route detection and locale toggle behaviour. Grouped
 * items open as an accessible click/keyboard disclosure (not hover-only).
 */
export function AppTopBar({ menus }: AppTopBarProps) {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const isActive = useCallback(
    (url: string) => {
      if (url === "/" || url === "") return pathname === url;
      return pathname === url || pathname.startsWith(url + "/");
    },
    [pathname],
  );

  const isGroupActive = useCallback(
    (item: MenuItemType) =>
      isActive(item.url) ||
      (item.children?.some((child) => isActive(child.url)) ?? false),
    [isActive],
  );

  // Close on Escape and on click outside the nav.
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    const onPointer = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [openGroup]);

  const itemBase = "rounded px-3 py-1.5 text-sm font-medium transition-colors";

  const dropdownLink = (entry: MenuItemType) => (
    <Link
      key={entry.url}
      href={entry.url}
      role="menuitem"
      onClick={() => setOpenGroup(null)}
      className={clsx(
        "flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium",
        isActive(entry.url)
          ? "bg-neutral-50 text-blue-700"
          : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950",
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
        {entry.icon}
      </span>
      {entry.name}
    </Link>
  );

  return (
    <header className="z-40 shrink-0 border-b border-neutral-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="relative h-8 w-32 shrink-0"
          aria-label={t("menu.dashboard")}
        >
          <Image
            src="/assets/logo-dark.png"
            alt="Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <nav
            ref={navRef}
            className="flex flex-wrap items-center gap-0.5 rounded-md border border-neutral-200 bg-neutral-50 p-1"
            aria-label={t("menu.dashboard")}
          >
            {menus.map((item) =>
              item.children ? (
                <div key={item.url} className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openGroup === item.url}
                    onClick={() =>
                      setOpenGroup((cur) => (cur === item.url ? null : item.url))
                    }
                    className={clsx(
                      itemBase,
                      "inline-flex items-center gap-1",
                      isGroupActive(item)
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-950",
                    )}
                  >
                    {item.name}
                    <ChevronDown
                      className={clsx(
                        "h-3.5 w-3.5 transition-transform",
                        openGroup === item.url && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {openGroup === item.url && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full z-50 min-w-[12rem] pt-1"
                    >
                      <div className="flex flex-col gap-0.5 rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
                        {dropdownLink(item)}
                        {item.children.map((child) => dropdownLink(child))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.url}
                  href={item.url}
                  className={clsx(
                    itemBase,
                    isActive(item.url)
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-950",
                  )}
                >
                  {item.name}
                </Link>
              ),
            )}
          </nav>

          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "ko" : "en")}
            title={t("sidebar.toggleLanguage")}
            aria-label={t("sidebar.toggleLanguage")}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-500 hover:text-neutral-950"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            {locale === "en" ? "KO" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}
