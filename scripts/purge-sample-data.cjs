/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * ETW — Migration: Remove ALL sample/seed data from Contributor module
 * Deletes: NgoFinancialYear, Transaction, EvidenceDocument, EmergencyNgoMatch, Emergency, Ngo
 * where isSampleData = true OR sourced from seed scripts.
 *
 * This script runs BEFORE the schema push so old columns still exist.
 * Run: node scripts/purge-sample-data.cjs
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log('🗑  Purging ALL sample/seed Contributor data...\n');

  // Order matters due to FK constraints
  const txDel = await p.transaction.deleteMany({ where: { isSampleData: true } });
  console.log(`  Transactions deleted: ${txDel.count}`);

  const finDel = await p.ngoFinancialYear.deleteMany({ where: { isSampleData: true } });
  console.log(`  FinancialYears deleted: ${finDel.count}`);

  // Delete all emergency matches (all are from seeds)
  const emNgoDel = await p.emergencyNgoMatch.deleteMany({});
  console.log(`  EmergencyNgoMatches deleted: ${emNgoDel.count}`);

  // Delete all emergencies (none are from real sources yet)
  const emDel = await p.emergency.deleteMany({});
  console.log(`  Emergencies deleted: ${emDel.count}`);

  // Evidence docs
  const evDel = await p.evidenceDocument.deleteMany({ where: { isSampleData: true } });
  console.log(`  EvidenceDocuments deleted: ${evDel.count}`);

  // All NGOs that are sample
  const ngoDel = await p.ngo.deleteMany({ where: { isSampleData: true } });
  console.log(`  Sample NGOs deleted: ${ngoDel.count}`);

  // Also delete any NGOs seeded by seed-real-ngos.ts (they have isSampleData:false but
  // were created from training-data guesses, not real source documents)
  // These are identified by having no sourceUrl with a verified provenance
  // We can't distinguish them cleanly, so we delete ALL NGOs with no real importBatchId
  // and no darpanId (they were hand-typed from training data)
  const guessedDel = await p.ngo.deleteMany({
    where: {
      AND: [
        { importBatchId: null },
        { darpanId: null },
        { isSampleData: false },
      ]
    }
  });
  console.log(`  Training-data guessed NGOs deleted: ${guessedDel.count}`);

  const remaining = await p.ngo.count();
  console.log(`\n✅ Done. Remaining NGOs: ${remaining} (should be 0 before real data import)`);

  if (remaining > 0) {
    const sample = await p.ngo.findMany({ select: { name: true, darpanId: true, sourceUrl: true } });
    console.log('Remaining:', JSON.stringify(sample, null, 2));
  }
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => p.$disconnect());
