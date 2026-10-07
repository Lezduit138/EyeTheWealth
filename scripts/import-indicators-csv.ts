/* eslint-disable @typescript-eslint/no-explicit-any */
// ETW — Manual Data Importer (CSV)
// For Wealth and HDI indicators where no free machine-readable API exists.
// Expects CSV with headers: indicator_slug, country_code, year, value, unit, source_name, source_url, notes

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npm run import:csv <path-to-csv>");
    console.error("CSV must have headers: indicator_slug, country_code, year, value, unit, source_name, source_url, notes");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, { columns: true, skip_empty_lines: true }) as any[];

  console.log(`\n📄 Parsing ${records.length} records from ${filePath}...`);

  let added = 0;
  let updated = 0;
  let errors = 0;

  for (const row of records) {
    try {
      if (!row.indicator_slug || !row.country_code || !row.year || !row.value || !row.source_url) {
        throw new Error(`Missing required fields: ${JSON.stringify(row)}`);
      }

      const indicator = await prisma.indicator.findUnique({ where: { slug: row.indicator_slug } });
      if (!indicator) throw new Error(`Indicator not found: ${row.indicator_slug}`);

      const country = await prisma.country.findUnique({ where: { code: row.country_code } });
      if (!country) throw new Error(`Country not found: ${row.country_code}`);

      let source = await prisma.source.findUnique({ where: { name: row.source_name || "Manual Import" } });
      if (!source) {
        source = await prisma.source.create({
          data: {
            name: row.source_name || "Manual Import",
            shortName: row.source_name ? row.source_name.substring(0, 10) : "Manual",
            url: row.source_url,
            isOfficial: false,
          }
        });
      }

      const year = parseInt(row.year, 10);
      const value = parseFloat(row.value);
      if (isNaN(year) || isNaN(value)) throw new Error(`Invalid year or value: ${row.year}, ${row.value}`);

      const existing = await prisma.dataPoint.findUnique({
        where: {
          indicatorId_countryId_year_sourceId: {
            indicatorId: indicator.id,
            countryId: country.id,
            year,
            sourceId: source.id,
          }
        }
      });

      if (existing) {
        if (existing.value !== value) {
          await prisma.dataPoint.update({
            where: { id: existing.id },
            data: { value, unit: row.unit, notes: row.notes, collectionDate: new Date(), isSampleData: false, verificationStatus: "OFFICIAL" },
          });
          updated++;
        }
      } else {
        await prisma.dataPoint.create({
          data: {
            indicatorId: indicator.id,
            countryId: country.id,
            year,
            value,
            unit: row.unit || indicator.unit,
            sourceId: source.id,
            sourceUrl: row.source_url,
            isSampleData: false,
            verificationStatus: "OFFICIAL",
            notes: row.notes,
            collectionDate: new Date(),
          }
        });
        added++;
        
        // Mark indicator as having manual data
        if (!indicator.hasManualData) {
          await prisma.indicator.update({ where: { id: indicator.id }, data: { hasManualData: true } });
        }
      }

    } catch (err: unknown) {
      console.error(`❌ Error on row: ${JSON.stringify(row)}`);
      console.error(`   → ${err instanceof Error ? err.message : String(err)}`);
      errors++;
    }
  }

  console.log(`\n✅ Import Complete: ${added} added, ${updated} updated, ${errors} errors.`);
  await prisma.$disconnect();
}

main();
