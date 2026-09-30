"use client";

import React, { useCallback } from "react";
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
 * same menu data, active-route detection and locale toggle behaviour.
 */
export function AppTopBar({ menus }: AppTopBarProps) {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();

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

  const itemBase =
    "rounded px-3 py-1.5 text-sm font-medium transition-colors";

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
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
            className="flex flex-wrap items-center gap-0.5 rounded-md border border-neutral-200 bg-neutral-50 p-1"
            aria-label={t("menu.dashboard")}
          >
            {menus.map((item) =>
              item.children ? (
                <div key={item.url} className="group relative">
                  <button
                    type="button"
                    className={clsx(
                      itemBase,
                      "inline-flex items-center gap-1",
                      isGroupActive(item)
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-950",
                    )}
                  >
                    {item.name}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 min-w-[12rem] pt-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="flex flex-col gap-0.5 rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
                      <Link
                        href={item.url}
                        className={clsx(
                          "flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium",
                          isActive(item.url)
                            ? "bg-neutral-50 text-blue-700"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950",
                        )}
                      >
                        <span className="flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                      {item.children.map((child) => (
                        <Link
                          key={child.url}
                          href={child.url}
                          className={clsx(
                            "flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium",
                            isActive(child.url)
                              ? "bg-neutral-50 text-blue-700"
                              : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950",
                          )}
                        >
                          <span className="flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
                            {child.icon}
                          </span>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
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
