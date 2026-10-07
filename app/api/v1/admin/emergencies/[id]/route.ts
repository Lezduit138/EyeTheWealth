// ETW — Admin: Approve / Reject / Close / Update Emergency
// PATCH /api/v1/admin/emergencies/[id]

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */

const PatchSchema = z.object({
  action: z.enum(["approve", "reject", "close", "update"]),
  // For approve: makes isActive=true (visible publicly)
  // For reject: keeps isActive=false, marks resolved
  // For close: sets resolvedAt, isActive=false
  // For update: updates editable fields
  severity: z.enum(["Low", "Moderate", "Severe", "Extreme"]).optional(),
  affectedDistricts: z.array(z.string()).optional(),
  description: z.string().optional(),
  title: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const emergency = await prisma.emergency.findUnique({ where: { id } });
  if (!emergency) {
    return NextResponse.json({ error: "Emergency not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  const { action } = parsed.data;

  if (action === "approve") {
    // Only ADMIN can approve
    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can approve emergencies" }, { status: 403 });
    }
    updateData.isActive = true;
  } else if (action === "reject") {
    updateData.isActive = false;
    updateData.resolvedAt = new Date();
  } else if (action === "close") {
    updateData.isActive = false;
    updateData.resolvedAt = new Date();
  } else if (action === "update") {
    if (parsed.data.severity) updateData.severity = parsed.data.severity;
    if (parsed.data.affectedDistricts) updateData.affectedDistricts = JSON.stringify(parsed.data.affectedDistricts);
    if (parsed.data.description) updateData.description = parsed.data.description;
    if (parsed.data.title) updateData.title = parsed.data.title;
  }

  const updated = await prisma.emergency.update({ where: { id }, data: updateData });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE",
      entityType: "Emergency",
      entityId: id,
      changes: JSON.stringify({ action, ...updateData }),
    }
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Only ADMIN can delete emergencies" }, { status: 403 });
  }

  const { id } = await params;
  const emergency = await prisma.emergency.findUnique({ where: { id } });
  if (!emergency) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Log before deletion
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "DELETE",
      entityType: "Emergency",
      entityId: id,
      changes: JSON.stringify({ title: emergency.title, isSimulation: emergency.isSimulation }),
    }
  });

  await prisma.emergencyNgoMatch.deleteMany({ where: { emergencyId: id } });
  await prisma.emergency.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
