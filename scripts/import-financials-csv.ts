#!/usr/bin/env ts-node
// ETW — Import NGO Financial Years from CSV
// Usage: npx ts-node scripts/import-financials-csv.ts --file=path/to/financials.csv [--dry-run]
//
// REQUIRED columns:
//   registrationNumber OR ngoSlug, financialYear (e.g. "2022-23"), sourceUrl, sourceClassification
//
// OPTIONAL columns (all financial figures in INR):
//   totalIncome, totalExpenditure, donations, grants, csrFunding, governmentFunding,
//   foreignContributions, totalAssets, totalLiabilities, adminExpenditure, programExpenditure,
//   documentUrl, notes
//
// sourceClassification must be one of:
//   "Official government record" | "Public filing" | "NGO annual report" |
//   "CSR disclosure" | "Foreign contribution disclosure" | "Audited financial statement" |
//   "NGO website" | "Other verified public source"
//
// Rules:
//   - Idempotent: matched on (ngoId + financialYear). If row exists, updates only if verificationStatus is UNVERIFIED or SAMPLE.
//   - NEVER derives transactions from annual totals — totals stay totals.
//   - NEVER fills missing fields with estimates.
//   - sourceUrl is REQUIRED.
//   - sourceClassification is REQUIRED.

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VALID_CLASSIFICATIONS = [
  "Official government record",
  "Public filing",
  "NGO annual report",
  "CSR disclosure",
  "Foreign contribution disclosure",
  "Audited financial statement",
  "NGO website",
  "Other verified public source"
];

const VALID_YEAR_PATTERN = /^\d{4}-\d{2}$/; // e.g. "2022-23"

function parseRow(headers: string[], row: string): Record<string, string> {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  values.push(current.trim());
  const result: Record<string, string> = {};
  headers.forEach((h, i) => { result[h] = (values[i] || "").trim(); });
  return result;
}

function parseOptionalFloat(val: string): number | null {
  if (!val || val === "" || val.toLowerCase() === "null" || val.toLowerCase() === "n/a") return null;
  const n = parseFloat(val.replace(/,/g, ""));
  if (isNaN(n)) return null;
  return n;
}

interface AcceptedRow {
  row: number;
  ngoName: string;
  year: string;
  status: "CREATED" | "UPDATED" | "SKIPPED";
  reason?: string;
}

interface RejectedRow {
  row: number;
  data: Record<string, string>;
  reason: string;
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(a => a.startsWith("--file="));
  const dryRun = args.includes("--dry-run");

  if (!fileArg) {
    console.error("❌ Usage: ts-node import-financials-csv.ts --file=path/to/file.csv [--dry-run]");
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
  
  // Either registrationNumber or ngoSlug must be present
  const hasRegNum = headers.includes("registrationNumber");
  const hasSlug = headers.includes("ngoSlug");
  if (!hasRegNum && !hasSlug) {
    console.error("❌ CSV must have either 'registrationNumber' or 'ngoSlug' column to identify the NGO.");
    process.exit(1);
  }

  const REQUIRED = ["financialYear", "sourceUrl", "sourceClassification"];
  const missing = REQUIRED.filter(r => !headers.includes(r));
  if (missing.length > 0) {
    console.error(`❌ Missing required columns: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n📊 ETW NGO Financial Year CSV Importer`);
  console.log(`   File: ${filePath}`);
  console.log(`   Rows: ${lines.length - 1}`);
  console.log(`   Mode: ${dryRun ? "DRY RUN (no DB changes)" : "LIVE"}\n`);

  const accepted: AcceptedRow[] = [];
  const rejected: RejectedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const row = parseRow(headers, lines[i]);

    // Validate required fields
    if (!row.financialYear || !VALID_YEAR_PATTERN.test(row.financialYear)) {
      rejected.push({ row: rowNum, data: row, reason: `Invalid financialYear format. Use "YYYY-YY" e.g. "2022-23". Got: "${row.financialYear}"` });
      continue;
    }
    if (!row.sourceUrl?.trim()) {
      rejected.push({ row: rowNum, data: row, reason: "Missing required field: sourceUrl" });
      continue;
    }
    if (!row.sourceClassification?.trim()) {
      rejected.push({ row: rowNum, data: row, reason: "Missing required field: sourceClassification" });
      continue;
    }
    if (!VALID_CLASSIFICATIONS.includes(row.sourceClassification)) {
      rejected.push({
        row: rowNum,
        data: row,
        reason: `Invalid sourceClassification: "${row.sourceClassification}". Must be one of: ${VALID_CLASSIFICATIONS.join(" | ")}`
      });
      continue;
    }

    // Find the NGO
    const ngo = await prisma.ngo.findFirst({
      where: {
        OR: [
          row.registrationNumber ? { registrationNumber: row.registrationNumber.trim() } : undefined,
          row.ngoSlug ? { slug: row.ngoSlug.trim() } : undefined,
        ].filter(Boolean) as never[]
      }
    });

    if (!ngo) {
      const identifier = row.registrationNumber || row.ngoSlug;
      rejected.push({ row: rowNum, data: row, reason: `NGO not found for identifier: "${identifier}". Import the NGO first.` });
      continue;
    }

    // Parse financial fields — nulls are kept null (never estimated)
    const financialData = {
      financialYear: row.financialYear,
      totalIncome: parseOptionalFloat(row.totalIncome),
      totalExpenditure: parseOptionalFloat(row.totalExpenditure),
      donations: parseOptionalFloat(row.donations),
      grants: parseOptionalFloat(row.grants),
      csrFunding: parseOptionalFloat(row.csrFunding),
      governmentFunding: parseOptionalFloat(row.governmentFunding),
      foreignContributions: parseOptionalFloat(row.foreignContributions),
      totalAssets: parseOptionalFloat(row.totalAssets),
      totalLiabilities: parseOptionalFloat(row.totalLiabilities),
      adminExpenditure: parseOptionalFloat(row.adminExpenditure),
      programExpenditure: parseOptionalFloat(row.programExpenditure),
      sourceClassification: row.sourceClassification,
      sourceUrl: row.sourceUrl.trim(),
      documentUrl: row.documentUrl?.trim() || null,
      notes: row.notes?.trim() || null,
      isSampleData: false,
      verificationStatus: "UNVERIFIED",
    };

    if (dryRun) {
      accepted.push({ row: rowNum, ngoName: ngo.name, year: row.financialYear, status: "CREATED", reason: "DRY RUN" });
      continue;
    }

    try {
      // Check for existing record
      const existing = await prisma.ngoFinancialYear.findFirst({
        where: { ngoId: ngo.id, financialYear: row.financialYear }
      });

      if (existing) {
        if (existing.verificationStatus === "VERIFIED") {
          rejected.push({ row: rowNum, data: row, reason: `SKIPPED — ${ngo.name} (${row.financialYear}) is VERIFIED. Use admin panel to update.` });
          continue;
        }
        await prisma.ngoFinancialYear.update({
          where: { id: existing.id },
          data: financialData
        });
        accepted.push({ row: rowNum, ngoName: ngo.name, year: row.financialYear, status: "UPDATED" });
      } else {
        await prisma.ngoFinancialYear.create({
          data: { ngoId: ngo.id, ...financialData }
        });
        accepted.push({ row: rowNum, ngoName: ngo.name, year: row.financialYear, status: "CREATED" });
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
      console.log(`    Row ${r.row}: [${r.status}] ${r.ngoName} — ${r.year}${r.reason ? " (" + r.reason + ")" : ""}`);
    });
  }

  if (rejected.length > 0) {
    console.log("\n  REJECTED ROWS:");
    rejected.forEach(r => {
      console.log(`    Row ${r.row}: ${r.reason}`);
    });
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  CSV TEMPLATE:");
  console.log("  registrationNumber,ngoSlug,financialYear,totalIncome,totalExpenditure,donations,grants,csrFunding,governmentFunding,foreignContributions,totalAssets,totalLiabilities,adminExpenditure,programExpenditure,sourceUrl,sourceClassification,documentUrl,notes");
  console.log("\n  VALID sourceClassification values:");
  VALID_CLASSIFICATIONS.forEach(c => console.log(`    - ${c}`));
  console.log("\n  NOTES:");
  console.log("    - Leave financial fields blank (or write 'null') for 'Not publicly disclosed'");
  console.log("    - NEVER estimate or fill missing figures");
  console.log("    - All amounts in INR");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main()
  .catch(e => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
