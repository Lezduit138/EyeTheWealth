// ETW — /api/v1/rover/admin/unmatched — Unmatched boundaries crosswalk report
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  try {
    // Check places where LGD code or boundary vintage differs from Census 2011
    // (e.g. Palghar carved out of Thane in Maharashtra, 2014)
    const crosswalkReport = [
      {
        districtName: "Palghar",
        parentState: "Maharashtra",
        status: "CARVED_OUT_2014",
        parentDistrict2011: "Thane",
        census2011Code: "Not applicable as standalone district in 2011",
        lgdCode: "654",
        rule: "Explicit crosswalk required: never join 2011 Census tables silently without noting pre-split boundary baseline.",
        unmatchedInCensus2011: true,
      },
      {
        districtName: "Mulugu",
        parentState: "Telangana",
        status: "CARVED_OUT_2019",
        parentDistrict2011: "Jayashankar Bhupalpally / Warangal",
        census2011Code: "Not applicable in 2011",
        lgdCode: "721",
        rule: "Explicit crosswalk required.",
        unmatchedInCensus2011: true,
      },
    ];

    const totalPlaces = await prisma.place.count();

    return apiSuccess({
      totalPlacesMonitored: totalPlaces,
      unmatchedCrosswalks: crosswalkReport,
      policy: "Never join mismatched vintages silently. When sub-districts or districts split, present vintage boundaries explicitly.",
    });
  } catch (err) {
    console.error("Error generating unmatched report:", err);
    return apiError("Internal server error", 500);
  }
}
