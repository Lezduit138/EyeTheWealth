import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const ngo = await prisma.ngo.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        financialYears: {
          include: { source: true },
          orderBy: { financialYear: "desc" },
        },
        transactions: {
          include: { source: true, evidenceDocument: true },
          orderBy: { date: "desc" },
        },
        emergencyMatches: {
          include: { emergency: true, evidenceDocument: true }
        }
      }
    });

    if (!ngo) {
      return NextResponse.json({ success: false, error: "NGO not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ngo });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
