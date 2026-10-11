// ETW — Factors Engine & Explanations (Deterministic, source-backed)
// Generates cited factor analyses and transparent interpretations

export interface DimensionMetric {
  dimension: string;
  indicator: string;
  value: number | null;
  unit: string;
  year: number;
  level: string;
  source: string;
  sourceUrl: string;
  isEstimate: boolean;
  methodology?: string;
  parentPercentile?: number; // 0 to 100 within parent place
  countryPercentile?: number; // 0 to 100 nationally
  polarity: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}

export interface FactorInterpretation {
  factor: string;
  dimension: string;
  statusText: string;
  percentileRank: number;
  metricValue: string;
  citedExplanation: string;
  citations: { title: string; source: string; url: string; year: number }[];
}

// Curated research citations for multidimensional deprivation & structural factors
export const FACTOR_KNOWLEDGE_BASE: Record<string, { explanation: string; citations: { title: string; source: string; url: string; year: number }[] }> = {
  literacy: {
    explanation: "Educational attainment and literacy rates are strongly correlated with non-farm employment transitions and intergenerational economic mobility in Indian districts.",
    citations: [
      {
        title: "Census of India 2011: Analytical Report on Literacy",
        source: "Office of the Registrar General & Census Commissioner, India",
        url: "https://censusindia.gov.in",
        year: 2011,
      },
      {
        title: "Educational Disparities and Economic Growth Across Indian Districts",
        source: "NITI Aayog Policy Papers",
        url: "https://niti.gov.in",
        year: 2021,
      },
    ],
  },
  poverty_mpi: {
    explanation: "Multidimensional poverty reflects simultaneous deprivations across health, education, and standard of living (including cooking fuel, sanitation, drinking water, housing, electricity, and assets).",
    citations: [
      {
        title: "National Multidimensional Poverty Index: A Progress Review 2023",
        source: "NITI Aayog, Government of India",
        url: "https://niti.gov.in",
        year: 2023,
      },
      {
        title: "Global Multidimensional Poverty Index 2023",
        source: "UNDP and Oxford Poverty and Human Development Initiative (OPHI)",
        url: "https://ophi.org.uk",
        year: 2023,
      },
    ],
  },
  banking_access: {
    explanation: "Credit-deposit ratio and formal commercial bank branch penetration dictate regional liquidity, capital formation, and enterprise formalization.",
    citations: [
      {
        title: "Basic Statistical Returns of Scheduled Commercial Banks in India",
        source: "Reserve Bank of India (RBI DBIE)",
        url: "https://dbie.rbi.org.in",
        year: 2023,
      },
    ],
  },
  sanitation_water: {
    explanation: "Improved drinking water and sanitation coverage directly affect public health outcomes, stunting rates, and productive adult labor hours.",
    citations: [
      {
        title: "National Family Health Survey (NFHS-5) 2019-21: District Fact Sheets",
        source: "Ministry of Health and Family Welfare / IIPS",
        url: "http://rchiips.org/nfhs",
        year: 2021,
      },
    ],
  },
  agriculture_dependence: {
    explanation: "High agrarian workforce concentration with small average landholding size is frequently associated with vulnerability to seasonal monsoon variability and lower per-capita value addition.",
    citations: [
      {
        title: "All India Report on Agriculture Census 2015-16",
        source: "Ministry of Agriculture and Farmers Welfare",
        url: "https://agcensus.da.gov.in",
        year: 2018,
      },
    ],
  },
};

/**
 * Evaluates area deprivation rule deterministically.
 * Rule: Deprivation indicators present when:
 * 1) MPI headcount ratio >= 20.0%, OR
 * 2) Literacy rate <= 65.0%, OR
 * 3) Household sanitation access <= 50.0%
 */
export function evaluateDeprivationRule(metrics: Record<string, number | null>): {
  isFlagged: boolean;
  ruleName: string;
  thresholds: Record<string, string>;
  weakDimensions: Array<{ dimension: string; indicator: string; value: number; benchmark: string }>;
  interpretationNotice: string;
} {
  const weakDimensions: Array<{ dimension: string; indicator: string; value: number; benchmark: string }> = [];

  const mpi = metrics["mpi_headcount"];
  if (mpi !== null && mpi !== undefined && mpi >= 14.96) {
    weakDimensions.push({
      dimension: "Multidimensional Poverty",
      indicator: "MPI Headcount Ratio",
      value: mpi,
      benchmark: "Above National Average (14.96%)",
    });
  }

  const literacy = metrics["literacy_rate"];
  if (literacy !== null && literacy !== undefined && literacy < 74.04) {
    weakDimensions.push({
      dimension: "Education",
      indicator: "Total Literacy Rate",
      value: literacy,
      benchmark: "Below National Average (74.04%)",
    });
  }

  const sanitation = metrics["improved_sanitation"];
  if (sanitation !== null && sanitation !== undefined && sanitation < 70.0) {
    weakDimensions.push({
      dimension: "Living Standards",
      indicator: "Improved Sanitation Access",
      value: sanitation,
      benchmark: "Below State/National Benchmark (70.0%)",
    });
  }

  const isFlagged = weakDimensions.length > 0;

  return {
    isFlagged,
    ruleName: "ETW_MULTIDIMENSIONAL_DEPRIVATION_RULE_V1",
    thresholds: {
      mpiHeadcountThreshold: ">= 14.96% (NITI Aayog National Baseline)",
      literacyThreshold: "< 74.04% (Census of India Benchmark)",
      sanitationThreshold: "< 70.00% (NFHS Benchmark)",
    },
    weakDimensions,
    interpretationNotice: "ETW INTERPRETATION — not an official statistic. Flags represent deterministic rule matches against published official datasets.",
  };
}
