/* eslint-disable @typescript-eslint/no-explicit-any */
// ETW — Admin: Create or simulate an emergency (ADMIN only)
// POST /api/v1/admin/emergencies — create / simulate
// PATCH /api/v1/admin/emergencies/[id] — approve / reject / close / update

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(5),
  disasterType: z.enum(["FLOOD", "EARTHQUAKE", "CYCLONE", "LANDSLIDE", "FIRE", "DROUGHT", "OTHER"]),
  affectedDistricts: z.array(z.string()).min(1),
  severity: z.enum(["Low", "Moderate", "Severe", "Extreme"]).optional(),
  description: z.string().optional(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  reportedAt: z.string().optional(), // ISO date string
  isSimulation: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Only ADMIN can create simulations
  const body = await req.json();
  if (body.isSimulation && (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Only ADMIN can create simulations" }, { status: 403 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const emergency = await prisma.emergency.create({
      data: {
        title: data.title,
        disasterType: data.disasterType,
        affectedDistricts: JSON.stringify(data.affectedDistricts),
        severity: data.severity ?? null,
        description: data.description ?? null,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        reportedAt: data.reportedAt ? new Date(data.reportedAt) : new Date(),
        isActive: false, // pending review — ADMIN must approve
        isSimulation: data.isSimulation,
        createdBy: (session.user as any).id,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE",
        entityType: "Emergency",
        entityId: emergency.id,
        changes: JSON.stringify(data),
      }
    });

    // Auto-match NGOs
    const { getNeighbouringDistricts } = await import("@/lib/emergencies/adjacency");
    const neighbours = getNeighbouringDistricts(data.affectedDistricts);
    const ngos = await prisma.ngo.findMany({
      where: { isActive: true, district: { in: [...data.affectedDistricts, ...neighbours] } }
    });
    for (const ngo of ngos) {
      await prisma.emergencyNgoMatch.upsert({
        where: { emergencyId_ngoId: { emergencyId: emergency.id, ngoId: ngo.id } },
        create: {
          emergencyId: emergency.id,
          ngoId: ngo.id,
          status: "OPERATING_NEARBY",
          matchReason: data.affectedDistricts.includes(ngo.district ?? "") ? "district" : "neighbouring",
        },
        update: {}
      });
    }

    return NextResponse.json({ success: true, data: emergency }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const emergencies = await prisma.emergency.findMany({
    orderBy: { reportedAt: "desc" },
    include: {
      _count: { select: { ngoMatches: true } }
    }
  });

  return NextResponse.json({ success: true, data: emergencies });
}
