// ETW — /api/v1/rover/indicators — List indicators with category info
// Public, rate-limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiInternalError,
  checkRateLimit,
  getClientIp,
  apiError,
} from "@/lib/api";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");

  try {
    const indicators = await prisma.indicator.findMany({
      where: categorySlug
        ? { category: { slug: categorySlug } }
        : undefined,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [
        { category: { displayOrder: "asc" } },
        { displayOrder: "asc" },
      ],
    });
    return apiSuccess(indicators);
  } catch (err) {
    return apiInternalError(err);
  }
}
