// ETW — /api/v1/rover/deprivation — Deprivation and Poverty detection
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("placeId");
  const placeSlug = searchParams.get("slug");

  if (!placeId && !placeSlug) {
    return apiError("Missing 'placeId' or 'slug' parameter", 400);
  }

  try {
    const place = await prisma.place.findFirst({
      where: placeId ? { id: placeId } : { slug: placeSlug! },
      include: {
        deprivationFlags: true,
      },
    });

    if (!place) return apiError("Place not found", 404);

    const flag = place.deprivationFlags[0] || null;

    let parsedWeakDimensions = [];
    let parsedThresholds = {};

    if (flag) {
      try {
        if (flag.weakDimensions) parsedWeakDimensions = JSON.parse(flag.weakDimensions);
        if (flag.ruleThresholds) parsedThresholds = JSON.parse(flag.ruleThresholds);
      } catch (e) {
        console.warn("JSON parse error on deprivation flag:", e);
      }
    }

    return apiSuccess({
      place: {
        id: place.id,
        name: place.name,
        level: place.level,
      },
      deprivationStatus: flag?.isFlagged ? "Deprivation indicators present" : "Baseline standards met",
      isFlagged: flag?.isFlagged || false,
      ruleName: flag?.ruleName || "ETW_MULTIDIMENSIONAL_DEPRIVATION_RULE_V1",
      ruleThresholds: parsedThresholds,
      summaryText: flag?.summaryText || "No active deprivation indicators found.",
      weakDimensions: parsedWeakDimensions,
      interpretationDisclaimer: "ETW INTERPRETATION — not an official statistic. Flags are evaluated deterministically from published official metrics.",
    });
  } catch (err) {
    console.error("Error fetching deprivation data:", err);
    return apiError("Internal server error", 500);
  }
}
