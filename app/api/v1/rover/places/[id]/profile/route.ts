// ETW — /api/v1/rover/places/[id]/profile — Place details, breadcrumbs, hierarchy ancestors
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const { id } = await params;
  if (!id) return apiError("Place ID or slug required", 400);

  try {
    const place = await prisma.place.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            level: true,
            population: true,
            latitude: true,
            longitude: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!place) return apiError("Place not found", 404);

    // Compute breadcrumb ancestors
    const breadcrumb = [];
    let currentId: string | null = place.parentId;
    breadcrumb.unshift({
      id: place.id,
      name: place.name,
      slug: place.slug,
      level: place.level,
    });

    while (currentId) {
      const parentPlace = await prisma.place.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, slug: true, level: true, parentId: true },
      });
      if (parentPlace) {
        breadcrumb.unshift({
          id: parentPlace.id,
          name: parentPlace.name,
          slug: parentPlace.slug,
          level: parentPlace.level,
        });
        currentId = parentPlace.parentId;
      } else {
        currentId = null;
      }
    }

    return apiSuccess({
      place,
      breadcrumb,
      disclaimer: "Boundaries are illustrative; disputed borders not endorsed.",
    });
  } catch (err) {
    console.error("Error fetching place profile:", err);
    return apiError("Internal server error", 500);
  }
}
