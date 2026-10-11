// ETW — /api/v1/rover/admin/csv-import — Strict CSV Importer requiring sourceUrl, year, level
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip, 30);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  try {
    const body = await request.json();
    const { csvContent, categorySlug } = body;

    if (!csvContent) {
      return apiError("Missing 'csvContent' parameter", 400);
    }

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    const accepted: unknown[] = [];
    const rejected: Array<{ row: number; reason: string }> = [];

    let rowIdx = 1;
    for (const r of records) {
      rowIdx++;
      const { placeSlug, indicatorName, value, unit, year, level, sourceName, sourceUrl } = r;

      // Validation: Required fields
      if (!placeSlug || !indicatorName || !unit || !year || !level || !sourceName || !sourceUrl) {
        rejected.push({
          row: rowIdx,
          reason: "Missing mandatory fields (placeSlug, indicatorName, unit, year, level, sourceName, sourceUrl)",
        });
        continue;
      }

      // Check Place exists
      const place = await prisma.place.findUnique({ where: { slug: placeSlug } });
      if (!place) {
        rejected.push({ row: rowIdx, reason: `Place slug '${placeSlug}' does not exist` });
        continue;
      }

      // Find category
      const cat = await prisma.assetCategory.findFirst({
        where: categorySlug ? { slug: categorySlug } : undefined,
      });

      if (!cat) {
        rejected.push({ row: rowIdx, reason: "Asset category not found" });
        continue;
      }

      const numVal = value !== "" && value !== null && value !== undefined ? parseFloat(value) : null;

      // Upsert record
      const record = await prisma.assetRecord.create({
        data: {
          placeId: place.id,
          categoryId: cat.id,
          indicatorName,
          value: numVal,
          unit,
          year: parseInt(year, 10),
          level,
          sourceName,
          sourceUrl,
          isEstimate: r.isEstimate === "true",
          methodology: r.methodology || null,
        },
      });

      accepted.push({ row: rowIdx, id: record.id, place: place.name });
    }

    return apiSuccess({
      acceptedCount: accepted.length,
      rejectedCount: rejected.length,
      accepted,
      rejected,
      notice: "ETW Rover zero-placeholder rule enforced. Only real data with documented source URLs accepted.",
    });
  } catch (err) {
    console.error("CSV import error:", err);
    return apiError("Failed to parse CSV import", 500);
  }
}
