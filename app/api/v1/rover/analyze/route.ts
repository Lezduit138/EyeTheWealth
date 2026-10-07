// ETW — /api/v1/rover/analyze — Deterministic analysis for an entity + indicator
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { apiSuccess, apiInternalError, checkRateLimit, getClientIp, apiError } from "@/lib/api";
import { analyzeIndicatorForCountry } from "@/lib/analysis";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const searchParams = request.nextUrl.searchParams;
  const indicatorSlug = searchParams.get("indicator");
  const entityParam = searchParams.get("entity");

  if (!indicatorSlug) return apiError("Missing 'indicator' parameter", 400);
  if (!entityParam) return apiError("Missing 'entity' parameter (ISO3 code)", 400);

  try {
    const analysis = await analyzeIndicatorForCountry(indicatorSlug, entityParam.toUpperCase());
    return apiSuccess(analysis);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message.includes("not found") || err.message.includes("No data available"))) {
      return apiError(err.message, 404);
    }
    return apiInternalError(err);
  }
}
