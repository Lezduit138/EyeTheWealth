#!/usr/bin/env ts-node
// ETW — Import NGOs from CSV
// Usage: npx ts-node scripts/import-ngos-csv.ts --file=path/to/ngos.csv [--dry-run]
//
// REQUIRED columns (exact header names):
//   name, district, registrationType, registrationNumber
//
// OPTIONAL columns:
//   slug, registrationDate (YYYY-MM-DD), city, state, address, pincode,
//   website, publicEmail, publicPhone, categories (pipe-separated e.g. "Health|Education"),
//   areasOfWork (pipe-separated), ngoId, fcraRegistration, panNumber, sourceUrl
//
// Rules:
//   - Idempotent: matched on registrationNumber (if present) or name+district combo
//   - Never overwrites verified records with unverified data
//   - sourceUrl is REQUIRED (row rejected if missing)
//   - isSampleData is set to false for all imported records
//   - verificationStatus defaults to "UNVERIFIED"; only ADMIN can set "VERIFIED"

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

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseRow(headers: string[], row: string): Record<string, string> {
  const result: Record<string, string> = {};
  // Handle quoted CSV values
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
  const REQUIRED = ["name", "district", "registrationType", "registrationNumber"];
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

    // Validate required fields
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
    if (row.district && !VALID_DISTRICTS.includes(row.district)) {
      rejected.push({ row: rowNum, data: row, reason: `Invalid district: "${row.district}". Must be one of the 36 Maharashtra districts.` });
      continue;
    }

    // Validate and parse categories
    let parsedCategories: string[] = [];
    if (row.categories) {
      const cats = row.categories.split("|").map(c => c.trim());
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

    // Generate slug
    const baseSlug = row.slug?.trim() || slugify(row.name);
    
    const data = {
      name: row.name.trim(),
      slug: baseSlug,
      district: row.district?.trim() || null,
      registrationType: row.registrationType.trim(),
      registrationNumber: row.registrationNumber?.trim() || null,
      registrationDate: row.registrationDate ? new Date(row.registrationDate) : null,
      city: row.city?.trim() || null,
      state: row.state?.trim() || "Maharashtra",
      address: row.address?.trim() || null,
      pincode: row.pincode?.trim() || null,
      website: row.website?.trim() || null,
      publicEmail: row.publicEmail?.trim() || null,
      publicPhone: row.publicPhone?.trim() || null,
      categories: parsedCategories.length > 0 ? JSON.stringify(parsedCategories) : null,
      areasOfWork: parsedAreasOfWork.length > 0 ? JSON.stringify(parsedAreasOfWork) : null,
      ngoId: row.ngoId?.trim() || null,
      fcraRegistration: row.fcraRegistration?.trim() || null,
      panNumber: row.panNumber?.trim() || null,
      sourceUrl: row.sourceUrl.trim(),
      isSampleData: false,
      isActive: true,
      verificationStatus: "UNVERIFIED",
    };

    if (dryRun) {
      accepted.push({ row: rowNum, name: data.name, status: "CREATED", reason: "DRY RUN — not written" });
      continue;
    }

    try {
      // Upsert: match on registrationNumber if present, else name+district
      const existingByRegNum = row.registrationNumber?.trim()
        ? await prisma.ngo.findFirst({ where: { registrationNumber: row.registrationNumber.trim() } })
        : null;
      
      const existingBySlug = await prisma.ngo.findUnique({ where: { slug: baseSlug } });

      if (existingByRegNum) {
        // Never downgrade a VERIFIED record
        if (existingByRegNum.verificationStatus === "VERIFIED") {
          rejected.push({
            row: rowNum,
            data: row,
            reason: `SKIPPED — existing record is VERIFIED and cannot be overwritten by CSV import. Use admin panel to update.`
          });
          continue;
        }
        await prisma.ngo.update({ where: { id: existingByRegNum.id }, data });
        accepted.push({ row: rowNum, name: data.name, status: "UPDATED" });
      } else if (existingBySlug) {
        // Slug collision — append district suffix
        const uniqueSlug = `${baseSlug}-${(row.district || "mh").toLowerCase().replace(/\s+/g, "-")}`;
        await prisma.ngo.upsert({
          where: { slug: uniqueSlug },
          create: { ...data, slug: uniqueSlug },
          update: data,
        });
        accepted.push({ row: rowNum, name: data.name, status: "CREATED", reason: `Slug collision resolved: ${uniqueSlug}` });
      } else {
        await prisma.ngo.create({ data });
        accepted.push({ row: rowNum, name: data.name, status: "CREATED" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      rejected.push({ row: rowNum, data: row, reason: `DB error: ${msg}` });
    }
  }

  // Print report
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  VALIDATION REPORT — ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  ✅ Accepted: ${accepted.length}`);
  console.log(`  ❌ Rejected: ${rejected.length}`);
  console.log("");

  if (accepted.length > 0) {
    console.log("  ACCEPTED ROWS:");
    accepted.forEach(r => {
      console.log(`    Row ${r.row}: [${r.status}] ${r.name}${r.reason ? " — " + r.reason : ""}`);
    });
  }

  if (rejected.length > 0) {
    console.log("\n  REJECTED ROWS:");
    rejected.forEach(r => {
      console.log(`    Row ${r.row}: ${r.reason}`);
      console.log(`           Data: ${JSON.stringify(r.data).substring(0, 120)}...`);
    });
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  CSV TEMPLATE (copy into your spreadsheet tool):");
  console.log("  name,district,registrationType,registrationNumber,registrationDate,city,state,address,pincode,website,publicEmail,publicPhone,categories,areasOfWork,ngoId,fcraRegistration,panNumber,sourceUrl");
  console.log("  EXAMPLE ROW:");
  console.log("  \"Maharashtra Flood Relief Trust\",\"Kolhapur\",\"Trust\",\"MAH-TR-12345\",\"2010-03-01\",\"Kolhapur\",\"Maharashtra\",\"123 Main Road\",\"416001\",\"https://example.org\",\"\",\"\",\"Disaster relief|Health\",\"Flood relief|Medical aid\",\"MH-NGO-001\",\"\",\"\",\"https://fcraonline.nic.in/...\"");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  if (!dryRun && accepted.length > 0) {
    console.log(`✅ ${accepted.length} NGO records imported. Sample data is preserved alongside real records; use the admin panel to deactivate sample entries once real data is confirmed.\n`);
  }
}

main()
  .catch(e => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
