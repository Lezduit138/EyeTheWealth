// ETW — GDACS Adapter
// Source: https://www.gdacs.org/xml/rss.xml (public RSS/XML feed, no key required)
// Terms: https://www.gdacs.org/About/termofuse.aspx — free for non-commercial use
// Filters for events affecting Maharashtra

import { AdapterResult, NormalizedEvent, isInMaharashtra, mapBboxToDistricts, normalizeDistrict } from "./types";

const GDACS_FEED = "https://www.gdacs.org/xml/rss.xml";
const TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "ETW-EyeTheWealth/1.0 (contact: admin@etw.local)" } });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

function parseXmlText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}

function parseAllItems(xml: string): string[] {
  const items: string[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) items.push(m[1]);
  return items;
}

function gdacsAlertToSeverity(alertLevel: string) {
  if (alertLevel === "Red") return "Extreme";
  if (alertLevel === "Orange") return "Severe";
  if (alertLevel === "Green") return "Low";
  return "Moderate";
}

function gdacsEventTypeToDisaster(type: string): NormalizedEvent["disasterType"] {
  const t = type.toUpperCase();
  if (t.includes("EQ") || t.includes("EARTHQUAKE")) return "EARTHQUAKE";
  if (t.includes("TC") || t.includes("CYCLONE") || t.includes("TYPHOON") || t.includes("HURRICANE")) return "CYCLONE";
  if (t.includes("FL") || t.includes("FLOOD")) return "FLOOD";
  if (t.includes("VO") || t.includes("VOLCANO")) return "OTHER";
  if (t.includes("TS") || t.includes("TSUNAMI")) return "OTHER";
  if (t.includes("DR") || t.includes("DROUGHT")) return "DROUGHT";
  return "OTHER";
}

export async function gdacsAdapter(): Promise<AdapterResult> {
  const errors: string[] = [];
  const events: NormalizedEvent[] = [];
  const fetchedAt = new Date();

  try {
    const res = await fetchWithTimeout(GDACS_FEED);
    if (!res.ok) {
      return { events, errors: [`GDACS: HTTP ${res.status}`], adapterName: "GDACS", fetchedAt };
    }

    const xml = await res.text();
    const items = parseAllItems(xml);

    for (const item of items) {
      const title = parseXmlText(item, "title");
      const description = parseXmlText(item, "description");
      const link = parseXmlText(item, "link");
      const pubDate = parseXmlText(item, "pubDate");
      const guid = parseXmlText(item, "guid");
      
      // GDACS uses georss:point for lat/lon
      const geoMatch = item.match(/<georss:point>([\d.-]+)\s+([\d.-]+)<\/georss:point>/);
      const alertLevel = (item.match(/<gdacs:alertlevel>(.*?)<\/gdacs:alertlevel>/) ?? [])[1] ?? "";
      const eventType = (item.match(/<gdacs:eventtype>(.*?)<\/gdacs:eventtype>/) ?? [])[1] ?? "OTHER";
      const country = (item.match(/<gdacs:country>(.*?)<\/gdacs:country>/) ?? [])[1] ?? "";

      // Filter: must be India or lat/lon within Maharashtra
      const isIndia = country.toLowerCase().includes("india");
      let inMaha = false;
      const districts: NormalizedEvent["affectedDistricts"] = [];

      if (geoMatch) {
        const lat = parseFloat(geoMatch[1]);
        const lon = parseFloat(geoMatch[2]);
        inMaha = isInMaharashtra(lat, lon);
        if (inMaha) {
          districts.push(...mapBboxToDistricts(lat, lon));
        }
      }

      // Also check title/description for Maharashtra district names
      if (isIndia || inMaha) {
        const titleLower = (title + " " + description).toLowerCase();
        for (const [alias] of Object.entries({ Maharashtra: "MH", ...Object.fromEntries(Object.entries({ Pune: "P", Nashik: "N", Kolhapur: "K", Nagpur: "NG", Thane: "T" })) })) {
          if (titleLower.includes(alias.toLowerCase())) {
            const d = normalizeDistrict(alias);
            if (d && !districts.find(ex => ex.name === d.name)) {
              districts.push({ ...d, confidence: "MEDIUM", reason: "title text match" });
              inMaha = true;
            }
          }
        }
      }

      if (!inMaha) continue;

      events.push({
        title: title || "GDACS Alert",
        disasterType: gdacsEventTypeToDisaster(eventType),
        severity: gdacsAlertToSeverity(alertLevel),
        description,
        reportedAt: pubDate ? new Date(pubDate) : new Date(),
        sourceName: "GDACS (Global Disaster Alert and Coordination System)",
        sourceUrl: link || "https://www.gdacs.org",
        sourceEventId: `gdacs-${guid || title}`,
        affectedDistricts: districts,
        rawData: { title, alertLevel, eventType, country },
      });
    }
  } catch (e) {
    errors.push(`GDACS: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { events, errors, adapterName: "GDACS", fetchedAt };
}
