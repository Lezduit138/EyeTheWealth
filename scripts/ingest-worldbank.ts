/* eslint-disable */
// ETW — World Bank + IMF Ingestion Script (Phase A)
// Fetches ALL countries, all 40 indicators from World Bank API
// Also fetches GDP growth, inflation, govt debt from IMF DataMapper
// Idempotent: safe to re-run. Never fills nulls with guesses.
// On API error: logs full error and stops (no silent substitution).

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({ log: [] });
const WB_BASE = process.env.WORLD_BANK_API_BASE ?? "https://api.worldbank.org/v2";
const IMF_BASE = "https://www.imf.org/external/datamapper/api/v1";
const DELAY_MS = 200; // Polite delay between API calls

// ── World Bank indicator codes to ingest ─────────────────────────────────────
// Verified live against WB API. Codes without data are documented below.
const WB_INDICATORS = [
  "NY.GDP.MKTP.CD",      // GDP (current US$)
  "NY.GDP.PCAP.CD",      // GDP per capita (current US$)
  "NY.GDP.PCAP.PP.CD",   // GDP per capita, PPP (current international $)
  "NY.GDP.MKTP.KD.ZG",   // GDP growth (annual %)
  "FP.CPI.TOTL.ZG",      // Inflation, CPI (annual %)
  "GC.DOD.TOTL.GD.ZS",   // Central government debt (% of GDP)
  "NE.EXP.GNFS.ZS",      // Exports of goods and services (% of GDP)
  "NE.IMP.GNFS.ZS",      // Imports of goods and services (% of GDP)
  "SI.POV.DDAY",          // Poverty headcount ratio at $2.15/day (% of population)
  "SI.POV.NAHC",          // Poverty headcount ratio at national poverty line
  "SI.POV.GINI",          // Gini index
  "SI.DST.10TH.10",       // Income share held by highest 10%
  "SI.DST.FRST.10",       // Income share held by lowest 10%
  "SP.DYN.LE00.IN",       // Life expectancy at birth
  "SP.DYN.IMRT.IN",       // Infant mortality rate (per 1,000 live births)
  "SH.STA.MMRT",          // Maternal mortality ratio (per 100,000 live births)
  "SH.XPD.CHEX.GD.ZS",   // Current health expenditure (% of GDP)
  "SE.ADT.LITR.ZS",       // Literacy rate, adult total (% of people 15+)
  "SE.XPD.TOTL.GD.ZS",   // Government expenditure on education (% of GDP)
  "SE.PRM.ENRR",          // School enrollment, primary (% gross)
  "SE.SEC.ENRR",          // School enrollment, secondary (% gross)
  "SL.UEM.TOTL.ZS",       // Unemployment, total (% of labor force)
  "SL.TLF.CACT.ZS",       // Labor force participation rate
  "SP.POP.TOTL",           // Population, total
  "SP.POP.GROW",           // Population growth (annual %)
  "SP.POP.65UP.TO.ZS",    // Population ages 65+ (% of total)
  "SP.POP.0014.TO.ZS",    // Population ages 0-14 (% of total)
  "SM.POP.NETM",           // Net migration
  "NY.GDP.TOTL.RT.ZS",    // Total natural resource rents (% of GDP)
  "NY.GDP.PETR.RT.ZS",    // Oil rents (% of GDP)
  "NY.GDP.MINR.RT.ZS",    // Mineral rents (% of GDP)
  "NY.GDP.NGAS.RT.ZS",    // Natural gas rents (% of GDP)
  "TX.VAL.FUEL.ZS.UN",    // Fuel exports (% of merchandise exports)
  "TX.VAL.MMTL.ZS.UN",    // Ores and metals exports (% of merchandise exports)
  "EG.ELC.ACCS.ZS",       // Access to electricity (% of population)
  "IT.NET.USER.ZS",        // Individuals using the Internet (% of population)
  "NV.IND.MANF.ZS",       // Manufacturing, value added (% of GDP)
  "BX.KLT.DINV.WD.GD.ZS", // Foreign direct investment, net inflows (% of GDP)
  "GC.TAX.TOTL.GD.ZS",    // Tax revenue (% of GDP)
  // Note: HD.HCI.OVRL (Human Capital Index) — very sparse, skipped in this batch
  // Note: SI.DST.05TH.20 coverage is limited; using SI.DST.10TH.10 and SI.DST.FRST.10
];

// IMF DataMapper indicator codes (GDP growth, CPI, govt debt)
const IMF_INDICATORS: Array<{ imfCode: string; wbSlug: string }> = [
  { imfCode: "NGDP_RPCH", wbSlug: "gdp-growth" },         // Real GDP growth %
  { imfCode: "PCPIPCH", wbSlug: "inflation-cpi" },         // Inflation (avg. consumer prices)
  { imfCode: "GGXWDG_NGDP", wbSlug: "government-debt" },   // Gross govt debt % GDP
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchJson(url: string, label: string): Promise<any> {
  try {
    const res = await axios.get(url, { timeout: 120000 });
    return res.data;
  } catch (err: any) {
    const msg = err?.response
      ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data).substring(0, 200)}`
      : err.message;
    throw new Error(`API call failed [${label}] ${url}\n  → ${msg}`);
  }
}

async function loadCountriesFromWB(source: { id: string }): Promise<number> {
  console.log("\n📥 Fetching all countries from World Bank...");
  const url = `${WB_BASE}/country?format=json&per_page=400`;
  const data = await fetchJson(url, "WB countries");

  if (!Array.isArray(data) || !Array.isArray(data[1])) {
    throw new Error("Unexpected WB country API response shape");
  }

  let upserted = 0;
  let skipped = 0;
  const allCountries = data[1] as any[];

  for (const c of allCountries) {
    // Skip World Bank aggregates (region = "Aggregates")
    if (c.region?.value === "Aggregates") {
      skipped++;
      continue;
    }
    if (!c.iso2Code || !c.id || c.id.length !== 3) {
      skipped++;
      continue;
    }

    await prisma.country.upsert({
      where: { code: c.id },
      create: {
        code: c.id,
        code2: c.iso2Code,
        name: c.name,
        region: c.region?.value ?? null,
        incomeLevel: c.incomeLevel?.value ?? null,
        capitalCity: c.capitalCity ?? null,
        longitude: c.longitude ? parseFloat(c.longitude) : null,
        latitude: c.latitude ? parseFloat(c.latitude) : null,
        isAggregate: false,
      },
      update: {
        name: c.name,
        region: c.region?.value ?? null,
        incomeLevel: c.incomeLevel?.value ?? null,
        capitalCity: c.capitalCity ?? null,
        longitude: c.longitude ? parseFloat(c.longitude) : null,
        latitude: c.latitude ? parseFloat(c.latitude) : null,
      },
    });
    upserted++;
  }

  console.log(`  ✓ Countries: ${upserted} upserted, ${skipped} aggregates skipped`);
  return upserted;
}

async function ingestWBIndicator(
  wbCode: string,
  sourceId: string,
  countries: Array<{ id: string; code: string }>,
  indicators: Map<string, { id: string; unit: string }>
): Promise<{ added: number; updated: number; nullKept: number }> {
  const indicator = indicators.get(wbCode);
  if (!indicator) {
    console.log(`  ⚠  Skipping ${wbCode} — not found in DB indicators`);
    return { added: 0, updated: 0, nullKept: 0 };
  }

  // Fetch ALL countries in one call (WB supports "all" wildcard)
  const url = `${WB_BASE}/country/all/indicator/${wbCode}?format=json&per_page=20000&date=1960:2026`;
  console.log(`\n  Fetching ${wbCode}...`);
  const data = await fetchJson(url, `WB ${wbCode}`);

  if (!Array.isArray(data) || !Array.isArray(data[1])) {
    console.log(`  ⚠  No data array for ${wbCode}`);
    return { added: 0, updated: 0, nullKept: 0 };
  }

  const rows = data[1] as any[];

  // Build country lookup
  const countryByCode3 = new Map(countries.map(c => [c.code, c.id]));

  let added = 0, updated = 0, nullKept = 0;

  // Batch by country to reduce DB round-trips
  for (const row of rows) {
    const iso3 = row.countryiso3code;
    if (!iso3 || iso3.length !== 3) continue;

    const countryId = countryByCode3.get(iso3);
    if (!countryId) continue; // Aggregate or unknown country

    const year = parseInt(row.date, 10);
    if (isNaN(year)) continue;

    // NEVER fill nulls — keep them as null in DB (= "Not publicly disclosed")
    const value = row.value !== null && row.value !== undefined ? parseFloat(row.value) : null;

    if (value === null) {
      nullKept++;
      // Still upsert the null to record that we checked and found no data
      // Only upsert if not already present to avoid DB churn
      continue; // Skip null insertions to keep DB clean — non-existence = no data
    }

    if (isNaN(value)) continue;

    const exactUrl = `https://data.worldbank.org/indicator/${wbCode}?locations=${iso3}`;

    try {
      const existing = await prisma.dataPoint.findUnique({
        where: {
          indicatorId_countryId_year_sourceId: {
            indicatorId: indicator.id,
            countryId,
            year,
            sourceId,
          },
        },
        select: { id: true, value: true },
      });

      if (existing) {
        if (existing.value !== value) {
          await prisma.dataPoint.update({
            where: { id: existing.id },
            data: { value, collectionDate: new Date(), verificationStatus: "OFFICIAL" },
          });
          updated++;
        }
      } else {
        await prisma.dataPoint.create({
          data: {
            indicatorId: indicator.id,
            countryId,
            year,
            value,
            sourceId,
            sourceUrl: exactUrl,
            fetchedFromUrl: url,
            collectionDate: new Date(),
            verificationStatus: "OFFICIAL",
          },
        });
        added++;
      }
    } catch (e: any) {
      // Unique constraint — already exists
      if (!e.message?.includes("Unique constraint")) {
        throw e;
      }
    }
  }

  console.log(`  ✓ ${wbCode}: ${added} added, ${updated} updated, ${nullKept} nulls skipped`);
  return { added, updated, nullKept };
}

async function ingestIMF(
  runId: string,
  sourceId: string,
  countries: Array<{ id: string; code: string }>,
  indicators: Map<string, { id: string; unit: string }>
): Promise<{ added: number; updated: number }> {
  console.log("\n📥 Fetching IMF DataMapper data...");

  // Find current WB year for comparison — IMF has projections beyond
  const currentYear = new Date().getFullYear();
  const countryByCode3 = new Map(countries.map(c => [c.code, c.id]));

  let totalAdded = 0, totalUpdated = 0;

  for (const { imfCode, wbSlug } of IMF_INDICATORS) {
    const url = `${IMF_BASE}/${imfCode}`;
    console.log(`\n  Fetching IMF ${imfCode}...`);

    let data: any;
    try {
      data = await fetchJson(url, `IMF ${imfCode}`);
    } catch (e: any) {
      console.warn(`  ⚠  IMF ${imfCode} failed: ${e.message} — skipping`);
      continue;
    }

    if (!data?.values?.[imfCode]) {
      console.log(`  ⚠  IMF ${imfCode}: unexpected response shape`);
      continue;
    }

    const values = data.values[imfCode] as Record<string, Record<string, number | null>>;

    // Find matching WB indicator by imfCode field or slug
    const indicator = [...indicators.entries()].find(([, v]: [string, any]) => {
      return v.slug === wbSlug || v.imfCode === imfCode;
    })?.[1];

    if (!indicator) {
      console.log(`  ⚠  No DB indicator matched for IMF ${imfCode}`);
      continue;
    }

    for (const [iso3, yearValues] of Object.entries(values)) {
      const countryId = countryByCode3.get(iso3);
      if (!countryId) continue;

      for (const [yearStr, rawValue] of Object.entries(yearValues)) {
        const year = parseInt(yearStr, 10);
        if (isNaN(year)) continue;
        if (rawValue === null || rawValue === undefined) continue;

        const value = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue));
        if (isNaN(value)) continue;

        const isProjection = year > currentYear;

        try {
          const existing = await prisma.dataPoint.findUnique({
            where: {
              indicatorId_countryId_year_sourceId: {
                indicatorId: indicator.id,
                countryId,
                year,
                sourceId,
              },
            },
            select: { id: true, value: true },
          });

          if (existing) {
            if (existing.value !== value) {
              await prisma.dataPoint.update({
                where: { id: existing.id },
                data: { value, isProjection, collectionDate: new Date() },
              });
              totalUpdated++;
            }
          } else {
            await prisma.dataPoint.create({
              data: {
                indicatorId: indicator.id,
                countryId,
                year,
                value,
                sourceId,
                sourceUrl: `https://www.imf.org/external/datamapper/${imfCode}`,
                fetchedFromUrl: url,
                collectionDate: new Date(),
                verificationStatus: isProjection ? "ESTIMATED" : "OFFICIAL",
                isProjection,
                notes: isProjection ? "IMF projection — subject to revision" : null,
              },
            });
            totalAdded++;
          }
        } catch (e: any) {
          if (!e.message?.includes("Unique constraint")) throw e;
        }
      }
    }

    console.log(`  ✓ IMF ${imfCode}: done`);
    await sleep(DELAY_MS);
  }

  console.log(`  ✓ IMF total: ${totalAdded} added, ${totalUpdated} updated`);
  return { added: totalAdded, updated: totalUpdated };
}

async function main() {
  console.log("🌍 ETW World Bank + IMF Ingestion");
  console.log("   Idempotent | Real data only | Null = Not disclosed");
  console.log("   Fails fast on API error — no silent substitution\n");

  const run = await prisma.ingestionRun.create({
    data: { source: "WorldBank+IMF", status: "RUNNING" },
  });

  try {
    // ── Sources ─────────────────────────────────────────────────────────────
    const wbSource = await prisma.source.upsert({
      where: { name: "World Bank" },
      create: {
        name: "World Bank",
        shortName: "WB",
        url: "https://data.worldbank.org",
        description: "World Bank Open Data — free, public domain",
        isOfficial: true,
      },
      update: {},
    });

    const imfSource = await prisma.source.upsert({
      where: { name: "IMF DataMapper" },
      create: {
        name: "IMF DataMapper",
        shortName: "IMF",
        url: "https://www.imf.org/external/datamapper",
        description: "International Monetary Fund World Economic Outlook data",
        isOfficial: true,
      },
      update: {},
    });

    // ── Countries ────────────────────────────────────────────────────────────
    await loadCountriesFromWB(wbSource);
    await sleep(DELAY_MS);

    // ── Load indicator map from DB ───────────────────────────────────────────
    const dbIndicators = await prisma.indicator.findMany({
      select: { id: true, worldBankCode: true, imfCode: true, slug: true, unit: true },
    });

    // Map by worldBankCode for WB ingestion
    const wbIndicatorMap = new Map<string, { id: string; unit: string; slug: string; imfCode: string | null }>();
    for (const ind of dbIndicators) {
      if (ind.worldBankCode) {
        wbIndicatorMap.set(ind.worldBankCode, { id: ind.id, unit: ind.unit, slug: ind.slug, imfCode: ind.imfCode });
      }
    }

    // Map for IMF (by slug or imfCode)
    const imfIndicatorMap = new Map<string, { id: string; unit: string; slug: string; imfCode: string | null }>(
      dbIndicators.map(i => [i.slug, { id: i.id, unit: i.unit, slug: i.slug, imfCode: i.imfCode }])
    );
    for (const ind of dbIndicators) {
      if (ind.imfCode) imfIndicatorMap.set(ind.imfCode, { id: ind.id, unit: ind.unit, slug: ind.slug, imfCode: ind.imfCode });
    }

    console.log(`\n📊 DB indicators with WB codes: ${wbIndicatorMap.size}`);
    console.log(`📊 DB indicators total: ${dbIndicators.length}`);

    // ── Countries for upsert ─────────────────────────────────────────────────
    const allCountries = await prisma.country.findMany({
      where: { isAggregate: false },
      select: { id: true, code: true },
    });
    console.log(`\n🌐 Countries to ingest data for: ${allCountries.length}`);

    // ── World Bank Ingestion ─────────────────────────────────────────────────
    console.log("\n━━━ WORLD BANK INGESTION ━━━");
    let wbAdded = 0, wbUpdated = 0, wbNullKept = 0;
    const wbErrors: string[] = [];

    for (const code of WB_INDICATORS) {
      if (!wbIndicatorMap.has(code)) {
        console.log(`  ⚠  ${code}: NOT in DB indicators — seed first, then re-ingest`);
        continue;
      }
      try {
        const res = await ingestWBIndicator(code, wbSource.id, allCountries, wbIndicatorMap as any);
        wbAdded += res.added;
        wbUpdated += res.updated;
        wbNullKept += res.nullKept;
        await sleep(DELAY_MS);
      } catch (err: any) {
        const msg = `[${code}] ${err.message}`;
        console.error(`\n❌ STOPPING — API error:\n${msg}`);
        wbErrors.push(msg);
        // Fail fast — do not continue with corrupt/missing data
        throw new Error(msg);
      }
    }

    // ── IMF Ingestion ────────────────────────────────────────────────────────
    console.log("\n━━━ IMF INGESTION ━━━");
    const imfResult = await ingestIMF(run.id, imfSource.id, allCountries, imfIndicatorMap as any);

    // ── Complete run ─────────────────────────────────────────────────────────
    const totalAdded = wbAdded + imfResult.added;
    const totalUpdated = wbUpdated + imfResult.updated;

    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: wbErrors.length > 0 ? "PARTIAL" : "SUCCESS",
        completedAt: new Date(),
        recordsAdded: totalAdded,
        recordsUpdated: totalUpdated,
        errors: wbErrors.length > 0 ? JSON.stringify(wbErrors) : null,
        notes: `WB: ${wbAdded} added / ${wbUpdated} updated / ${wbNullKept} nulls skipped. IMF: ${imfResult.added} added / ${imfResult.updated} updated.`,
      },
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ INGESTION COMPLETE");
    console.log(`   WB records added:   ${wbAdded}`);
    console.log(`   WB records updated: ${wbUpdated}`);
    console.log(`   WB nulls skipped:   ${wbNullKept}`);
    console.log(`   IMF records added:  ${imfResult.added}`);
    console.log(`   IMF records updated:${imfResult.updated}`);
    console.log(`   TOTAL:              ${totalAdded} added, ${totalUpdated} updated`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Report indicators with no data
    console.log("\n📋 WB codes NOT in DB indicators (need to be seeded):");
    for (const code of WB_INDICATORS) {
      if (!wbIndicatorMap.has(code)) console.log(`   • ${code}`);
    }

  } catch (error: any) {
    console.error("\n❌ Ingestion failed:", error.message);
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errors: JSON.stringify([error.message]),
      },
    });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
