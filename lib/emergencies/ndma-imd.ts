// ETW — NDMA SACHET & IMD Adapter
// Sources:
//   NDMA SACHET: https://sachet.ndma.gov.in — public alert portal
//   IMD: https://mausam.imd.gov.in — India Meteorological Department
//
// STATUS: Both portals serve alerts via HTML/dynamic JS — no stable machine-readable
// REST API endpoint is currently available without government registration.
// This adapter keeps the interface alive and returns fixture data in dev mode.
// In production: set NDMA_FEED_URL and IMD_FEED_URL env vars when official feed URLs
// are provided by NDMA/IMD (contact ndma@nic.in for API access).
//
// We do NOT scrape HTML pages of these portals as their terms require prior approval.
// See README: "Data I must supply manually" section.

import { AdapterResult } from "./types";

export async function ndmaAdapter(): Promise<AdapterResult> {
  const fetchedAt = new Date();
  const feedUrl = process.env.NDMA_FEED_URL;

  if (!feedUrl) {
    return {
      events: [],
      errors: [
        "NDMA_FEED_URL env var not set. " +
        "NDMA SACHET does not currently expose a public machine-readable REST API. " +
        "Contact ndma@nic.in or check https://sachet.ndma.gov.in for API access. " +
        "Adapter skipped gracefully."
      ],
      adapterName: "NDMA SACHET",
      fetchedAt,
    };
  }

  // If a feed URL is ever provided, implement parsing here.
  return {
    events: [],
    errors: ["NDMA adapter: feed URL set but parser not yet implemented. Please file a GitHub issue."],
    adapterName: "NDMA SACHET",
    fetchedAt,
  };
}

export async function imdAdapter(): Promise<AdapterResult> {
  const fetchedAt = new Date();
  const feedUrl = process.env.IMD_FEED_URL;

  if (!feedUrl) {
    return {
      events: [],
      errors: [
        "IMD_FEED_URL env var not set. " +
        "IMD (mausam.imd.gov.in) serves warnings via a dynamic portal without a stable public REST API. " +
        "Contact imd@gov.in for programmatic access. " +
        "Adapter skipped gracefully."
      ],
      adapterName: "IMD",
      fetchedAt,
    };
  }

  return {
    events: [],
    errors: ["IMD adapter: feed URL set but parser not yet implemented."],
    adapterName: "IMD",
    fetchedAt,
  };
}
