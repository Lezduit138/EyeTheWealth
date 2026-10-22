/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ngo: { select: { id: true, name: true, slug: true, paymentEnabled: true } },
        webhookLogs: { select: { id: true, eventType: true, signatureValid: true, receivedAt: true } },
      },
    });

    return NextResponse.json({ success: true, data: donations });
  } catch (err: any) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load donations" },
      { status: 500 }
    );
  }
}
