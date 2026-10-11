// ETW — /api/v1/rover/ngos — Suggested Contributor NGOs for Rover Place
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";
import { getSuggestedNgosForPlace } from "@/lib/rover/ngos";

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
      include: {
        parent: true,
        deprivationFlags: true,
      },
    });

    if (!place) return apiError("Place not found", 404);

    let stateName = null;
    let districtName = null;

    if (place.level === "state") {
      stateName = place.name;
    } else if (place.level === "district") {
      districtName = place.name;
      stateName = place.parent?.name || null;
    } else {
      districtName = place.parent?.name || null;
    }

    const flag = place.deprivationFlags[0];
    let weakDimensions: string[] = [];
    if (flag?.weakDimensions) {
      try {
        const parsed = JSON.parse(flag.weakDimensions);
        weakDimensions = parsed.map((p: { dimension: string }) => p.dimension);
      } catch (e) {
        console.warn(e);
      }
    }

    const suggestions = await getSuggestedNgosForPlace(
      place.name,
      stateName,
      districtName,
      weakDimensions
    );

    return apiSuccess({
      place: {
        id: place.id,
        name: place.name,
        level: place.level,
      },
      ...suggestions,
    });
  } catch (err) {
    console.error("Error fetching NGO suggestions:", err);
    return apiError("Internal server error", 500);
  }
}
