// ETW — API utility helpers: consistent responses, errors, rate limiting

import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ─── Standard response shapes ─────────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status }
  );
}

export function apiNotFound(resource = "Resource") {
  return apiError(`${resource} not found`, 404);
}

export function apiUnauthorized() {
  return apiError("Unauthorized", 401);
}

export function apiForbidden() {
  return apiError("Forbidden — insufficient permissions", 403);
}

export function apiValidationError(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: "Validation error",
      details: error.flatten().fieldErrors,
    },
    { status: 422 }
  );
}

export function apiInternalError(err?: unknown) {
  const msg =
    process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Internal server error";
  console.error("[ETW API Error]", err);
  return apiError(msg, 500);
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  status = 200
) {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "25", 10))
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
// Production: replace with Redis-backed solution

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests = Number(process.env.RATE_LIMIT_MAX ?? 60),
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000)
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((val, key) => {
      if (now > val.resetAt) rateLimitStore.delete(key);
    });
  }, 5 * 60 * 1000);
}

// ─── Structured logger ────────────────────────────────────────────────────────

type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const configured = process.env.LOG_LEVEL ?? "info";
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  if (levels[level] < levels[configured as LogLevel]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};

// ─── IP extraction helper ─────────────────────────────────────────────────────

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
