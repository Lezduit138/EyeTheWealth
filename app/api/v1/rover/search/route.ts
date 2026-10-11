/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// ETW — /api/v1/rover/search — Global search for Rover entities
// Public endpoint, rate limited, cached

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiInternalError, checkRateLimit, getClientIp, apiError } from "@/lib/api";

export const revalidate = 60; // Cache search results for 1 minute

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip, 120); // allow more search requests
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return apiSuccess({ countries: [], regions: [], indicators: [], people: [] });
  }

  try {
    // Sub-national places query (states, districts, sub-districts, cities, wards, streets)
    const [countries, regions, indicators, places, people] = await Promise.all([
      prisma.country.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
          ],
          isAggregate: false,
        },
        take: 5,
        select: { code: true, name: true, region: true },
      }),
      prisma.region.findMany({
        where: { name: { contains: q } },
        take: 3,
        select: { slug: true, name: true, type: true },
      }),
      prisma.indicator.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { category: { name: { contains: q } } },
          ],
        },
        take: 5,
        select: { slug: true, name: true, category: { select: { name: true } } },
      }),
      prisma.place.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
            { aliases: { contains: q } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
          latitude: true,
          longitude: true,
        },
      }),
      prisma.person.findMany({
        where: {
          name: { contains: q },
          isSampleData: false,
          isPublicFigure: true,
        },
        take: 5,
        select: { slug: true, name: true, description: true, placeId: true },
      }),
    ]);

    // Live Geocoding via Photon for streets/localities if query is longer
    let geocodedStreets: Array<{ name: string; street: string; city: string; lat: number; lon: number }> = [];
    if (q.length >= 3) {
      try {
        const geoRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=3`, {
          headers: { "User-Agent": "EyeTheWealth-Research/1.0" },
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          geocodedStreets = (geoData.features || []).map((f: any) => ({
            name: f.properties?.name || f.properties?.street || q,
            street: f.properties?.street || "",
            city: f.properties?.city || f.properties?.state || "",
            lat: f.geometry?.coordinates?.[1],
            lon: f.geometry?.coordinates?.[0],
          }));
        }
      } catch (e) {
        // Fallback silently if offline or rate limited
      }
    }

    return apiSuccess({
      countries,
      regions,
      places,
      geocodedStreets,
      indicators: indicators.map((ind) => ({ ...ind, category: ind.category.name })),
      people,
    });
  } catch (err) {
    return apiInternalError(err);
  }
}
