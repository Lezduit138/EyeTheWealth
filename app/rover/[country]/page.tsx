// ETW — /rover/[country] — Country Profile Page

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourcePanel, SourceDetail } from "@/components/ui/SourcePanel";

interface Props {
  params: Promise<{ country: string }>;
}

// Country code normalization (URL slug → ISO alpha-3)
const COUNTRY_MAP: Record<string, string> = {
  ind: "IND", india: "IND",
  usa: "USA", "united-states": "USA",
  chn: "CHN", china: "CHN",
  gbr: "GBR", uk: "GBR", "united-kingdom": "GBR",
  deu: "DEU", germany: "DEU",
  bra: "BRA", brazil: "BRA",
  jpn: "JPN", japan: "JPN",
  nga: "NGA", nigeria: "NGA",
};

async function getCountryData(slug: string) {
  const code = COUNTRY_MAP[slug.toLowerCase()];
  if (!code) return null;

  const country = await prisma.country.findUnique({
    where: { code },
    include: {
      dataPoints: {
        include: {
          indicator: { include: { category: true } },
          source: true,
        },
        orderBy: [{ year: "desc" }],
      },
    },
  });
  return country;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: slug } = await params;
  const country = await getCountryData(slug);
  if (!country) return { title: "Country not found" };
  return {
    title: `${country.name} — ROVER`,
    description: `Socioeconomic and wealth statistics for ${country.name}. GDP, poverty, health, education, and more — from World Bank and official sources.`,
  };
}

export default async function CountryPage({ params }: Props) {
  const { country: slug } = await params;
  const country = await getCountryData(slug);
  if (!country) notFound();

  // Group datapoints: latest per indicator
  const latestByIndicator = new Map<
    string,
    typeof country.dataPoints[0]
  >();
  for (const dp of country.dataPoints) {
    const existing = latestByIndicator.get(dp.indicatorId);
    if (!existing || dp.year > existing.year) {
      latestByIndicator.set(dp.indicatorId, dp);
    }
  }

  // Group by category
  const byCategory = new Map<
    string,
    { catName: string; items: typeof country.dataPoints }
  >();
  for (const dp of latestByIndicator.values()) {
    const catName = dp.indicator.category.name;
    if (!byCategory.has(catName)) {
      byCategory.set(catName, { catName, items: [] });
    }
    byCategory.get(catName)!.items.push(dp);
  }

  const hasData = latestByIndicator.size > 0;

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
        <span style={{ color: "#000", fontWeight: 600 }}>{country.name.toUpperCase()}</span>
      </div>

      <div className="etw-container">
        {/* Country header */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            {country.flagEmoji && (
              <span style={{ fontSize: "3rem" }} aria-hidden="true">{country.flagEmoji}</span>
            )}
            <div>
              <p className="etw-label" style={{ marginBottom: "0.25rem" }}>COUNTRY PROFILE</p>
              <h1 style={{ marginBottom: "0.25rem" }}>{country.name}</h1>
              {country.region && (
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  {country.region}
                  {country.incomeLevel ? ` · ${country.incomeLevel}` : ""}
                  {country.capitalCity ? ` · Capital: ${country.capitalCity}` : ""}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Link href={`/rover/compare?countries=${country.code.toLowerCase()}`} className="etw-btn">
              Compare with other countries →
            </Link>
          </div>
        </div>

        {/* No data message */}
        {!hasData && (
          <div
            style={{
              border: "2px dashed var(--color-border)",
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <p
              className="etw-label"
              style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}
            >
              NO DATA YET
            </p>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
              No data has been ingested for {country.name} yet.
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
              Run{" "}
              <code style={{ fontFamily: "var(--font-mono)", background: "#eee", padding: "0.1rem 0.4rem" }}>
                npm run ingest:worldbank
              </code>{" "}
              to fetch real data from the World Bank API.
            </p>
          </div>
        )}

        {/* Data by category */}
        {hasData &&
          Array.from(byCategory.entries()).map(([catName, { items }]) => (
            <section
              key={catName}
              aria-labelledby={`cat-${catName}`}
              style={{ marginBottom: "3rem" }}
            >
              <h2
                id={`cat-${catName}`}
                className="etw-section-heading"
                style={{ marginBottom: "1.5rem" }}
              >
                {catName.toUpperCase()}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1px",
                  border: "1px solid var(--color-border)",
                }}
              >
                {items.map((dp) => (
                  <div
                    key={dp.id}
                    style={{
                      padding: "1.5rem",
                      borderRight: "1px solid var(--color-border)",
                      borderBottom: "1px solid var(--color-border)",
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <Link
                        href={`/rover/indicator/${dp.indicator.slug}`}
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "var(--color-text-secondary)",
                          textDecoration: "none",
                          flex: 1,
                        }}
                      >
                        {dp.indicator.name}
                      </Link>
                      <StatusBadge
                        status={dp.verificationStatus as "OFFICIAL" | "ESTIMATED" | "NOT_DISCLOSED" | "SAMPLE" | "VERIFIED" | "UNVERIFIED"}
                        showIcon={false}
                      />
                    </div>

                    {dp.value !== null ? (
                      <div className="etw-data-value-sm" style={{ marginBottom: "0.25rem" }}>
                        {dp.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        {dp.unit && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 400,
                              color: "var(--color-text-muted)",
                              marginLeft: "0.25rem",
                            }}
                          >
                            {dp.unit}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="etw-not-disclosed">Not publicly disclosed</span>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                      <span className="etw-label" style={{ color: "var(--color-text-muted)" }}>
                        {dp.year}
                      </span>
                      {dp.source && (
                        <span className="etw-label" style={{ color: "var(--color-text-muted)" }}>
                          {dp.source.shortName ?? dp.source.name}
                        </span>
                      )}
                    </div>

                    <SourcePanel title="Source detail" className="mt-3">
                      <SourceDetail
                        value={dp.value ?? undefined}
                        unit={dp.unit ?? undefined}
                        year={dp.year}
                        sourceName={dp.source?.name}
                        sourceUrl={dp.sourceUrl ?? dp.source?.url}
                        definition={dp.indicator.definition}
                        methodology={dp.indicator.methodology ?? undefined}
                        verificationStatus={dp.verificationStatus}
                      />
                    </SourcePanel>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
