// ETW — /api/v1/rover/factors — Source-backed deterministic factors engine
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, checkRateLimit, getClientIp } from "@/lib/api";
import { FACTOR_KNOWLEDGE_BASE } from "@/lib/rover/factors";

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
        deprivationFlags: true,
        assetRecords: true,
      },
    });

    if (!place) return apiError("Place not found", 404);

    const flag = place.deprivationFlags[0] || null;
    let weakDimensions: Array<{ dimension: string; indicator: string; value: number }> = [];
    if (flag?.weakDimensions) {
      try {
        weakDimensions = JSON.parse(flag.weakDimensions);
      } catch (e) {
        console.warn(e);
      }
    }

    // Build deterministic cited factor explanations
    const factorsList = [];
    for (const w of weakDimensions) {
      let key = "poverty_mpi";
      if (w.dimension.toLowerCase().includes("education")) key = "literacy";
      if (w.dimension.toLowerCase().includes("living") || w.dimension.toLowerCase().includes("sanitation")) key = "sanitation_water";

      const kb = FACTOR_KNOWLEDGE_BASE[key];
      if (kb) {
        factorsList.push({
          factorName: `${w.dimension} Challenge`,
          indicator: w.indicator,
          observedValue: w.value,
          hedgedExplanation: `${kb.explanation} Empirical studies associate lower baseline values in this dimension with structural capital constraints.`,
          citations: kb.citations,
        });
      }
    }

    return apiSuccess({
      place: {
        id: place.id,
        name: place.name,
        level: place.level,
      },
      factorsThatMayContribute: factorsList,
      whatThisDoesNotCapture: [
        "Informal localized economic networks and unregistered household transfers.",
        "Seasonal intra-year weather volatility occurring after published census dates.",
        "Non-monetary community mutual aid and social safety networks.",
      ],
      limitationsAndCoverage: "Computed deterministically from Census 2011, NFHS-5 (2019-21), and NITI Aayog National MPI (2023).",
      etwNotice: "ETW INTERPRETATION — not an official statistic. Statements reflect published source literature without causal claims beyond cited papers.",
    });
  } catch (err) {
    console.error("Error fetching factors:", err);
    return apiError("Internal server error", 500);
  }
}
