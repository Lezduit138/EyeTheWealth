/**
 * ETW — Import Public NGO Transactions from CSV (Layer 4)
 * Only publicly disclosed donor→NGO / company→NGO records (FCRA, CSR).
 * NEVER derives transactions from annual totals.
 * Usage: npx ts-node -T scripts/import-transactions-csv.ts --file=path/to/transactions.csv [--dry-run]
 */

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
  if (!val || val === "" || val.toLowerCase() === "null") return null;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(a => a.startsWith("--file="));
  const dryRun = args.includes("--dry-run");

  if (!fileArg) {
    console.error("❌ Usage: ts-node import-transactions-csv.ts --file=path/to/file.csv [--dry-run]");
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
  const REQUIRED = ["sourceUrl", "sourceName"];
  const missing = REQUIRED.filter(r => !headers.includes(r));
  if (missing.length > 0) {
    console.error(`❌ Missing required columns: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n💸 ETW NGO Public Transactions CSV Importer`);
  console.log(`   File: ${filePath}`);
  console.log(`   Rows: ${lines.length - 1}`);
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`);

  let accepted = 0;
  let rejected = 0;

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const row = parseRow(headers, lines[i]);

    if (!row.sourceUrl?.trim()) {
      console.log(`  [Row ${rowNum}] REJECTED: Missing sourceUrl (all transactions must be source-backed)`);
      rejected++;
      continue;
    }

    // Match NGO
    let ngo = null;
    if (row.registrationNumber?.trim()) {
      ngo = await prisma.ngo.findFirst({ where: { registrationNumber: row.registrationNumber.trim() } });
    }
    if (!ngo && row.ngoSlug?.trim()) {
      ngo = await prisma.ngo.findUnique({ where: { slug: row.ngoSlug.trim() } });
    }

    if (!ngo) {
      console.log(`  [Row ${rowNum}] REJECTED: NGO not found for reg: "${row.registrationNumber}" / slug: "${row.ngoSlug}"`);
      rejected++;
      continue;
    }

    const classification = VALID_CLASSIFICATIONS.includes(row.sourceClassification)
      ? row.sourceClassification
      : "Official government record";

    const txDate = row.date && !isNaN(Date.parse(row.date)) ? new Date(row.date) : null;
    const amount = parseOptionalFloat(row.amount);

    if (dryRun) {
      console.log(`  [Row ${rowNum}] ACCEPTED (DRY RUN): ₹${amount ?? "undisclosed"} to ${ngo.name}`);
      accepted++;
      continue;
    }

    await prisma.transaction.create({
      data: {
        ngoId: ngo.id,
        date: txDate,
        financialYear: row.financialYear?.trim() || null,
        senderName: row.senderName?.trim() || null,
        senderType: row.senderType?.trim() || "Corporate",
        recipientName: row.recipientName?.trim() || ngo.name,
        recipientType: row.recipientType?.trim() || "NGO",
        amount,
        currency: row.currency?.trim() || "INR",
        purpose: row.purpose?.trim() || null,
        transactionType: row.transactionType?.trim() || "CSR",
        isEstimate: false,
        sourceName: row.sourceName.trim(),
        sourceUrl: row.sourceUrl.trim(),
        sourceClassification: classification,
        retrievedAt: new Date(),
        isSampleData: false,
        verificationStatus: "Unverified",
        notes: row.notes?.trim() || null,
      }
    });

    console.log(`  [Row ${rowNum}] CREATED: ₹${amount ?? "undisclosed"} -> ${ngo.name}`);
    accepted++;
  }

  console.log(`\n✅ Transactions Import Complete: ${accepted} accepted, ${rejected} rejected.`);
}

main()
  .catch(e => { console.error("❌ Fatal error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
