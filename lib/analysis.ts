// ETW — Deterministic Analysis Engine
// No LLMs, no hallucination. Pure mathematical analysis of the ingested data.

import { prisma } from "./prisma";

export interface AnalysisResult {
  currentValue: { value: number; year: number; unit: string; displayUnit: string | null };
  rank: { position: number; outOf: number; percentile: number };
  trend: { cagr: number | null; startYear: number; endYear: number; changePercent: number | null };
  comparison: { regionalMedian: number | null; incomeGroupMedian: number | null };
  interpretations: Array<{ text: string; polarity: string; rationale: string | null }>;
  source: { name: string; url: string; methodology: string | null; collectionDate: Date | null };
}

export async function analyzeIndicatorForCountry(indicatorSlug: string, countryCode: string): Promise<AnalysisResult> {
  // 1. Fetch country and indicator
  const country = await prisma.country.findUnique({ where: { code: countryCode } });
  if (!country) throw new Error("Country not found");

  const indicator = await prisma.indicator.findUnique({ 
    where: { slug: indicatorSlug },
    include: { interpretations: true }
  });
  if (!indicator) throw new Error("Indicator not found");

  // 2. Fetch all data for this indicator for the latest year available globally
  const latestGlobalData = await prisma.dataPoint.findFirst({
    where: { indicatorId: indicator.id, value: { not: null }, country: { isAggregate: false } },
    orderBy: { year: "desc" },
  });

  if (!latestGlobalData) throw new Error("No data available for this indicator");
  const targetYear = latestGlobalData.year;

  // 3. Get all countries' data for this year to compute rank/percentile
  const allDataForYear = await prisma.dataPoint.findMany({
    where: { indicatorId: indicator.id, year: targetYear, value: { not: null }, country: { isAggregate: false } },
    include: { country: true, source: true },
    orderBy: { value: indicator.polarity === "NEGATIVE" ? "asc" : "desc" }, // rank 1 is "best" (highest if positive, lowest if negative)
  });

  const countryData = allDataForYear.find(d => d.countryId === country.id);
  if (!countryData || countryData.value === null) {
    throw new Error("No data available for this country in the latest year");
  }

  // 4. Compute rank
  const rankPosition = allDataForYear.findIndex(d => d.countryId === country.id) + 1;
  const outOf = allDataForYear.length;
  const percentile = ((outOf - rankPosition) / outOf) * 100;

  // 5. Compute historical trend (CAGR over last 10 years or max available)
  const history = await prisma.dataPoint.findMany({
    where: { indicatorId: indicator.id, countryId: country.id, value: { not: null } },
    orderBy: { year: "asc" },
  });

  let cagr = null;
  let changePercent = null;
  let startYear = targetYear;
  
  if (history.length > 1) {
    const startData = history[0];
    const endData = history[history.length - 1];
    startYear = startData.year;
    const yearsDiff = endData.year - startData.year;
    
    if (yearsDiff > 0 && startData.value !== null && endData.value !== null && startData.value > 0) {
      cagr = (Math.pow(endData.value / startData.value, 1 / yearsDiff) - 1) * 100;
      changePercent = ((endData.value - startData.value) / startData.value) * 100;
    }
  }

  // 6. Regional / Income Group comparison
  const regionalData = allDataForYear.filter(d => d.country.region === country.region).map(d => d.value as number);
  const incomeGroupData = allDataForYear.filter(d => d.country.incomeLevel === country.incomeLevel).map(d => d.value as number);

  const getMedian = (arr: number[]) => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  return {
    currentValue: {
      value: countryData.value,
      year: targetYear,
      unit: indicator.unit,
      displayUnit: indicator.displayUnit,
    },
    rank: { position: rankPosition, outOf, percentile },
    trend: { cagr, startYear, endYear: targetYear, changePercent },
    comparison: {
      regionalMedian: getMedian(regionalData),
      incomeGroupMedian: getMedian(incomeGroupData),
    },
    interpretations: indicator.interpretations.map(i => ({
      text: i.text,
      polarity: indicator.polarity,
      rationale: indicator.polarityRationale,
    })),
    source: {
      name: countryData.source?.name ?? "Unknown",
      url: countryData.sourceUrl ?? "",
      methodology: indicator.methodology,
      collectionDate: countryData.collectionDate,
    }
  };
}
