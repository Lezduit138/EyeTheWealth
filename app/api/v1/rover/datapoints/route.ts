// ETW — /api/v1/rover/datapoints — Query data points
// Public, rate-limited, supports country + indicator + year filtering

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiInternalError,
  checkRateLimit,
  getClientIp,
  apiError,
  parsePagination,
  paginatedResponse,
} from "@/lib/api";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country"); // ISO alpha-3
  const indicatorSlug = searchParams.get("indicator");
  const yearFrom = searchParams.get("yearFrom");
  const yearTo = searchParams.get("yearTo");
  const { page, pageSize, skip } = parsePagination(searchParams);

  try {
    const where = {
      ...(countryCode ? { country: { code: countryCode } } : {}),
      ...(indicatorSlug ? { indicator: { slug: indicatorSlug } } : {}),
      ...(yearFrom || yearTo
        ? {
            year: {
              ...(yearFrom ? { gte: parseInt(yearFrom) } : {}),
              ...(yearTo ? { lte: parseInt(yearTo) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.dataPoint.findMany({
        where,
        include: {
          country: { select: { code: true, name: true, flagEmoji: true } },
          indicator: { select: { slug: true, name: true, unit: true, definition: true } },
          source: { select: { name: true, url: true } },
        },
        orderBy: [{ year: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.dataPoint.count({ where }),
    ]);

    return paginatedResponse(data, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return apiInternalError(err);
  }
}
