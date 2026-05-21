import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEY, verifySessionCookie } from "@/lib/auth";

export const config = {
  // Protect /admin/* except the login page itself.
  matcher: ["/admin/:path*"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_KEY)?.value;
  const ok = await verifySessionCookie(cookie);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}
