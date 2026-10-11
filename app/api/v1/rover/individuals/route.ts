// ETW — /api/v1/rover/individuals — Public Figures documented at place
// Strictly public figures only (e.g. election affidavits, public company filings)
// Never lists private individuals or links anyone to a private home address.
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
    });

    if (!place) return apiError("Place not found", 404);

    const publicFigures = await prisma.person.findMany({
      where: {
        placeId: place.id,
        isPublicFigure: true,
        isSampleData: false, // Strict rule: No dummy/sample data
      },
      select: {
        id: true,
        name: true,
        slug: true,
        birthYear: true,
        nationality: true,
        description: true,
        sourceUrl: true,
        netWorthHistory: {
          select: {
            year: true,
            value: true,
            currency: true,
            isEstimate: true,
            sourceName: true,
            sourceUrl: true,
            methodology: true,
          },
        },
      },
    });

    return apiSuccess({
      place: {
        id: place.id,
        name: place.name,
        level: place.level,
      },
      publicFigures,
      notice: "Public figures with official election affidavits or public company filings only. Private individuals and residential addresses are strictly excluded.",
      correctionLink: "/rover/correction",
    });
  } catch (err) {
    console.error("Error fetching individuals:", err);
    return apiError("Internal server error", 500);
  }
}
