// ETW — GeoBoundaries & Administrative Boundaries Adapter
// Fetches simplified boundaries lazily from geoBoundaries API / cache

import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "data", "boundaries");

export interface BoundaryGeoJson {
  type: string;
  features: Array<{
    type: string;
    properties: Record<string, unknown>;
    geometry: unknown;
  }>;
}

export async function getGeoBoundaries(
  iso3: string,
  level: "ADM1" | "ADM2" | "ADM3"
): Promise<{ geojson: BoundaryGeoJson | null; disclaimer: string; vintage: string }> {
  const disclaimer = "Boundaries are illustrative; disputed borders not endorsed.";
  const cacheKey = `${iso3}_${level}_simplified.geojson`;
  const cachePath = path.join(CACHE_DIR, cacheKey);

  // Check filesystem cache first
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      return { geojson: cached, disclaimer, vintage: "geoBoundaries-v4" };
    } catch (e) {
      console.warn("Failed reading boundary cache:", e);
    }
  }

  // Fetch metadata from geoBoundaries API
  try {
    const metaUrl = `https://www.geoboundaries.org/api/v4/gbOpen/${iso3.toUpperCase()}/${level}/`;
    const res = await fetch(metaUrl, {
      headers: { "User-Agent": "EyeTheWealth-Research/1.0" },
      next: { revalidate: 86400 * 7 }, // 7 days cache
    });

    if (!res.ok) {
      return { geojson: null, disclaimer, vintage: "unavailable" };
    }

    const meta = await res.json();
    const downloadUrl = meta.simplifiedGeometryGeoJSON || meta.gjDownloadURL;

    if (!downloadUrl) {
      return { geojson: null, disclaimer, vintage: meta.boundaryYearRepresented || "2021" };
    }

    const gjRes = await fetch(downloadUrl);
    if (!gjRes.ok) {
      return { geojson: null, disclaimer, vintage: meta.boundaryYearRepresented || "2021" };
    }

    const geojson = await gjRes.json();

    // Cache locally
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      fs.writeFileSync(cachePath, JSON.stringify(geojson));
    } catch (err) {
      console.warn("Failed saving boundary cache:", err);
    }

    return {
      geojson,
      disclaimer,
      vintage: meta.boundaryYearRepresented || "2021",
    };
  } catch (err) {
    console.error("Error loading geoBoundaries:", err);
    return { geojson: null, disclaimer, vintage: "unknown" };
  }
}
