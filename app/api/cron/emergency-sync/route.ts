// ETW — Emergency Sync Cron Endpoint
// POST /api/cron/emergency-sync
// Secured with CRON_SECRET header. Called by Vercel Cron or external scheduler.

import { NextRequest, NextResponse } from "next/server";
import { runEmergencySync } from "@/lib/emergencies/sync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Security check
  const secret = req.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runEmergencySync();
    return NextResponse.json({
      ok: true,
      newEmergencies: result.newEmergencies,
      skippedDuplicates: result.skippedDuplicates,
      errors: result.errors,
      adapters: result.adapterResults,
    });
  } catch (e) {
    console.error("Emergency sync failed:", e);
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}

// Also allow GET for manual trigger in dev (requires CRON_SECRET as query param)
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runEmergencySync();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
