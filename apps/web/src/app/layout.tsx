import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "~/components/ToastProvider/ToastProvider";
import NotificationListner from "~/components/NotificationListener/NotificationListner";
import SideBarLayout from "~/components/page/layout/SideBarLayout";
import { cookies } from "next/headers";
import { I18nProvider } from "~/i18n/I18nProvider";
import { defaultLocale, isLocale } from "~/i18n/messages";

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
    <html lang={initialLocale}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
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
