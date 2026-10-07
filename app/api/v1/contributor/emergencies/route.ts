import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("activeOnly") !== "false"; // Default to true
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (activeOnly) {
    where.isActive = true;
  }

  try {
    const emergencies = await prisma.emergency.findMany({
      where,
      orderBy: [
        { severity: "desc" }, // Assume string sort works for now, or just rely on reportedAt
        { reportedAt: "desc" }
      ],
      take: limit,
      include: {
        _count: {
          select: { ngoMatches: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: emergencies });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
