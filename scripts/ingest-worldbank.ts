/* eslint-disable */
// ETW â€” World Bank Open Data Ingestion Script
// Fetches data for defined indicators and countries from the World Bank API

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const WORLD_BANK_API_BASE = process.env.WORLD_BANK_API_BASE ?? "https://api.worldbank.org/v2";

async function main() {
  console.log("ðŸŒ Starting World Bank data ingestion...");

  const run = await prisma.ingestionRun.create({
    data: { source: "WorldBank", status: "RUNNING" },
  });

  try {
    // 1. Get source ID for World Bank
    const source = await prisma.source.findUnique({ where: { name: "World Bank" } });
    if (!source) throw new Error("World Bank source not found in database.");

    // 2. Get countries
    const countries = await prisma.country.findMany();
    if (countries.length === 0) throw new Error("No countries found.");

    // 3. Get indicators that have a World Bank Code
    const indicators = await prisma.indicator.findMany({
      where: { worldBankCode: { not: null } },
    });
    if (indicators.length === 0) throw new Error("No indicators with World Bank code found.");

    console.log(`Found ${countries.length} countries and ${indicators.length} indicators.`);

    let recordsAdded = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    // Process each indicator one by one to avoid rate limits
    for (const indicator of indicators) {
      if (!indicator.worldBankCode) continue;
      
      console.log(`\nFetching: ${indicator.name} (${indicator.worldBankCode})`);

      for (const country of countries) {
        // World Bank API expects ISO alpha-2 or alpha-3, we'll use alpha-3.
        const url = `${WORLD_BANK_API_BASE}/country/${country.code}/indicator/${indicator.worldBankCode}?format=json&per_page=50`;
        
        try {
          const response = await axios.get(url);
          const data = response.data;
          
          if (!data || !Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) {
            console.log(`  - No valid data for ${country.code}`);
            continue;
          }

          // Process the years we got back
          let pointsProcessed = 0;
          for (const item of data[1]) {
            if (item.value === null) continue; // Skip entirely null years

            const year = parseInt(item.date, 10);
            if (isNaN(year)) continue;

            const value = parseFloat(item.value);

            // Upsert the data point
            const existing = await prisma.dataPoint.findUnique({
              where: {
                indicatorId_countryId_year_sourceId: {
                  indicatorId: indicator.id,
                  countryId: country.id,
                  year: year,
                  sourceId: source.id,
                },
              },
            });

            if (existing) {
              if (existing.value !== value) {
                await prisma.dataPoint.update({
                  where: { id: existing.id },
                  data: { value, collectionDate: new Date(), verificationStatus: "OFFICIAL" },
                });
                recordsUpdated++;
              }
            } else {
              await prisma.dataPoint.create({
                data: {
                  indicatorId: indicator.id,
                  countryId: country.id,
                  year: year,
                  value: value,
                  sourceId: source.id,
                  sourceUrl: `https://data.worldbank.org/indicator/${indicator.worldBankCode}?locations=${country.code}`,
                  collectionDate: new Date(),
                  verificationStatus: "OFFICIAL",
                },
              });
              recordsAdded++;
            }
            pointsProcessed++;
          }
          console.log(`  âœ“ ${country.code}: ${pointsProcessed} years of data processed.`);
        } catch (err: any) {
          console.error(`  âœ• Error for ${country.code}: ${err.message}`);
          errors.push(`[${indicator.worldBankCode} - ${country.code}] ${err.message}`);
        }
        
        // Small delay to be polite to the API
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Complete the run
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: errors.length > 0 ? "PARTIAL" : "SUCCESS",
        completedAt: new Date(),
        recordsAdded,
        recordsUpdated,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        notes: `Successfully ingested World Bank data.`,
      },
    });

    console.log("\nâœ… Ingestion complete.");
    console.log(`   Added: ${recordsAdded} records`);
    console.log(`   Updated: ${recordsUpdated} records`);

  } catch (error: any) {
    console.error("âŒ Ingestion failed:", error);
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errors: JSON.stringify([error.message]),
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

main();

