// ETW — /api/v1/rover/people/[slug] — Person profile data
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiInternalError, checkRateLimit, getClientIp, apiError } from "@/lib/api";

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  try {
    const person = await prisma.person.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        netWorthHistory: {
          orderBy: { year: "desc" },
        },
        companies: true,
      },
    });

    if (!person) return apiError("Person not found", 404);

    return apiSuccess(person);
  } catch (err) {
    return apiInternalError(err);
  }
}
