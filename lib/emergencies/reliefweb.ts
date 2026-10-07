/* eslint-disable @typescript-eslint/no-explicit-any */
// ETW — ReliefWeb v2 Adapter
// Source: https://api.reliefweb.int/v2/disasters
// Requires a pre-approved appname in env var RELIEFWEB_APPNAME
// If missing or rejected, adapter gracefully skips and logs — does NOT throw.
// Terms: https://reliefweb.int/terms-conditions — free for non-commercial use

import { AdapterResult, NormalizedEvent, normalizeDistrict } from "./types";

const BASE_URL = "https://api.reliefweb.int/v2/disasters";
const TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

function rwTypeToDisaster(type: string): NormalizedEvent["disasterType"] {
  const t = type.toLowerCase();
  if (t.includes("flood")) return "FLOOD";
  if (t.includes("earthquake") || t.includes("seismic")) return "EARTHQUAKE";
  if (t.includes("cyclone") || t.includes("typhoon") || t.includes("storm")) return "CYCLONE";
  if (t.includes("landslide")) return "LANDSLIDE";
  if (t.includes("fire")) return "FIRE";
  if (t.includes("drought")) return "DROUGHT";
  return "OTHER";
}

export async function reliefwebAdapter(): Promise<AdapterResult> {
  const fetchedAt = new Date();
  const appname = process.env.RELIEFWEB_APPNAME;

  if (!appname) {
    return {
      events: [],
      errors: ["RELIEFWEB_APPNAME env var not set — ReliefWeb adapter skipped. Register at https://reliefweb.int/contact to get an appname."],
      adapterName: "ReliefWeb",
      fetchedAt,
    };
  }

  const errors: string[] = [];
  const events: NormalizedEvent[] = [];

  try {
    const body = JSON.stringify({
      filter: {
        operator: "AND",
        conditions: [
          { field: "country.iso3", value: "IND" },
          { field: "status", value: "alert" }
        ]
      },
      fields: { include: ["id", "name", "glide", "date", "type", "status", "description", "url"] },
      limit: 50,
    });

    const res = await fetchWithTimeout(`${BASE_URL}?appname=${appname}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.status === 403) {
      errors.push("ReliefWeb: appname not approved yet. Register at https://reliefweb.int/contact");
      return { events, errors, adapterName: "ReliefWeb", fetchedAt };
    }
    if (!res.ok) {
      errors.push(`ReliefWeb: HTTP ${res.status}`);
      return { events, errors, adapterName: "ReliefWeb", fetchedAt };
    }

    const data = await res.json() as { data: any[] };

    for (const item of (data.data || [])) {
      const fields = item.fields;
      const name: string = fields.name || "";

      // Filter for Maharashtra
      const nameLower = (name + " " + (fields.description || "")).toLowerCase();
      const isMaha = nameLower.includes("maharashtra") || nameLower.includes("mumbai") ||
                     nameLower.includes("pune") || nameLower.includes("nashik") ||
                     nameLower.includes("kolhapur") || nameLower.includes("nagpur") ||
                     nameLower.includes("thane") || nameLower.includes("aurangabad");

      if (!isMaha) continue;

      const districts: NormalizedEvent["affectedDistricts"] = [];
      const knownDistricts = ["Mumbai", "Pune", "Nashik", "Kolhapur", "Nagpur", "Thane", "Aurangabad",
                              "Amravati", "Solapur", "Latur", "Raigad", "Ratnagiri", "Sangli", "Satara"];
      for (const d of knownDistricts) {
        if (nameLower.includes(d.toLowerCase())) {
          const norm = normalizeDistrict(d);
          if (norm) districts.push({ ...norm, reason: "title match" });
        }
      }

      const disasterType = rwTypeToDisaster((fields.type?.[0]?.name || "other"));

      events.push({
        title: name,
        disasterType,
        severity: "Moderate", // ReliefWeb doesn't expose a simple severity field
        description: fields.description || null,
        reportedAt: fields.date?.event ? new Date(fields.date.event) : new Date(),
        sourceName: "ReliefWeb (UN OCHA)",
        sourceUrl: fields.url || `https://reliefweb.int/disaster/${item.id}`,
        sourceEventId: `reliefweb-${item.id}`,
        affectedDistricts: districts,
        rawData: fields,
      });
    }
  } catch (e) {
    errors.push(`ReliefWeb: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { events, errors, adapterName: "ReliefWeb", fetchedAt };
}
