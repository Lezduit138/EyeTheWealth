/**
 * ETW — Real NGO CSV Importer (Layer 1 Directory)
 * Reads CSV of real NGOs, validates required fields, normalizes districts and categories,
 * drops personal phone/email per privacy rules, and idempotently upserts to DB.
 * Usage: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/import-ngos-csv.ts --file=data/raw/real_maharashtra_ngos.csv [--dry-run]
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VALID_CATEGORIES = [
  "Health", "Education", "Poverty", "Women", "Children",
  "Disaster relief", "Food", "Environment", "Disability",
  "Rural development", "Religious", "Other"
];

const VALID_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur",
  "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City",
  "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani",
  "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
  "Washim", "Yavatmal"
];

// District alias mapping
const DISTRICT_ALIASES: Record<string, string> = {
  "ahilyanagar": "Ahmednagar",
  "nagar": "Ahmednagar",
  "chhatrapati sambhajinagar": "Aurangabad",
  "sambhajinagar": "Aurangabad",
  "dharashiv": "Osmanabad",
  "bid": "Beed",
  "mumbai": "Mumbai City",
  "bombay": "Mumbai City",
};

function normalizeDistrict(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const clean = raw.trim();
  if (VALID_DISTRICTS.includes(clean)) return clean;
  const lower = clean.toLowerCase();
  if (DISTRICT_ALIASES[lower]) return DISTRICT_ALIASES[lower];
  return clean;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseRow(headers: string[], row: string): Record<string, string> {
  const result: Record<string, string> = {};
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current.trim());
  headers.forEach((h, i) => { result[h] = (values[i] || "").trim(); });
  return result;
}

interface RowResult {
  row: number;
  name: string;
  status: "CREATED" | "UPDATED" | "SKIPPED";
  reason?: string;
}

interface RejectResult {
  row: number;
  data: Record<string, string>;
  reason: string;
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(a => a.startsWith("--file="));
  const dryRun = args.includes("--dry-run");

  if (!fileArg) {
    console.error("❌ Usage: ts-node import-ngos-csv.ts --file=path/to/file.csv [--dry-run]");
    process.exit(1);
  }

  const filePath = path.resolve(fileArg.replace("--file=", ""));
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter(l => l.trim().length > 0);

  if (lines.length < 2) {
    console.error("❌ CSV has no data rows");
    process.exit(1);
  }

  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  const REQUIRED = ["name", "district", "registrationType"];
  const missingHeaders = REQUIRED.filter(r => !headers.includes(r));
  
  if (missingHeaders.length > 0) {
    console.error(`❌ Missing required columns: ${missingHeaders.join(", ")}`);
    console.error(`   Required: ${REQUIRED.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n📋 ETW NGO CSV Importer`);
  console.log(`   File: ${filePath}`);
  console.log(`   Rows: ${lines.length - 1}`);
  console.log(`   Mode: ${dryRun ? "DRY RUN (no DB changes)" : "LIVE"}\n`);

  const accepted: RowResult[] = [];
  const rejected: RejectResult[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const row = parseRow(headers, lines[i]);

    if (!row.name?.trim()) {
      rejected.push({ row: rowNum, data: row, reason: "Missing required field: name" });
      continue;
    }
    if (!row.registrationType?.trim()) {
      rejected.push({ row: rowNum, data: row, reason: "Missing required field: registrationType" });
      continue;
    }
    if (!row.sourceUrl?.trim()) {
      rejected.push({ row: rowNum, data: row, reason: "Missing required field: sourceUrl (all records must cite a public source)" });
      continue;
    }

    const normalizedDistrict = normalizeDistrict(row.district);
    if (normalizedDistrict && !VALID_DISTRICTS.includes(normalizedDistrict)) {
      rejected.push({ row: rowNum, data: row, reason: `Invalid district: "${row.district}". Must be one of the 36 Maharashtra districts.` });
      continue;
    }

    // Validate and parse categories
    let parsedCategories: string[] = [];
    if (row.categories) {
      const cats = row.categories.split("|").map(c => c.trim()).filter(Boolean);
      const invalidCats = cats.filter(c => !VALID_CATEGORIES.includes(c));
      if (invalidCats.length > 0) {
        rejected.push({ row: rowNum, data: row, reason: `Invalid categories: ${invalidCats.join(", ")}. Valid: ${VALID_CATEGORIES.join(", ")}` });
        continue;
      }
      parsedCategories = cats;
    }

    // Validate and parse areasOfWork
    const parsedAreasOfWork = row.areasOfWork
      ? row.areasOfWork.split("|").map(a => a.trim()).filter(Boolean)
      : [];

    const baseSlug = row.slug?.trim() || slugify(row.name);
    const regNumber = row.registrationNumber?.trim() || null;
    const darpanId = row.darpanId?.trim() || row.ngoId?.trim() || null;

    const data = {
      name: row.name.trim(),
      slug: baseSlug,
      district: normalizedDistrict,
      primaryDistrict: normalizedDistrict,
      registrationType: row.registrationType.trim(),
      registrationNumber: regNumber,
      registrationAuthority: row.registrationAuthority?.trim() || "Charity Commissioner",
      registrationAct: row.registrationAct?.trim() || "Bombay Public Trusts Act, 1950",
      registrationDate: row.registrationDate ? new Date(row.registrationDate) : null,
      darpanId: darpanId,
      city: row.city?.trim() || null,
      state: row.state?.trim() || "Maharashtra",
      address: row.address?.trim() || null,
      pincode: row.pincode?.trim() || null,
      website: row.website?.trim() || null,
      officialDonationUrl: row.officialDonationUrl?.trim() || null,
      categories: parsedCategories.length > 0 ? JSON.stringify(parsedCategories) : null,
      areasOfWork: parsedAreasOfWork.length > 0 ? JSON.stringify(parsedAreasOfWork) : null,
      sourceName: row.sourceName?.trim() || "NITI Aayog NGO Darpan / Official Public Filing",
      sourceUrl: row.sourceUrl.trim(),
      sourceClassification: "Official government record",
      retrievedAt: new Date(),
      isSampleData: false,
      isActive: true,
      verificationStatus: "Unverified",
    };

    if (dryRun) {
      accepted.push({ row: rowNum, name: data.name, status: "CREATED", reason: "DRY RUN — not written" });
      continue;
    }

    try {
      // Upsert logic: match darpanId, then registrationNumber, then slug
      let existing = null;
      if (darpanId) {
        existing = await prisma.ngo.findFirst({ where: { darpanId } });
      }
      if (!existing && regNumber) {
        existing = await prisma.ngo.findFirst({ where: { registrationNumber: regNumber } });
      }
      if (!existing) {
        existing = await prisma.ngo.findUnique({ where: { slug: baseSlug } });
      }

      if (existing) {
        if (existing.verificationStatus === "Verified") {
          rejected.push({
            row: rowNum,
            data: row,
            reason: "SKIPPED — existing record is VERIFIED and cannot be overwritten by bulk import."
          });
          continue;
        }
        await prisma.ngo.update({ where: { id: existing.id }, data });
        accepted.push({ row: rowNum, name: data.name, status: "UPDATED" });
      } else {
        await prisma.ngo.create({ data });
        accepted.push({ row: rowNum, name: data.name, status: "CREATED" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      rejected.push({ row: rowNum, data: row, reason: `DB error: ${msg}` });
    }
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  VALIDATION REPORT — ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Total rows:    ${lines.length - 1}`);
  console.log(`  Accepted:      ${accepted.length} (${accepted.filter(a => a.status === "CREATED").length} new, ${accepted.filter(a => a.status === "UPDATED").length} updated)`);
  console.log(`  Rejected:      ${rejected.length}`);

  if (rejected.length > 0) {
    console.log("\n❌ REJECTED ROWS:");
    rejected.forEach(r => {
      console.log(`  [Row ${r.row}] "${r.data.name || "UNKNOWN"}": ${r.reason}`);
    });
  }

  console.log("\n✅ NGO Import complete.");
}

main()
  .catch(e => { console.error("❌ Fatal error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
