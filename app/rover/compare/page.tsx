/* eslint-disable */
"use client";

// ETW — Rover Compare Page
// Select up to 4 countries and 1 indicator to compare time-series data

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Country {
  code: string;
  name: string;
  region?: string;
}

interface Indicator {
  slug: string;
  name: string;
  unit?: string;
  category: { name: string };
}

const COLORS = ["#000000", "#444444", "#888888", "#bbbbbb"];
const DASHES = ["", "5 5", "3 3", "10 4"];

function CompareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCountriesInit = (searchParams.get("countries")?.split(",").filter(Boolean) || []).map(c => c.toUpperCase());
  const urlIndicatorInit = searchParams.get("indicator") || "gdp-per-capita";

  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(urlCountriesInit);
  const [selectedIndicator, setSelectedIndicator] = useState<string>(urlIndicatorInit);
  const [countrySearch, setCountrySearch] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentIndicator, setCurrentIndicator] = useState<Indicator | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);

  // Load countries and indicators on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/v1/rover/countries?all=1&pageSize=300").then(r => r.json()),
      fetch("/api/v1/rover/indicators?pageSize=100").then(r => r.json()),
    ]).then(([cRes, iRes]) => {
      if (cRes.success) setAllCountries(cRes.data.filter((c: Country & { isAggregate?: boolean }) => !c.isAggregate));
      if (iRes.success) setIndicators(iRes.data);
    }).catch(console.error);
  }, []);

  // Fetch chart data when selection changes
  useEffect(() => {
    if (!selectedIndicator || selectedCountries.length === 0) {
      setChartData([]);
      return;
    }

    setLoadingChart(true);
    const entitiesParam = selectedCountries.join(",");
    fetch(`/api/v1/rover/series?indicator=${selectedIndicator}&entities=${entitiesParam}&from=1990`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) { setChartData([]); return; }

        // Merge series into { year, CODE1: val, CODE2: val, ... }
        const yearMap = new Map<number, any>();
        for (const [code, points] of Object.entries(data.data.series)) {
          for (const pt of (points as any[])) {
            if (!yearMap.has(pt.year)) yearMap.set(pt.year, { year: pt.year });
            yearMap.get(pt.year)[code] = pt.value;
          }
        }
        const sorted = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
        setChartData(sorted);

        // Get indicator details
        const ind = indicators.find(i => i.slug === selectedIndicator);
        setCurrentIndicator(ind || null);
      })
      .catch(console.error)
      .finally(() => setLoadingChart(false));
  }, [selectedIndicator, selectedCountries, indicators]);

  const handleCountryToggle = (code: string) => {
    let next: string[];
    if (selectedCountries.includes(code)) {
      next = selectedCountries.filter(c => c !== code);
    } else {
      if (selectedCountries.length >= 4) return;
      next = [...selectedCountries, code];
    }
    setSelectedCountries(next);
    const params = new URLSearchParams();
    if (next.length > 0) params.set("countries", next.join(","));
    if (selectedIndicator) params.set("indicator", selectedIndicator);
    router.replace(`/rover/compare?${params.toString()}`, { scroll: false });
  };

  const filteredCountries = countrySearch.trim()
    ? allCountries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase()))
    : allCountries;

  const formatValue = (v: number, compact = false) => {
    if (compact) return v.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });
    return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  return (
    <div className="etw-page">
      <div className="etw-container">
        {/* Breadcrumb */}
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid var(--color-border)", marginBottom: "2rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          <Link href="/rover" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>ROVER</Link>
          {" → "}
          <span style={{ color: "#000", fontWeight: 600 }}>COMPARE</span>
        </div>

        <h1 style={{ marginBottom: "2rem" }}>Compare Countries</h1>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem" }}>
          {/* LEFT: Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Indicator picker */}
            <div>
              <p className="etw-label" style={{ marginBottom: "0.5rem" }}>INDICATOR</p>
              <select
                className="etw-input"
                value={selectedIndicator}
                onChange={e => setSelectedIndicator(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">-- Choose --</option>
                {indicators.map(ind => (
                  <option key={ind.slug} value={ind.slug}>{ind.category.name}: {ind.name}</option>
                ))}
              </select>
            </div>

            {/* Country picker */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <p className="etw-label" style={{ margin: 0 }}>COUNTRIES</p>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{selectedCountries.length}/4</span>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                className="etw-input"
                style={{ width: "100%", marginBottom: "0.5rem", fontSize: "0.8125rem", padding: "0.4rem 0.6rem" }}
              />
              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid var(--color-border)" }}>
                {filteredCountries.map(c => (
                  <label
                    key={c.code}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.75rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0f0f0",
                      background: selectedCountries.includes(c.code) ? "#000" : "#fff",
                      color: selectedCountries.includes(c.code) ? "#fff" : "#000",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(c.code)}
                      onChange={() => handleCountryToggle(c.code)}
                      disabled={!selectedCountries.includes(c.code) && selectedCountries.length >= 4}
                      style={{ accentColor: "#000" }}
                    />
                    <span style={{ fontSize: "0.8125rem", flex: 1 }}>{c.name}</span>
                    <span style={{ fontSize: "0.6875rem", opacity: 0.5 }}>{c.code}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Chart */}
          <div style={{ border: "1px solid var(--color-border)", padding: "2rem", minHeight: 450 }}>
            {!selectedIndicator || selectedCountries.length === 0 ? (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                {!selectedIndicator ? "← Select an indicator" : "← Select at least one country"}
              </div>
            ) : loadingChart ? (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                <span className="etw-label" style={{ color: "var(--color-text-muted)" }}>Loading data...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                <span className="etw-not-disclosed">No data available for this selection.</span>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "0.125rem" }}>{currentIndicator?.name}</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {selectedCountries.join(" · ")} · {currentIndicator?.unit}
                  </p>
                </div>
                <div style={{ height: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#666" }} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => formatValue(v, true)}
                        tick={{ fontSize: 11, fill: "#666" }}
                        tickLine={false}
                        width={72}
                      />
                      <Tooltip
                        contentStyle={{ border: "1px solid #000", borderRadius: 0, fontSize: 12 }}
                        formatter={(value: number) => [formatValue(value), ""]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                      {selectedCountries.map((code, i) => (
                        <Line
                          key={code}
                          type="monotone"
                          dataKey={code}
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2}
                          strokeDasharray={DASHES[i % DASHES.length]}
                          dot={false}
                          activeDot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #eee", fontSize: "0.6875rem", color: "#999" }}>
                  Source: World Bank Open Data · Data shown 1990–2026 where available
                </div>
              </>
            )}
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
          <p className="etw-label" style={{ color: "var(--color-text-muted)", marginTop: "2rem" }}>Loading...</p>
        </div>
      </div>
    }>
      <CompareInner />
    </Suspense>
  );
}
