// ETW — /api/v1/rover/countries — List all countries with latest indicator data
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiInternalError,
  checkRateLimit,
  getClientIp,
  apiError,
} from "@/lib/api";

// Cache for 1 hour
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        code2: true,
        name: true,
        region: true,
        incomeLevel: true,
        capitalCity: true,
        flagEmoji: true,
      },
    });
    return apiSuccess(countries);
  } catch (err) {
    return apiInternalError(err);
  }
}
