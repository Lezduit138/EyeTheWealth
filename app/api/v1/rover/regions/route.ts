// ETW — /api/v1/rover/regions — List regions and their member countries
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiInternalError, checkRateLimit, getClientIp, apiError } from "@/lib/api";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  try {
    const regions = await prisma.region.findMany({
      include: {
        countries: {
          include: {
            country: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = regions.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      type: r.type,
      description: r.description,
      wbCode: r.wbCode,
      countries: r.countries.map((rc) => rc.country),
    }));

    return apiSuccess(formatted);
  } catch (err) {
    return apiInternalError(err);
  }
}
