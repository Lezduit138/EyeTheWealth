// ETW — /api/v1/rover/boundaries — Lazy TopoJSON/GeoJSON administrative boundaries
import { NextRequest } from "next/server";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";
import { getGeoBoundaries } from "@/lib/rover/boundaries";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const searchParams = request.nextUrl.searchParams;
  const iso3 = searchParams.get("iso3") || "IND";
  const level = (searchParams.get("level") || "ADM1").toUpperCase() as "ADM1" | "ADM2" | "ADM3";

  try {
    const res = await getGeoBoundaries(iso3, level);
    return apiSuccess(res);
  } catch (err) {
    console.error("Error fetching boundaries:", err);
    return apiError("Internal server error", 500);
  }
}
