/* eslint-disable @typescript-eslint/no-explicit-any */
// ETW — USGS Earthquake Adapter
// Source: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/
// No API key required. Public domain data.
// Terms: https://www.usgs.gov/information/copyright-and-credits

import { AdapterResult, NormalizedEvent, isInMaharashtra, mapBboxToDistricts } from "./types";

const FEEDS = [
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson",
];

const TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

function magnitudeToSeverity(mag: number) {
  if (mag >= 7.0) return "Extreme";
  if (mag >= 6.0) return "Severe";
  if (mag >= 5.0) return "Moderate";
  return "Low";
}

export async function usgsAdapter(): Promise<AdapterResult> {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const events: NormalizedEvent[] = [];
  const fetchedAt = new Date();

  for (const feedUrl of FEEDS) {
    try {
      const res = await fetchWithTimeout(feedUrl);
      if (!res.ok) {
        errors.push(`USGS ${feedUrl}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json() as { features: any[] };

      for (const feature of data.features) {
        const id: string = feature.id;
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const props = feature.properties;
        const [lon, lat] = feature.geometry?.coordinates ?? [null, null];

        if (lat == null || lon == null) continue;
        if (!isInMaharashtra(lat, lon)) continue;

        const districts = mapBboxToDistricts(lat, lon);
        const mag = props.mag ?? 0;

        events.push({
          title: `Earthquake M${mag.toFixed(1)} — ${props.place || "Maharashtra"}`,
          disasterType: "EARTHQUAKE",
          severity: magnitudeToSeverity(mag),
          description: `Magnitude ${mag} earthquake. Depth: ${feature.geometry?.coordinates?.[2] ?? "unknown"} km. ${props.place || ""}`,
          reportedAt: new Date(props.time),
          sourceName: "USGS Earthquake Hazards Program",
          sourceUrl: props.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
          sourceEventId: `usgs-${id}`,
          affectedDistricts: districts,
          rawData: props,
        });
      }
    } catch (e) {
      errors.push(`USGS ${feedUrl}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { events, errors, adapterName: "USGS", fetchedAt };
}
