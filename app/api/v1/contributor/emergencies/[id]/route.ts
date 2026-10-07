import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const emergency = await prisma.emergency.findUnique({
      where: { id },
      include: {
        ngoMatches: {
          include: { 
            ngo: true,
            evidenceDocument: true
          },
          orderBy: [
            { status: "asc" }, // CONFIRMED_RESPONDING comes before OPERATING_NEARBY
            { ngo: { name: "asc" } }
          ]
        }
      }
    });

    if (!emergency) {
      return NextResponse.json({ success: false, error: "Emergency not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: emergency });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
