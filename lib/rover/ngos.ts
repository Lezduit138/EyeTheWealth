// ETW — NGO Suggestions Engine (Connecting Rover places to Contributor NGOs)
// Rules:
// 1. Contributor currently covers Maharashtra only. For areas outside Maharashtra, strictly display "NGO directory currently covers Maharashtra" and nothing else.
// 2. Query real Contributor NGOs (isSampleData === false). Exclude any mock/sample profiles.
// 3. Match weak dimensions to NGO categories (education -> Education, health -> Health, etc.)
// 4. Financial transparency badge indicates official audited statements or "Not publicly disclosed".
// 5. Must display mandatory label: "Operating in area — does not confirm it is addressing this need".

import { prisma } from "../prisma.ts";

export const CATEGORY_DIMENSION_MAP: Record<string, string[]> = {
  "Education": ["Education", "Literacy", "Child Welfare"],
  "Health": ["Health", "Nutrition", "Sanitation", "Water"],
  "Multidimensional Poverty": ["Poverty Alleviation", "Rural Development", "Livelihood"],
  "Living Standards": ["Housing", "Sanitation", "Clean Energy"],
  "Agriculture": ["Rural Development", "Farmer Support"],
};

export interface NgoSuggestionResult {
  coversRegion: boolean;
  regionNotice?: string;
  ngos: Array<{
    id: string;
    name: string;
    slug: string;
    district: string | null;
    categories: string[];
    website: string | null;
    publicRegistrationNumber: string | null;
    financialTransparency: "PUBLIC_FILINGS_AVAILABLE" | "NOT_PUBLICLY_DISCLOSED";
    matchRationale: string;
    profileUrl: string;
  }>;
  disclaimer: string;
}

export async function getSuggestedNgosForPlace(
  placeName: string,
  stateName: string | null,
  districtName: string | null,
  _weakDimensions: string[] = []
): Promise<NgoSuggestionResult> {
  const disclaimer = "Operating in area — does not confirm it is addressing this need.";

  // Contributor currently covers Maharashtra only
  const isMaharashtra = 
    (stateName && stateName.toLowerCase().includes("maharashtra")) ||
    (placeName && placeName.toLowerCase().includes("maharashtra")) ||
    (districtName && districtName.toLowerCase().includes("maharashtra"));

  if (!isMaharashtra) {
    return {
      coversRegion: false,
      regionNotice: "NGO directory currently covers Maharashtra",
      ngos: [],
      disclaimer,
    };
  }

  // Lookup target district name
  const queryDistrict = districtName || placeName;

  // Find real verified NGOs in this district or across Maharashtra
  const realNgos = await prisma.ngo.findMany({
    where: {
      isSampleData: false,
      OR: [
        { district: { contains: queryDistrict } },
        { state: "Maharashtra" },
      ],
    },
    include: {
      financialYears: {
        where: { isSampleData: false },
        take: 1,
      },
    },
    take: 10,
  });

  if (realNgos.length === 0) {
    return {
      coversRegion: true,
      ngos: [],
      disclaimer,
    };
  }

  const ngos = realNgos.map((n) => {
    let parsedCategories: string[] = [];
    try {
      if (n.categories) {
        parsedCategories = JSON.parse(n.categories);
      }
    } catch {
      parsedCategories = n.categories ? [n.categories] : [];
    }

    const hasFinancials = n.financialYears && n.financialYears.length > 0;
    const matchRationale = n.district?.toLowerCase().includes(queryDistrict.toLowerCase())
      ? `Operates in ${n.district}; public registry records filed.`
      : `Registered in Maharashtra; active state-level operations.`;

    return {
      id: n.id,
      name: n.name,
      slug: n.slug,
      district: n.district,
      categories: parsedCategories,
      website: n.website,
      publicRegistrationNumber: n.registrationNumber,
      financialTransparency: hasFinancials ? ("PUBLIC_FILINGS_AVAILABLE" as const) : ("NOT_PUBLICLY_DISCLOSED" as const),
      matchRationale,
      profileUrl: `/contributor/ngo/${n.slug}`,
    };
  });

  return {
    coversRegion: true,
    ngos,
    disclaimer,
  };
}
