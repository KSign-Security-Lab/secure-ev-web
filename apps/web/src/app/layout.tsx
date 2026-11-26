import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "~/components/ToastProvider/ToastProvider";
import NotificationListner from "~/components/NotificationListener/NotificationListner";
import SideBarLayout from "~/components/page/layout/SideBarLayout";
import { cookies } from "next/headers";
import { I18nProvider } from "~/i18n/I18nProvider";
import { defaultLocale, isLocale } from "~/i18n/messages";

// Self-hosted (next/font/local) so the app builds and runs fully offline. The
// woff2 files live in src/fonts (OFL-1.1, see src/fonts/OFL.txt). Pretendard
// covers both Hangul and Latin, so Korean and English UI text share one
// typeface; it is a variable font, so one file covers all weights.
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-display",
  weight: "45 920",
  display: "swap",
});
const plexMono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-mono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "secure-ev-web",
  description: "Breach and Attack Simulation",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;
  const initialLocale = isLocale(localeCookie) ? localeCookie : defaultLocale;

  return (
    <html
      lang={initialLocale}
      className={`${pretendard.variable} ${plexMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      {/* Browser extensions (translators, password managers) inject attributes
          into <body> before hydration; that mismatch is not ours. */}
      <body suppressHydrationWarning>
        <I18nProvider initialLocale={initialLocale}>
          <ToastProvider>
            <SideBarLayout>{children}</SideBarLayout>
            <NotificationListner />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
