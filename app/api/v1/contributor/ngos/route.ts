import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const district = searchParams.get("district") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true };

  if (district) {
    where.district = district;
  }

  if (category) {
    where.categories = { contains: category };
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { areasOfWork: { contains: q } },
      { registrationNumber: { contains: q } },
    ];
  }

  try {
    const total = await prisma.ngo.count({ where });
    const ngos = await prisma.ngo.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        district: true,
        categories: true,
        areasOfWork: true,
        registrationNumber: true,
        isSampleData: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: ngos,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
