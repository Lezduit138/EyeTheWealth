// ETW — /api/v1/rover/series — Timeseries data for an indicator and entities
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiInternalError, checkRateLimit, getClientIp, apiError } from "@/lib/api";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const searchParams = request.nextUrl.searchParams;
  const indicatorSlug = searchParams.get("indicator");
  const entitiesParam = searchParams.get("entities");
  const fromYearParam = searchParams.get("from");
  const toYearParam = searchParams.get("to");

  if (!indicatorSlug) {
    return apiError("Missing 'indicator' parameter", 400);
  }
  if (!entitiesParam) {
    return apiError("Missing 'entities' parameter (comma-separated country/region codes)", 400);
  }

  const entities = entitiesParam.split(",").map((e) => e.trim().toUpperCase());

  try {
    const indicator = await prisma.indicator.findUnique({
      where: { slug: indicatorSlug },
    });

    if (!indicator) return apiError("Indicator not found", 404);

    const whereClause: Record<string, unknown> = {
      indicatorId: indicator.id,
      country: { code: { in: entities } },
      value: { not: null },
    };

    if (fromYearParam) {
      whereClause.year = { ...(whereClause.year as any), gte: parseInt(fromYearParam, 10) };
    }
    if (toYearParam) {
      whereClause.year = { ...(whereClause.year as any), lte: parseInt(toYearParam, 10) };
    }

    const dataPoints = await prisma.dataPoint.findMany({
      where: whereClause,
      select: {
        year: true,
        value: true,
        isProjection: true,
        country: { select: { code: true, name: true } },
        source: { select: { shortName: true } },
      },
      orderBy: { year: "asc" },
    });

    // Group by entity code
    const seriesData: Record<string, unknown[]> = {};
    for (const dp of dataPoints) {
      const code = dp.country.code;
      if (!seriesData[code]) seriesData[code] = [];
      seriesData[code].push({
        year: dp.year,
        value: dp.value,
        isProjection: dp.isProjection,
        source: dp.source?.shortName,
      });
    }

    return apiSuccess({
      indicator: {
        id: indicator.id,
        name: indicator.name,
        unit: indicator.unit,
      },
      series: seriesData,
    });
  } catch (err) {
    return apiInternalError(err);
  }
}
