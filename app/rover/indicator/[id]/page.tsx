// ETW — /rover/indicator/[id] — Indicator Detail Page
// Shows: official data, source comparison, "Why does this matter?", ETW interpretation, history chart

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourcePanel, SourceDetail } from "@/components/ui/SourcePanel";
import { IndicatorHistoryChart } from "@/components/rover/IndicatorHistoryChart";

interface Props {
  params: Promise<{ id: string }>;
}

async function getIndicatorData(slug: string) {
  const indicator = await prisma.indicator.findUnique({
    where: { slug },
    include: {
      category: true,
      interpretations: { orderBy: { lastReviewed: "desc" }, take: 1 },
      dataPoints: {
        include: {
          country: { select: { code: true, name: true, flagEmoji: true } },
          source: { select: { name: true, url: true, shortName: true } },
        },
        orderBy: [{ country: { name: "asc" } }, { year: "desc" }],
      },
    },
  });
  return indicator;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const indicator = await getIndicatorData(id);
  if (!indicator) return { title: "Indicator not found" };
  return {
    title: `${indicator.name} — ROVER`,
    description: indicator.definition.slice(0, 155),
  };
}

export default async function IndicatorPage({ params }: Props) {
  const { id } = await params;
  const indicator = await getIndicatorData(id);
  if (!indicator) notFound();

  const interpretation = indicator.interpretations[0];

  // Build per-country latest values and historical series
  const latestByCountry = new Map<string, typeof indicator.dataPoints[0]>();
  const historyByCountry = new Map<string, typeof indicator.dataPoints>();

  for (const dp of indicator.dataPoints) {
    const key = dp.country.code;
    if (!latestByCountry.has(key) || dp.year > latestByCountry.get(key)!.year) {
      latestByCountry.set(key, dp);
    }
    if (!historyByCountry.has(key)) historyByCountry.set(key, []);
    historyByCountry.get(key)!.push(dp);
  }

  // Multiple sources for the same country/year — find discrepancies
  const discrepancies: Array<{
    country: string;
    year: number;
    values: Array<{ source: string; value: number | null }>;
  }> = [];
  const seen = new Map<string, typeof indicator.dataPoints[0]>();
  for (const dp of indicator.dataPoints) {
    const key = `${dp.country.code}-${dp.year}`;
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      if (existing.sourceId !== dp.sourceId) {
        const existing_disc = discrepancies.find(
          (d) => d.country === dp.country.code && d.year === dp.year
        );
        if (existing_disc) {
          existing_disc.values.push({ source: dp.source?.name ?? "Unknown", value: dp.value });
        } else {
          discrepancies.push({
            country: dp.country.name,
            year: dp.year,
            values: [
              { source: existing.source?.name ?? "Unknown", value: existing.value },
              { source: dp.source?.name ?? "Unknown", value: dp.value },
            ],
          });
        }
      }
    }
    seen.set(key, dp);
  }

  const countries = Array.from(latestByCountry.values());

  return (
    <div className="etw-page">
      {/* Breadcrumb */}
      <div
        className="etw-container"
        style={{
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "2rem",
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
        }}
      >
        <Link href="/rover" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
          ROVER
        </Link>
        {" → "}
        <Link
          href="/rover"
          style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
        >
          {indicator.category.name.toUpperCase()}
        </Link>
        {" → "}
        <span style={{ color: "#000", fontWeight: 600 }}>{indicator.name.toUpperCase()}</span>
      </div>

      <div className="etw-container">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <p className="etw-label" style={{ marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
            {indicator.category.name.toUpperCase()} · INDICATOR
          </p>
          <h1 style={{ marginBottom: "0.5rem" }}>{indicator.name}</h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", maxWidth: "700px" }}>
            {indicator.definition}
          </p>
          {indicator.unit && (
            <p className="etw-label" style={{ marginTop: "0.75rem", color: "var(--color-text-muted)" }}>
              UNIT: {indicator.unit}
            </p>
          )}
        </div>

        {/* 1. Official Data — all countries, latest */}
        <section aria-labelledby="official-data" style={{ marginBottom: "3rem" }}>
          <h2 id="official-data" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            OFFICIAL DATA — LATEST AVAILABLE
          </h2>

          {countries.length === 0 ? (
            <div style={{ border: "2px dashed var(--color-border)", padding: "2rem", textAlign: "center" }}>
              <p className="etw-not-disclosed">
                No data ingested yet. Run{" "}
                <code style={{ fontFamily: "var(--font-mono)", background: "#eee", padding: "0.1rem 0.3rem" }}>
                  npm run ingest:worldbank
                </code>
                {" "}to fetch live data.
              </p>
            </div>
          ) : (
            <table className="etw-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Year</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {countries.map((dp) => (
                  <tr key={dp.id}>
                    <td>
                      <Link
                        href={`/rover/${dp.country.code.toLowerCase()}`}
                        style={{ fontWeight: 600, textDecoration: "none", color: "#000" }}
                      >
                        {dp.country.flagEmoji && (
                          <span style={{ marginRight: "0.5rem" }}>{dp.country.flagEmoji}</span>
                        )}
                        {dp.country.name}
                      </Link>
                    </td>
                    <td>
                      {dp.value !== null ? (
                        <strong>
                          {dp.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        </strong>
                      ) : (
                        <span className="etw-not-disclosed">Not publicly disclosed</span>
                      )}
                    </td>
                    <td style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                      {dp.unit ?? indicator.unit}
                    </td>
                    <td>{dp.year}</td>
                    <td>
                      {dp.source ? (
                        <a
                          href={dp.sourceUrl ?? dp.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "0.8125rem" }}
                        >
                          {dp.source.shortName ?? dp.source.name} ↗
                        </a>
                      ) : (
                        <span className="etw-not-disclosed">Not disclosed</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge
                        status={dp.verificationStatus as "OFFICIAL" | "ESTIMATED" | "NOT_DISCLOSED" | "SAMPLE" | "VERIFIED" | "UNVERIFIED"}
                        showIcon={false}
                      />
                    </td>
                    <td>
                      <Link
                        href={`/rover/compare?indicator=${indicator.slug}&countries=${dp.country.code.toLowerCase()}`}
                        style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
                      >
                        Compare →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 2. Source Comparison (only if discrepancies exist) */}
        {discrepancies.length > 0 && (
          <section aria-labelledby="source-comparison" style={{ marginBottom: "3rem" }}>
            <h2 id="source-comparison" className="etw-section-heading" style={{ marginBottom: "1rem" }}>
              SOURCE COMPARISON
            </h2>
            <div className="etw-analysis-panel" style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
                Different sources report different values for this indicator. Differences can arise from
                methodology variations, revision cycles, dataset versions, or survey year differences.
                ETW shows all available figures — not a single &ldquo;correct&rdquo; number.
              </p>
            </div>
            <table className="etw-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Year</th>
                  <th>Source</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {discrepancies.map((d) =>
                  d.values.map((v, i) => (
                    <tr key={`${d.country}-${d.year}-${i}`}>
                      {i === 0 && (
                        <>
                          <td rowSpan={d.values.length} style={{ fontWeight: 600 }}>{d.country}</td>
                          <td rowSpan={d.values.length}>{d.year}</td>
                        </>
                      )}
                      <td>{v.source}</td>
                      <td>
                        {v.value !== null ? v.value.toLocaleString() : (
                          <span className="etw-not-disclosed">Not disclosed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* 3. Why does this number matter? */}
        <section aria-labelledby="why-matters" style={{ marginBottom: "3rem" }}>
          <h2 id="why-matters" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            WHY DOES THIS NUMBER MATTER?
          </h2>
          <div style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.8, margin: 0 }}>
              {indicator.definition}
            </p>
            {indicator.methodology && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                <p className="etw-label" style={{ marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
                  HOW IT IS MEASURED
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.8, margin: 0 }}>
                  {indicator.methodology}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4. ETW Interpretation (clearly labelled as NOT official) */}
        {interpretation && (
          <section aria-labelledby="etw-interpretation" style={{ marginBottom: "3rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h2 id="etw-interpretation" className="etw-section-heading" style={{ margin: 0 }}>
                ETW INTERPRETATION / ANALYSIS
              </h2>
              <span className="etw-badge etw-badge-sample">⚠ Not an official statistic</span>
            </div>

            <div className="etw-analysis-panel">
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: "1rem" }}>
                {interpretation.text}
              </p>

              {interpretation.factors && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                  <p className="etw-label" style={{ marginBottom: "0.75rem", color: "var(--color-text-muted)" }}>
                    KEY FACTORS INFLUENCING THIS INDICATOR
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                    {(JSON.parse(interpretation.factors) as string[]).map((f) => (
                      <li key={f} style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.375rem", lineHeight: 1.6 }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--color-border)",
                  margin: "1rem 0 0",
                }}
              >
                ETW Interpretation · Last reviewed:{" "}
                {new Date(interpretation.lastReviewed).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
                {" "}· This analysis is ETW&rsquo;s editorial understanding and is not an official statistic.
              </p>
            </div>
          </section>
        )}

        {/* 5. Historical Chart */}
        {countries.length > 0 && (
          <section aria-labelledby="historical-chart" style={{ marginBottom: "3rem" }}>
            <h2 id="historical-chart" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
              HISTORICAL TREND
            </h2>
            <div style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}>
              <IndicatorHistoryChart
                indicatorSlug={indicator.slug}
                indicatorName={indicator.name}
                unit={indicator.unit}
              />
            </div>
          </section>
        )}

        {/* Source methodology detail */}
        <div style={{ marginBottom: "2rem" }}>
          <SourcePanel title="Indicator Methodology &amp; Source Details">
            <SourceDetail
              definition={indicator.definition}
              methodology={indicator.methodology ?? undefined}
            />
            {indicator.worldBankCode && (
              <div style={{ padding: "0.75rem 0", borderTop: "1px solid var(--color-border)" }}>
                <span className="etw-label" style={{ color: "var(--color-text-muted)" }}>WORLD BANK CODE: </span>
                <a
                  href={`https://data.worldbank.org/indicator/${indicator.worldBankCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.875rem" }}
                >
                  {indicator.worldBankCode} ↗
                </a>
              </div>
            )}
          </SourcePanel>
        </div>
      </div>
    </div>
  );
}
