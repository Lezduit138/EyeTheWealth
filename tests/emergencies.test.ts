/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit Tests for Emergency Intelligence & Feed Parsing
 * Evaluates USGS GeoJSON, GDACS RSS/XML, ReliefWeb JSON fixtures and matching tiers.
 */

import assert from "node:assert/strict";
import test from "node:test";
import fs from "fs";
import path from "path";
import {
  isInMaharashtra,
  mapBboxToDistricts,
  normalizeDistrict,
} from "../lib/emergencies/types.ts";
import { getNeighbouringDistricts } from "../lib/emergencies/adjacency.ts";

test("isInMaharashtra correctly detects bounding box coordinates", () => {
  // Koynanagar, Satara: lat 17.42, lon 73.65 (inside MH)
  assert.equal(isInMaharashtra(17.42, 73.65), true);
  // Nagpur: lat 21.14, lon 79.08 (inside MH)
  assert.equal(isInMaharashtra(21.14, 79.08), true);
  // Delhi: lat 28.61, lon 77.20 (outside MH)
  assert.equal(isInMaharashtra(28.61, 77.20), false);
  // Off coast of Chile: lat -32.5, lon -71.2 (outside MH)
  assert.equal(isInMaharashtra(-32.5, -71.2), false);
});

test("USGS GeoJSON fixture parsing extracts Maharashtra earthquakes only", () => {
  const fixturePath = path.join(process.cwd(), "tests", "fixtures", "usgs_sample.json");
  const raw = fs.readFileSync(fixturePath, "utf-8");
  const data = JSON.parse(raw);

  const mhEvents = [];
  for (const feature of data.features) {
    const [lon, lat] = feature.geometry.coordinates;
    if (isInMaharashtra(lat, lon)) {
      mhEvents.push({
        id: feature.id,
        mag: feature.properties.mag,
        place: feature.properties.place,
        districts: mapBboxToDistricts(lat, lon),
      });
    }
  }

  assert.equal(mhEvents.length, 1, "Only 1 event is in Maharashtra");
  assert.equal(mhEvents[0].mag, 4.8);
  assert.match(mhEvents[0].place, /Koynanagar/);
  assert.ok(mhEvents[0].districts.length > 0, "Mapped to at least one MH district");
});

test("GDACS RSS/XML fixture parsing correctly filters alerts and extracts properties", () => {
  const fixturePath = path.join(process.cwd(), "tests", "fixtures", "gdacs_sample.xml");
  const xml = fs.readFileSync(fixturePath, "utf-8");

  // Regex parser matching gdacs adapter logic
  const items: string[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) items.push(m[1]);

  assert.equal(items.length, 2, "Fixture contains 2 items");

  const parsedItems = items.map(item => {
    const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const countryMatch = item.match(/<gdacs:country>(.*?)<\/gdacs:country>/);
    const pointMatch = item.match(/<georss:point>([\d.-]+)\s+([\d.-]+)<\/georss:point>/);
    const alertLevel = item.match(/<gdacs:alertlevel>(.*?)<\/gdacs:alertlevel>/)?.[1];
    const eventType = item.match(/<gdacs:eventtype>(.*?)<\/gdacs:eventtype>/)?.[1];

    const lat = pointMatch ? parseFloat(pointMatch[1]) : null;
    const lon = pointMatch ? parseFloat(pointMatch[2]) : null;

    return {
      title: titleMatch?.[1] || "",
      country: countryMatch?.[1] || "",
      alertLevel,
      eventType,
      inMaharashtra: lat && lon ? isInMaharashtra(lat, lon) : false,
    };
  });

  const mhAlert = parsedItems.find(i => i.inMaharashtra);
  assert.ok(mhAlert, "Must find 1 GDACS event in Maharashtra");
  assert.equal(mhAlert.country, "India");
  assert.equal(mhAlert.eventType, "FL");
  assert.equal(mhAlert.alertLevel, "Orange");
});

test("ReliefWeb fixture parsing filters Indian disasters", () => {
  const fixturePath = path.join(process.cwd(), "tests", "fixtures", "reliefweb_sample.json");
  const raw = fs.readFileSync(fixturePath, "utf-8");
  const data = JSON.parse(raw);

  const indiaAlerts = data.data.filter((d: any) =>
    d.fields.name.toLowerCase().includes("india") ||
    d.fields.name.toLowerCase().includes("maharashtra")
  );

  assert.equal(indiaAlerts.length, 1);
  assert.match(indiaAlerts[0].fields.name, /Maharashtra/);
  assert.equal(indiaAlerts[0].fields.glide, "FL-2024-000123-IND");
});

test("District adjacency identifies neighbouring districts correctly", () => {
  // Pune borders: Ahmednagar, Solapur, Satara, Raigad, Thane
  const puneNeighbours = getNeighbouringDistricts(["Pune"]);
  assert.ok(puneNeighbours.includes("Satara"), "Satara borders Pune");
  assert.ok(puneNeighbours.includes("Ahmednagar"), "Ahmednagar borders Pune");
  assert.ok(puneNeighbours.includes("Raigad"), "Raigad borders Pune");
  assert.equal(puneNeighbours.includes("Nagpur"), false, "Nagpur does not border Pune");
});

test("District normalization maps historical and colloquial aliases", () => {
  assert.equal(normalizeDistrict("Bombay")?.name, "Mumbai City");
  assert.equal(normalizeDistrict("Chhatrapati Sambhajinagar")?.name, "Aurangabad");
  assert.equal(normalizeDistrict("Dharashiv")?.name, "Osmanabad");
  assert.equal(normalizeDistrict("Poona")?.name, "Pune");
  assert.equal(normalizeDistrict("Unknown Place"), null);
});
