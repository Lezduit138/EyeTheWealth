/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const WB_BASE = "https://api.worldbank.org/v2";

const CORE_COUNTRIES = ["IND", "USA", "CHN", "DEU", "GBR", "JPN", "FRA", "BRA"];

const INDICATOR_MAP: Array<{ code: string; slugs: string[] }> = [
  { code: "NY.GDP.PCAP.CD", slugs: ["gdp-per-capita", "gdp-per-capita-usd"] },
  { code: "NY.GDP.MKTP.CD", slugs: ["gdp-total", "gdp-current-usd"] },
  { code: "NY.GDP.MKTP.KD.ZG", slugs: ["gdp-growth", "gdp-growth-annual"] },
  { code: "FP.CPI.TOTL.ZG", slugs: ["inflation-cpi", "inflation-consumer-prices"] },
  { code: "SP.DYN.LE00.IN", slugs: ["life-expectancy", "life-expectancy-birth"] },
  { code: "SP.POP.TOTL", slugs: ["population-total", "total-population"] },
  { code: "SL.UEM.TOTL.ZS", slugs: ["unemployment", "unemployment-rate"] },
  { code: "GC.DOD.TOTL.GD.ZS", slugs: ["govt-debt", "government-debt-gdp"] },
  { code: "SI.POV.DDAY", slugs: ["poverty-215-day", "poverty-headcount-215"] },
  { code: "SI.POV.GINI", slugs: ["gini-index", "gini-coefficient"] },
];

async function main() {
  console.log("🚀 Ingesting core World Bank data for ETW...");

  const source = await prisma.source.findFirst({ where: { name: "World Bank" } });
  if (!source) throw new Error("World Bank source not found in database");

  const countries = await prisma.country.findMany();
  const countryByCode = new Map(countries.map(c => [c.code, c]));

  let totalAdded = 0;

  for (const { code, slugs } of INDICATOR_MAP) {
    console.log(`\nFetching ${code} for core countries...`);
    
    // First fetch historical 1990:2024 for core countries
    const coreUrl = `${WB_BASE}/country/${CORE_COUNTRIES.join(";")}/indicator/${code}?format=json&date=1990:2024&per_page=1000`;
    try {
      const res = await axios.get(coreUrl, { timeout: 30000 });
      const rows = Array.isArray(res.data) && Array.isArray(res.data[1]) ? res.data[1] : [];
      console.log(`  Received ${rows.length} records for core countries`);

      // Find matching indicators in DB
      const dbIndicators = await prisma.indicator.findMany({
        where: { slug: { in: slugs } },
      });

      for (const row of rows) {
        const iso3 = row.countryiso3code;
        const country = countryByCode.get(iso3);
        if (!country) continue;
        const year = parseInt(row.date, 10);
        if (isNaN(year)) continue;
        if (row.value === null || row.value === undefined) continue;
        const value = parseFloat(row.value);
        if (isNaN(value)) continue;

        for (const ind of dbIndicators) {
          await prisma.dataPoint.upsert({
            where: {
              indicatorId_countryId_year_sourceId: {
                indicatorId: ind.id,
                countryId: country.id,
                year,
                sourceId: source.id,
              },
            },
            create: {
              indicatorId: ind.id,
              countryId: country.id,
              year,
              value,
              sourceId: source.id,
              sourceUrl: `https://data.worldbank.org/indicator/${code}?locations=${iso3}`,
              fetchedFromUrl: coreUrl,
              verificationStatus: "OFFICIAL",
            },
            update: {
              value,
              verificationStatus: "OFFICIAL",
            },
          });
          totalAdded++;
        }
      }
    } catch (err: any) {
      console.error(`  Failed to fetch ${code}: ${err.message}`);
    }

    // Now fetch latest 2020:2024 for all countries to populate globe heatmap
    const allUrl = `${WB_BASE}/country/all/indicator/${code}?format=json&date=2020:2024&per_page=2000`;
    try {
      const res = await axios.get(allUrl, { timeout: 30000 });
      const rows = Array.isArray(res.data) && Array.isArray(res.data[1]) ? res.data[1] : [];
      console.log(`  Received ${rows.length} global records for heatmap`);

      const dbIndicators = await prisma.indicator.findMany({
        where: { slug: { in: slugs } },
      });

      for (const row of rows) {
        const iso3 = row.countryiso3code;
        const country = countryByCode.get(iso3);
        if (!country) continue;
        const year = parseInt(row.date, 10);
        if (isNaN(year)) continue;
        if (row.value === null || row.value === undefined) continue;
        const value = parseFloat(row.value);
        if (isNaN(value)) continue;

        for (const ind of dbIndicators) {
          await prisma.dataPoint.upsert({
            where: {
              indicatorId_countryId_year_sourceId: {
                indicatorId: ind.id,
                countryId: country.id,
                year,
                sourceId: source.id,
              },
            },
            create: {
              indicatorId: ind.id,
              countryId: country.id,
              year,
              value,
              sourceId: source.id,
              sourceUrl: `https://data.worldbank.org/indicator/${code}?locations=${iso3}`,
              fetchedFromUrl: allUrl,
              verificationStatus: "OFFICIAL",
            },
            update: {
              value,
              verificationStatus: "OFFICIAL",
            },
          });
          totalAdded++;
        }
      }
    } catch (err: any) {
      console.error(`  Global fetch warning for ${code}: ${err.message}`);
    }
  }

  console.log(`\n🎉 Completed! Total data points upserted: ${totalAdded}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
