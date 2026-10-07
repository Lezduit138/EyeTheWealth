/* eslint-disable */
"use client";

// ETW â€” Rover Compare Page
// Select up to 4 countries and 1 indicator to compare data

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IndicatorHistoryChart } from "@/components/rover/IndicatorHistoryChart";

interface Country {
  code: string;
  name: string;
}

interface Indicator {
  slug: string;
  name: string;
  category: {
    name: string;
  };
}

function CompareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [countries, setCountries] = useState<Country[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  // Initialize from URL params on mount
  const urlCountriesInit = (searchParams.get("countries")?.split(",").filter(Boolean) || []).map(c => c.toUpperCase());
  const urlIndicatorInit = searchParams.get("indicator") || "";

  // Local state for selections — initialized directly from search params
  const [selectedCountries, setSelectedCountries] = useState<string[]>(urlCountriesInit);
  const [selectedIndicator, setSelectedIndicator] = useState<string>(urlIndicatorInit);

  useEffect(() => {
    // Fetch options on mount
    Promise.all([
      fetch("/api/v1/rover/countries").then(r => r.json()),
      fetch("/api/v1/rover/indicators").then(r => r.json()),
    ]).then(([cRes, iRes]) => {
      if (cRes.success) setCountries(cRes.data);
      if (iRes.success) setIndicators(iRes.data);
    });
  }, []);

  const handleCountryToggle = (code: string) => {
    let next: string[];
    if (selectedCountries.includes(code)) {
      next = selectedCountries.filter((c) => c !== code);
    } else {
      if (selectedCountries.length >= 4) return; // Limit to 4
      next = [...selectedCountries, code];
    }
    updateUrl(next, selectedIndicator);
  };

  const handleIndicatorSelect = (slug: string) => {
    updateUrl(selectedCountries, slug);
  };

  const updateUrl = (cList: string[], ind: string) => {
    const params = new URLSearchParams();
    if (cList.length > 0) params.set("countries", cList.join(",").toLowerCase());
    if (ind) params.set("indicator", ind);
    router.push(`/rover/compare?${params.toString()}`);
  };

  const currentIndicator = indicators.find((i) => i.slug === selectedIndicator);

  return (
    <div className="etw-page">
      <div className="etw-container">
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid var(--color-border)", marginBottom: "2rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          <Link href="/rover" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>ROVER</Link>
          {" â†’ "}
          <span style={{ color: "#000", fontWeight: 600 }}>COMPARE</span>
        </div>

        <h1 style={{ marginBottom: "2rem" }}>Compare Countries</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", marginBottom: "3rem" }}>
          
          {/* Controls */}
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <p className="etw-label" style={{ marginBottom: "0.5rem" }}>SELECT INDICATOR</p>
              <select
                className="etw-input"
                value={selectedIndicator}
                onChange={(e) => handleIndicatorSelect(e.target.value)}
              >
                <option value="">-- Choose an indicator --</option>
                {indicators.map((ind) => (
                  <option key={ind.slug} value={ind.slug}>
                    {ind.category.name}: {ind.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <p className="etw-label" style={{ margin: 0 }}>SELECT COUNTRIES</p>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {selectedCountries.length} / 4 selected
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {countries.map((c) => (
                  <label key={c.code} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(c.code)}
                      onChange={() => handleCountryToggle(c.code)}
                      disabled={!selectedCountries.includes(c.code) && selectedCountries.length >= 4}
                      style={{ accentColor: "#000" }}
                    />
                    <span style={{ fontSize: "0.875rem" }}>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div>
            <div style={{ border: "1px solid var(--color-border)", padding: "2rem", minHeight: "450px" }}>
              {!selectedIndicator ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  Select an indicator to view data.
                </div>
              ) : selectedCountries.length === 0 ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  Select at least one country.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>{currentIndicator?.name}</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Comparing: {selectedCountries.join(", ")}</p>
                  </div>
                  
                  {/* Reuse our history chart, modifying it to only show selected countries by passing it standard data but filtering on the backend via query?
                      The current IndicatorHistoryChart fetches all data for the indicator and displays it all.
                      Let's modify IndicatorHistoryChart to accept an optional array of countries. */}
                  
                  <IndicatorHistoryChart
                    indicatorSlug={selectedIndicator}
                    indicatorName={currentIndicator?.name || ""}
                    unit="" // We don't have unit here easily without fetching the detail, but that's ok
                    countries={selectedCountries}
                  />
                  
                  {/* For a true MVP, IndicatorHistoryChart currently fetches ALL countries. To fix this, we should pass selectedCountries. */}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="etw-page">
        <div className="etw-container">
          <p className="etw-label text-gray-500 mt-8">Loading comparison tool...</p>
        </div>
      </div>
    }>
      <CompareInner />
    </Suspense>
  );
}

