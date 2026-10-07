/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countriesParam = searchParams.get("countries");
  
  if (!countriesParam) {
    return NextResponse.json({ success: false, error: "Missing countries param" }, { status: 400 });
  }

  const countryCodes = countriesParam.split(",").map(c => c.toUpperCase());

  // Key factors representing the dimensions in the prompt
  const factorSlugs = [
    "gdp-per-capita",
    "life-expectancy",
    "literacy-rate",
    "electricity-access",
    "internet-usage",
    "resource-rents-gdp",
    "fdi-net-inflows-gdp",
    "tax-revenue-gdp"
  ];

  try {
    // Fetch the latest value for each country and each factor
    const results = await prisma.dataPoint.findMany({
      where: {
        country: { code: { in: countryCodes } },
        indicator: { slug: { in: factorSlugs } },
        value: { not: null }
      },
      include: {
        indicator: { select: { slug: true, name: true, polarity: true, unit: true, displayUnit: true } },
        country: { select: { code: true, name: true } }
      },
      orderBy: { year: "desc" }
    });

    // Group by indicator slug, then just keep the latest year per country
    const latestPerCountryFactor = new Map<string, typeof results[0]>();
    
    for (const row of results) {
      const key = `${row.indicator.slug}-${row.country.code}`;
      if (!latestPerCountryFactor.has(key)) {
        latestPerCountryFactor.set(key, row);
      }
    }

    // Format output
    const formatted: any = {};
    for (const factor of factorSlugs) {
      formatted[factor] = { name: "", unit: "", data: {} };
    }

    for (const row of latestPerCountryFactor.values()) {
      const slug = row.indicator.slug;
      if (!formatted[slug].name) {
        formatted[slug].name = row.indicator.name;
        formatted[slug].unit = row.indicator.displayUnit || row.indicator.unit;
        formatted[slug].polarity = row.indicator.polarity;
      }
      formatted[slug].data[row.country.code] = {
        value: row.value,
        year: row.year
      };
    }

    // Remove empty factors
    const finalFactors = Object.values(formatted).filter((f: any) => f.name !== "");

    return NextResponse.json({ success: true, data: finalFactors });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
