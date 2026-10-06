// ETW — Rover Module Landing Page
// Socioeconomic & Wealth Statistics Dashboard

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "ROVER — Socioeconomic & Wealth Statistics",
  description:
    "Explore GDP, poverty, inequality, health, and education data across 8 countries. Compare indicators. Trace methodology.",
};

const COUNTRIES = [
  { code: "IND", name: "India", flag: "🇮🇳" },
  { code: "USA", name: "United States", flag: "🇺🇸" },
  { code: "CHN", name: "China", flag: "🇨🇳" },
  { code: "GBR", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DEU", name: "Germany", flag: "🇩🇪" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷" },
  { code: "JPN", name: "Japan", flag: "🇯🇵" },
  { code: "NGA", name: "Nigeria", flag: "🇳🇬" },
];

async function getCategories() {
  return prisma.category.findMany({
    include: {
      indicators: {
        select: { id: true, name: true, slug: true },
        orderBy: { displayOrder: "asc" },
        take: 5,
      },
    },
    orderBy: { displayOrder: "asc" },
  });
}

export default async function RoverPage() {
  const categories = await getCategories();

  return (
    <div className="etw-page">
      {/* Header */}
      <div
        style={{
          borderBottom: "2px solid #000",
          paddingBottom: "2rem",
          marginBottom: "3rem",
        }}
        className="etw-container"
      >
        <p className="etw-label" style={{ marginBottom: "0.5rem" }}>
          MODULE 1
        </p>
        <h1
          style={{
            fontWeight: 900,
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            letterSpacing: "-0.04em",
            marginBottom: "0.5rem",
          }}
        >
          ROVER
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)" }}>
          Socioeconomic &amp; Wealth Statistics — 8 countries · 25+ indicators · Public data only
        </p>
      </div>

      <div className="etw-container">
        {/* Country grid */}
        <section aria-labelledby="countries-heading" style={{ marginBottom: "4rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h2 id="countries-heading" className="etw-section-heading">
              COUNTRIES
            </h2>
            <Link href="/rover/compare" className="etw-btn etw-btn-ghost" style={{ fontSize: "0.6875rem" }}>
              Compare countries →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1px",
              border: "1px solid #000",
            }}
          >
            {COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/rover/${c.code.toLowerCase()}`}
                className="flex items-center gap-3 p-5 no-underline text-black border-r border-b border-black transition-colors bg-white hover:bg-black hover:text-white group"
              >
                <span className="text-3xl" aria-hidden="true">
                  {c.flag}
                </span>
                <span className="font-semibold text-sm group-hover:text-white">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories & Indicators */}
        <section aria-labelledby="indicators-heading" style={{ marginBottom: "4rem" }}>
          <h2 id="indicators-heading" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            INDICATORS BY CATEGORY
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}
              >
                <h3
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                    borderBottom: "2px solid #000",
                    paddingBottom: "0.5rem",
                  }}
                >
                  {cat.name}
                </h3>
                {cat.description && (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {cat.description}
                  </p>
                )}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {cat.indicators.map((ind) => (
                    <li key={ind.id} style={{ marginBottom: "0.25rem" }}>
                      <Link
                        href={`/rover/indicator/${ind.slug}`}
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.25rem 0",
                          transition: "color 0.15s",
                        }}
                      >
                        <span style={{ color: "#ccc", fontSize: "0.625rem" }}>→</span>
                        {ind.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Data integrity note */}
        <div
          style={{
            border: "1px solid var(--color-border)",
            padding: "1.25rem 1.5rem",
            background: "#fafafa",
          }}
        >
          <p
            className="etw-label"
            style={{ marginBottom: "0.5rem", color: "var(--color-text-muted)" }}
          >
            DATA SOURCES
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
            ROVER fetches real data from the{" "}
            <strong>World Bank Open Data API</strong>, <strong>IMF</strong>,{" "}
            <strong>WHO</strong>, and <strong>UN</strong> datasets. Wealth indicators
            (billionaires, wealth per adult) have no free API — those fields show{" "}
            <em>Not publicly disclosed</em> or <em>SAMPLE PLACEHOLDER</em> until manually
            populated. Run{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
                background: "#eee",
                padding: "0 0.3rem",
              }}
            >
              npm run ingest:worldbank
            </code>{" "}
            to fetch live data.
          </p>
        </div>
      </div>
    </div>
  );
}
