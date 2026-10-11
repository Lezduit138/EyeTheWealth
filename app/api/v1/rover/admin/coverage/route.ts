// ETW — /api/v1/rover/admin/coverage — Coverage dashboard per source, level, indicator
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  try {
    const [
      placeCounts,
      assetCounts,
      deprivationCounts,
      publicFigureCounts,
      sources,
    ] = await Promise.all([
      prisma.place.groupBy({
        by: ["level"],
        _count: { id: true },
      }),
      prisma.assetRecord.groupBy({
        by: ["level"],
        _count: { id: true },
      }),
      prisma.areaDeprivationFlag.count(),
      prisma.person.count({
        where: { isPublicFigure: true, isSampleData: false },
      }),
      prisma.source.findMany({
        select: { id: true, name: true, url: true, isOfficial: true },
      }),
    ]);

    return apiSuccess({
      coverageSummary: {
        placesByLevel: placeCounts.map((p) => ({ level: p.level, count: p._count.id })),
        assetRecordsByLevel: assetCounts.map((a) => ({ level: a.level, count: a._count.id })),
        flaggedDeprivationAreas: deprivationCounts,
        verifiedPublicFigures: publicFigureCounts,
        sourcesCount: sources.length,
      },
      sources,
      disclaimer: "ETW Rover zero-placeholder policy enforced. No dummy records.",
    });
  } catch (err) {
    console.error("Error fetching coverage dashboard:", err);
    return apiError("Internal server error", 500);
  }
}
