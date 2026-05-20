import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

const intl = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin gate (Supabase session check happens in admin layout)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|studio|admin|.*\\..*).*)"],
};
