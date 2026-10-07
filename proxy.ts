// ETW — Next.js middleware: protects /admin routes, attaches auth

import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Simple in-memory rate limiter for public API endpoints
// Note: In production, use Redis or similar. This resets on server restart.
const rateLimit = new Map<string, { count: number; timestamp: number }>();

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // /admin requires ADMIN or EDITOR role
    const role = (session.user as { role?: string })?.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.redirect(new URL("/account", req.url));
    }

    // /admin/users requires ADMIN role
    if (pathname.startsWith("/admin/users") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Rate Limiting for Public APIs
  if (pathname.startsWith("/api/v1") && !pathname.startsWith("/api/v1/admin")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);
    const max = parseInt(process.env.RATE_LIMIT_MAX || "60", 10);

    const record = rateLimit.get(ip) || { count: 0, timestamp: now };
    if (now - record.timestamp > windowMs) {
      record.count = 0;
      record.timestamp = now;
    }

    record.count += 1;
    rateLimit.set(ip, record);

    if (record.count > max) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/:path*",
  ],
};
