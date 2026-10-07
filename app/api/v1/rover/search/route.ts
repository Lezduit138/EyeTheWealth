// ETW — /api/v1/rover/search — Global search for Rover entities
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiInternalError, checkRateLimit, getClientIp, apiError } from "@/lib/api";

export const revalidate = 60; // Cache search results for 1 minute

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip, 120); // allow more search requests
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return apiSuccess({ countries: [], regions: [], indicators: [], people: [] });
  }

  try {
    const [countries, regions, indicators, people] = await Promise.all([
      prisma.country.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
          ],
          isAggregate: false,
        },
        take: 10,
        select: { code: true, name: true, region: true },
      }),
      prisma.region.findMany({
        where: { name: { contains: q } },
        take: 5,
        select: { slug: true, name: true, type: true },
      }),
      prisma.indicator.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { category: { name: { contains: q } } },
          ],
        },
        take: 10,
        select: { slug: true, name: true, category: { select: { name: true } } },
      }),
      prisma.person.findMany({
        where: { name: { contains: q } },
        take: 5,
        select: { slug: true, name: true, isSampleData: true, description: true },
      }),
    ]);

    return apiSuccess({
      countries,
      regions,
      indicators: indicators.map((ind) => ({ ...ind, category: ind.category.name })),
      people,
    });
  } catch (err) {
    return apiInternalError(err);
  }
}
