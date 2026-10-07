// ETW — Emergency Sync Engine
// Runs all adapters, deduplicates events, saves PENDING_REVIEW emergencies to DB,
// matches NGOs by district tier, logs IngestionRun.

import { prisma } from "@/lib/prisma";
import { usgsAdapter } from "./usgs";
import { gdacsAdapter } from "./gdacs";
import { reliefwebAdapter } from "./reliefweb";
import { ndmaAdapter, imdAdapter } from "./ndma-imd";
import { NormalizedEvent } from "./types";
import { getNeighbouringDistricts } from "./adjacency";

const ADAPTERS = [usgsAdapter, gdacsAdapter, reliefwebAdapter, ndmaAdapter, imdAdapter];

// Disaster-relevant category slugs for Tier 3 matching
const RELIEF_CATEGORIES = ["Disaster relief", "Health", "Food"];

export interface SyncResult {
  newEmergencies: number;
  skippedDuplicates: number;
  errors: string[];
  adapterResults: Array<{ adapter: string; events: number; errors: string[] }>;
}

async function matchNgos(emergencyId: string, affectedDistricts: string[], _disasterType: string) {
  const neighbours = getNeighbouringDistricts(affectedDistricts);

  // Tier 1: NGOs in affected districts
  const tier1Ngos = await prisma.ngo.findMany({
    where: { district: { in: affectedDistricts }, isActive: true }
  });

  // Tier 2: NGOs in neighbouring districts
  const tier2Ngos = await prisma.ngo.findMany({
    where: { district: { in: neighbours }, isActive: true }
  });

  // Tier 3: disaster-relief/health NGOs anywhere in Maharashtra
  const tier3Ngos = await prisma.ngo.findMany({
    where: {
      isActive: true,
      district: { notIn: [...affectedDistricts, ...neighbours] },
      OR: RELIEF_CATEGORIES.map(c => ({ categories: { contains: c } }))
    }
  });

  const allToCreate = [
    ...tier1Ngos.map(n => ({
      emergencyId,
      ngoId: n.id,
      status: "OPERATING_NEARBY",
      matchReason: "district",
    })),
    ...tier2Ngos.map(n => ({
      emergencyId,
      ngoId: n.id,
      status: "OPERATING_NEARBY",
      matchReason: "neighbouring",
    })),
    ...tier3Ngos.map(n => ({
      emergencyId,
      ngoId: n.id,
      status: "OPERATING_NEARBY",
      matchReason: "relief_specialization",
    })),
  ];

  for (const match of allToCreate) {
    await prisma.emergencyNgoMatch.upsert({
      where: { emergencyId_ngoId: { emergencyId: match.emergencyId, ngoId: match.ngoId } },
      create: match,
      update: { matchReason: match.matchReason },
    });
  }
}

export async function runEmergencySync(): Promise<SyncResult> {
  const run = await prisma.ingestionRun.create({
    data: { source: "EmergencySync", status: "RUNNING" }
  });

  const result: SyncResult = {
    newEmergencies: 0,
    skippedDuplicates: 0,
    errors: [],
    adapterResults: [],
  };

  const allEvents: NormalizedEvent[] = [];

  // Run all adapters with error isolation
  for (const adapter of ADAPTERS) {
    try {
      const adapterResult = await adapter();
      allEvents.push(...adapterResult.events);
      result.adapterResults.push({
        adapter: adapterResult.adapterName,
        events: adapterResult.events.length,
        errors: adapterResult.errors,
      });
      if (adapterResult.errors.length > 0) {
        result.errors.push(...adapterResult.errors);
      }
    } catch (e) {
      const msg = `Adapter failed: ${e instanceof Error ? e.message : String(e)}`;
      result.errors.push(msg);
    }
  }

  // Deduplicate and persist
  for (const event of allEvents) {
    // Check for existing event by sourceEventId
    const existing = await prisma.emergency.findFirst({
      where: {
        sourceName: event.sourceName,
        title: event.title,
      }
    });

    if (existing) {
      result.skippedDuplicates++;
      continue;
    }

    // Filter: only create if there are matched districts
    if (event.affectedDistricts.length === 0) {
      result.skippedDuplicates++;
      continue;
    }

    const affectedDistrictNames = event.affectedDistricts.map(d => d.name);

    // PENDING_REVIEW — not public until ADMIN approves
    const emergency = await prisma.emergency.create({
      data: {
        title: event.title,
        disasterType: event.disasterType,
        severity: event.severity,
        description: event.description,
        reportedAt: event.reportedAt,
        affectedDistricts: JSON.stringify(affectedDistrictNames),
        sourceName: event.sourceName,
        sourceUrl: event.sourceUrl,
        rawAlertData: JSON.stringify(event.rawData),
        isActive: false, // PENDING_REVIEW — not public until admin approves
        isSimulation: false,
      }
    });

    await matchNgos(emergency.id, affectedDistrictNames, event.disasterType);
    result.newEmergencies++;
  }

  await prisma.ingestionRun.update({
    where: { id: run.id },
    data: {
      status: result.errors.length > 0 && result.newEmergencies === 0 ? "PARTIAL" : "SUCCESS",
      completedAt: new Date(),
      recordsAdded: result.newEmergencies,
      recordsSkipped: result.skippedDuplicates,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors.slice(0, 20)) : null,
    }
  });

  return result;
}
