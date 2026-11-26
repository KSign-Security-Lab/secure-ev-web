"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Menu, X } from "lucide-react";
import { WsStatus } from "./WsStatus";
import type { Locale } from "~/i18n/messages";
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

/** Language names are shown in their own language, regardless of UI locale. */
const LANGUAGE_NAMES: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

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
  const langRef = useRef<HTMLDivElement>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [langOpen]);

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

  const dropdownLink = (entry: MenuItemType) => (
    <Link
      key={entry.url}
      href={entry.url}
      role="menuitem"
      onClick={() => setOpenGroup(null)}
      className={clsx(
        "flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
        isActive(entry.url)
          ? "bg-blue-50 text-blue-700"
          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950",
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center text-neutral-400 [&_svg]:h-4 [&_svg]:w-4">
        {entry.icon}
      </span>
      {entry.name}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-white">
      {/* Utility strip (유틸리티 바): language + live-event status, as on
          conventional Korean corporate sites. Secondary controls live here,
          out of the main navigation. */}
      <div className="border-b border-neutral-100 bg-neutral-50">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-end gap-3 px-4">
          <WsStatus />
          <span className="h-3 w-px bg-neutral-300" aria-hidden />
          <div ref={langRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={langOpen}
              onClick={() => setLangOpen((v) => !v)}
              title={t("sidebar.currentLanguage", { language: LANGUAGE_NAMES[locale] })}
              aria-label={t("sidebar.currentLanguage", { language: LANGUAGE_NAMES[locale] })}
              className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-950"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {LANGUAGE_NAMES[locale]}
              <ChevronDown
                className={clsx("h-3 w-3 transition-transform", langOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {langOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 min-w-[9rem] rounded-md border border-neutral-200 bg-white p-1 shadow-md"
              >
                {(Object.keys(LANGUAGE_NAMES) as Locale[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="menuitemradio"
                    aria-checked={locale === code}
                    lang={code}
                    onClick={() => {
                      setLangOpen(false);
                      if (code !== locale) setLocale(code);
                    }}
                    className={clsx(
                      "flex w-full items-center justify-between gap-2 rounded px-3 py-1.5 text-sm",
                      locale === code
                        ? "bg-neutral-50 font-semibold text-blue-700"
                        : "text-neutral-700 hover:bg-neutral-50"
                    )}
                  >
                    {LANGUAGE_NAMES[code]}
                    {locale === code && <Check className="h-3.5 w-3.5" aria-hidden />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main GNB (Global Navigation Bar): logo left, horizontal text menu with
          an underline active indicator and hover-opened 2-depth panels. */}
      <div className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-7xl items-stretch gap-8 px-4">
          <Link
            href="/"
            className="relative my-auto h-8 w-32 shrink-0"
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

          <nav
            ref={navRef}
            onMouseLeave={() => setOpenGroup(null)}
            className="hidden items-stretch md:flex"
            aria-label={t("menu.mainNav")}
          >
            {menus.map((item) =>
              item.children ? (
                <div
                  key={item.url}
                  className="relative flex items-stretch"
                  onMouseEnter={() => setOpenGroup(item.url)}
                >
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openGroup === item.url}
                    onClick={() =>
                      setOpenGroup((cur) => (cur === item.url ? null : item.url))
                    }
                    className={clsx(
                      "relative inline-flex items-center gap-1 whitespace-nowrap border-b-2 px-5 text-[15px] transition-colors",
                      isGroupActive(item)
                        ? "border-blue-600 font-semibold text-blue-700"
                        : "border-transparent font-medium text-neutral-700 hover:text-blue-700",
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
                      className="absolute left-0 top-full z-50 min-w-[13rem]"
                    >
                      <div className="flex flex-col overflow-hidden rounded-b-md border border-t-0 border-neutral-200 bg-white py-1 shadow-lg">
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
                    "inline-flex items-center whitespace-nowrap border-b-2 px-5 text-[15px] transition-colors",
                    isActive(item.url)
                      ? "border-blue-600 font-semibold text-blue-700"
                      : "border-transparent font-medium text-neutral-700 hover:text-blue-700",
                  )}
                >
                  {item.name}
                </Link>
              ),
            )}
          </nav>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={mobileOpen}
            aria-label={t("menu.mainNav")}
            onClick={() => setMobileOpen((v) => !v)}
            className="my-auto ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <nav
            className="border-t border-neutral-100 px-4 py-2 md:hidden"
            aria-label={t("menu.mainNav")}
          >
            {menus.map((item) => (
              <div key={item.url} className="py-1">
                <Link
                  href={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "block rounded px-2 py-2 text-sm font-semibold",
                    isGroupActive(item)
                      ? "text-blue-700"
                      : "text-neutral-800 hover:bg-neutral-50",
                  )}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="mt-0.5 flex flex-col border-l border-neutral-200 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.url}
                        href={child.url}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          "flex items-center gap-2.5 rounded px-2 py-2 text-sm",
                          isActive(child.url)
                            ? "font-medium text-blue-700"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950",
                        )}
                      >
                        <span className="flex h-4 w-4 items-center justify-center text-neutral-400 [&_svg]:h-4 [&_svg]:w-4">
                          {child.icon}
                        </span>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
