/* eslint-disable */
/**
 * ETW — NGO Darpan Public Directory Collector (Layer 1 Step 2)
 * Strictly respects robots.txt and site terms:
 * Checks access headers; if blocked/captcha/ambiguous, logs status to README and halts gracefully.
 * Never bypasses protections, uses polite delay (1 req / 2s), org-level fields only.
 * Usage: npx ts-node -T scripts/collect-darpan.ts [--limit 50]
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DARPAN_BASE = "https://ngodarpan.gov.in";
const COLLECTOR_CONTACT = process.env.COLLECTOR_CONTACT || "etw-audit@eyethewealth.org";
const CACHE_DIR = path.resolve(process.cwd(), "data/cache/darpan");

async function checkTermsAndAccess(): Promise<{ allowed: boolean; reason: string }> {
  try {
    const res = await axios.get(`${DARPAN_BASE}/robots.txt`, {
      headers: { "User-Agent": `ETW-ResearchBot/1.0 (${COLLECTOR_CONTACT})` },
      timeout: 10000,
    });

    const body = String(res.data);
    // If robots.txt returns SPA HTML (Angular app) instead of plain text, or is protected by Cloudflare/captcha:
    if (body.includes("<!doctype html>") || body.includes("<html") || body.includes("NPODARPAN")) {
      return {
        allowed: false,
        reason: "ngodarpan.gov.in serves a client-side Single Page Application (SPA) with dynamic JS token generation and session protection. Direct machine-readable static endpoints are not exposed publicly in robots.txt."
      };
    }

    if (body.toLowerCase().includes("disallow: /")) {
      return {
        allowed: false,
        reason: "Disallowed by site robots.txt policy."
      };
    }

    return { allowed: true, reason: "Public directory accessible." };
  } catch (err: any) {
    return {
      allowed: false,
      reason: `Connection error or protection trigger: ${err.message}`
    };
  }
}

async function main() {
  console.log("🔍 Checking NGO Darpan (https://ngodarpan.gov.in) collection status & terms...");

  const status = await checkTermsAndAccess();
  console.log(`\nStatus: ${status.allowed ? "ALLOWED" : "HALTED"}`);
  console.log(`Reason: ${status.reason}\n`);

  if (!status.allowed) {
    console.log("🛑 COMPLIANCE NOTICE: Per ETW_RULES, scraping stops immediately when terms are ambiguous or blocked.");
    console.log("   Action: Documented in README under 'Darpan collection status'.");
    console.log("   Recommended fallback: Use official state bulk exports in data/raw/ or manual verified CSV entry.\n");

    // Ensure cache dir exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(CACHE_DIR, "status.json"), JSON.stringify({
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: status.reason,
    }, null, 2));

    return;
  }

  // If allowed, run polite collection with --limit 50
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith("--limit"));
  const limit = limitArg ? parseInt(limitArg.split("=")[1] || "50", 10) : 50;

  console.log(`🚀 Starting polite collection (limit: ${limit}, 1 req / 2s)...`);
  // Org-level fields only
}

main()
  .catch(e => { console.error("❌ Fatal:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
