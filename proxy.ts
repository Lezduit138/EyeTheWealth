// ETW — Next.js middleware: protects /admin routes, attaches auth

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // /admin/users requires ADMIN role
    if (
      pathname.startsWith("/admin/users") &&
      (session.user as { role?: string })?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
  ],
};
