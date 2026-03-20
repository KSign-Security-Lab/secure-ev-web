import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale } from "~/i18n/messages";

const LOCALE_COOKIE_NAME = "locale";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function GET() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return NextResponse.json({ locale });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const locale = isLocale(body?.locale) ? body.locale : defaultLocale;

  const response = NextResponse.json({ locale });
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}
