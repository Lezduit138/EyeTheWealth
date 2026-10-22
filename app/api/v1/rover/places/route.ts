// ETW — /api/v1/rover/places — Sub-national places query, children, ancestors
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip, 120);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const searchParams = request.nextUrl.searchParams;
  const parentId = searchParams.get("parent");
  const level    = searchParams.get("level");
  const slug     = searchParams.get("slug")?.trim();
  const search   = searchParams.get("q")?.trim();

  try {
    const whereClause: Record<string, unknown> = {};

    if (slug) {
      // Exact slug lookup — used by ClientDashboard to resolve India place ID
      whereClause.slug = slug;
    } else if (parentId) {
      whereClause.parentId = parentId;
    } else if (level) {
      whereClause.level = level;
    } else if (!search) {
      // Default to root country places
      whereClause.level = "country";
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { aliases: { contains: search } },
      ];
    }

    const places = await prisma.place.findMany({
      where: whereClause,
      select: {
        id: true,
        parentId: true,
        level: true,
        name: true,
        slug: true,
        aliases: true,
        iso3: true,
        lgdCode: true,
        census2011Code: true,
        geoBoundariesId: true,
        population: true,
        boundaryVintage: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { name: "asc" },
    });

    return apiSuccess({ places });
  } catch (err) {
    console.error("Error fetching places:", err);
    return apiError("Internal server error", 500);
  }
}
