// ETW — /api/v1/rover/map — Map layer payload (Choropleth data)
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiInternalError, checkRateLimit, getClientIp, apiError } from "@/lib/api";

export const revalidate = 3600; // Cache for 1 hour

// Helper to compute quantiles (classes)
function computeQuantiles(values: number[], numClasses: number): number[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const quantiles = [];
  for (let i = 1; i < numClasses; i++) {
    const pos = (i * sorted.length) / numClasses;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base] !== undefined) {
      const val = sorted[base - 1] + rest * (sorted[base] - sorted[base - 1]);
      quantiles.push(val);
    }
  }
  return quantiles;
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const searchParams = request.nextUrl.searchParams;
  const indicatorSlug = searchParams.get("indicator");
  const yearParam = searchParams.get("year");
  const levelParam = searchParams.get("level") || "country";
  const parentParam = searchParams.get("parent"); // placeId or countryCode

  if (!indicatorSlug) {
    return apiError("Missing 'indicator' parameter", 400);
  }

  try {
    // 1. Fetch indicator
    const indicator = await prisma.indicator.findUnique({
      where: { slug: indicatorSlug },
      include: {
        category: { select: { name: true } },
      },
    });

    if (!indicator) return apiError("Indicator not found", 404);

    // 2. Determine year
    let targetYear = yearParam ? parseInt(yearParam, 10) : null;
    if (!targetYear || isNaN(targetYear)) {
      const latestData = await prisma.dataPoint.findFirst({
        where: { indicatorId: indicator.id },
        orderBy: { year: "desc" },
        select: { year: true },
      });
      if (!latestData) return apiSuccess({ indicator, data: {}, classes: [], year: null, level: levelParam });
      targetYear = latestData.year;
    }

    // 3. Fetch data points for the level
    // If level is country, query Country entities
    if (levelParam === "country") {
      const dataPoints = await prisma.dataPoint.findMany({
        where: {
          indicatorId: indicator.id,
          year: targetYear,
          country: { isAggregate: false },
          value: { not: null },
        },
        select: {
          value: true,
          country: { select: { code: true, name: true } },
          source: { select: { name: true, url: true } },
          sourceUrl: true,
          verificationStatus: true,
          isEstimate: true,
          methodology: true,
        },
      });

      const values = dataPoints.map((dp) => dp.value).filter((v): v is number => v !== null);
      const min = values.length > 0 ? Math.min(...values) : null;
      const max = values.length > 0 ? Math.max(...values) : null;
      const numClasses = 6;
      const breaks = computeQuantiles(values, numClasses);

      const countryData: Record<string, unknown> = {};
      for (const dp of dataPoints) {
        if (dp.value === null || !dp.country) continue;

        let classIndex = 0;
        for (let i = 0; i < breaks.length; i++) {
          if (dp.value > breaks[i]) classIndex = i + 1;
        }

        countryData[dp.country.code] = {
          value: dp.value,
          classIndex,
          source: dp.source?.name,
          sourceUrl: dp.sourceUrl,
          verificationStatus: dp.verificationStatus,
          isEstimate: dp.isEstimate,
          resolution: "country",
        };
      }

      return apiSuccess({
        indicator: {
          id: indicator.id,
          name: indicator.name,
          slug: indicator.slug,
          category: indicator.category.name,
          unit: indicator.unit,
          displayUnit: indicator.displayUnit,
          polarity: indicator.polarity,
          polarityRationale: indicator.polarityRationale,
        },
        year: targetYear,
        level: "country",
        data: countryData,
        stats: {
          min,
          max,
          breaks,
          count: values.length,
        },
      });
    } else {
      // Sub-national level query within parent
      const wherePlace: Record<string, unknown> = { level: levelParam };
      if (parentParam) {
        wherePlace.parentId = parentParam;
      }

      const places = await prisma.place.findMany({
        where: wherePlace,
        include: {
          dataPoints: {
            where: { indicatorId: indicator.id, year: targetYear, value: { not: null } },
            take: 1,
            include: { source: true },
          },
        },
      });

      const values: number[] = [];
      const placeData: Record<string, unknown> = {};

      for (const pl of places) {
        const dp = pl.dataPoints[0];
        if (dp && dp.value !== null) {
          values.push(dp.value);
        }
      }

      const min = values.length > 0 ? Math.min(...values) : null;
      const max = values.length > 0 ? Math.max(...values) : null;
      const breaks = computeQuantiles(values, 6);

      for (const pl of places) {
        const dp = pl.dataPoints[0];
        if (!dp || dp.value === null) {
          placeData[pl.slug] = {
            value: null,
            classIndex: -1, // No data
            resolutionLabel: "Not publicly disclosed",
          };
          continue;
        }

        let classIndex = 0;
        for (let i = 0; i < breaks.length; i++) {
          if (dp.value > breaks[i]) classIndex = i + 1;
        }

        placeData[pl.slug] = {
          placeId: pl.id,
          placeName: pl.name,
          value: dp.value,
          classIndex,
          source: dp.source?.name || "Official / Census",
          sourceUrl: dp.sourceUrl,
          verificationStatus: dp.verificationStatus,
          isEstimate: dp.isEstimate,
          resolution: pl.level,
          resolutionLabel: `Measured at ${pl.level} level`,
        };
      }

      return apiSuccess({
        indicator: {
          id: indicator.id,
          name: indicator.name,
          slug: indicator.slug,
          category: indicator.category.name,
          unit: indicator.unit,
          displayUnit: indicator.displayUnit,
          polarity: indicator.polarity,
        },
        year: targetYear,
        level: levelParam,
        parent: parentParam,
        data: placeData,
        stats: {
          min,
          max,
          breaks,
          count: values.length,
        },
      });
    }
  } catch (err) {
    return apiInternalError(err);
  }
}
