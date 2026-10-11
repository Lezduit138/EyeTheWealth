// ETW — /api/v1/rover/assets — Assets & Wealth Composition
// Returns extensible asset records per place with resolution labels.
// Never downscales higher-level figures (e.g. gold).
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
      select: { id: true, name: true, level: true, parentId: true },
    });

    if (!place) return apiError("Place not found", 404);

    const categories = await prisma.assetCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        records: {
          where: { placeId: place.id },
        },
      },
    });

    // Parent place for inherited context
    let parentPlace = null;
    if (place.parentId) {
      parentPlace = await prisma.place.findUnique({
        where: { id: place.parentId },
        select: { id: true, name: true, level: true },
      });
    }

    const payload = categories.map((cat) => {
      const record = cat.records[0] || null;

      // Special rule: Gold is only published at national level. Never downscale.
      const isGold = cat.slug === "gold";
      let status: "MEASURED" | "NOT_PUBLICLY_DISCLOSED" | "NEAREST_PARENT_MEASURED" = "NOT_PUBLICLY_DISCLOSED";
      let displayValue: number | null = null;
      let displayUnit = "";
      let resolution = "";
      let sourceName = "";
      let sourceUrl = "";
      let methodology = "";
      let isEstimate = false;
      let year = null;

      if (record && record.value !== null) {
        status = "MEASURED";
        displayValue = record.value;
        displayUnit = record.unit;
        resolution = record.level;
        sourceName = record.sourceName;
        sourceUrl = record.sourceUrl;
        methodology = record.methodology || "";
        isEstimate = record.isEstimate;
        year = record.year;
      } else if (isGold && place.level !== "country") {
        status = "NOT_PUBLICLY_DISCLOSED";
      }

      return {
        categoryId: cat.id,
        categorySlug: cat.slug,
        categoryName: cat.name,
        description: cat.description,
        status,
        value: displayValue,
        unit: displayUnit,
        year,
        resolutionLabel: resolution ? `Measured at ${resolution} level` : "Not publicly disclosed",
        finestMeasuredLevel: resolution || null,
        sourceName,
        sourceUrl,
        methodology,
        isEstimate,
      };
    });

    return apiSuccess({
      place: {
        id: place.id,
        name: place.name,
        level: place.level,
      },
      parent: parentPlace,
      assetComposition: payload,
    });
  } catch (err) {
    console.error("Error fetching assets:", err);
    return apiError("Internal server error", 500);
  }
}
