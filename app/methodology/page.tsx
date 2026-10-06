// ETW — Methodology & Sources Page

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology & Sources",
  description:
    "How ETW sources, verifies, and presents data. Definitions of Official, Estimated, and Not publicly disclosed labels.",
};

export default function MethodologyPage() {
  return (
    <div className="etw-page">
      <div className="etw-container" style={{ maxWidth: "860px" }}>

        {/* Header */}
        <div style={{ borderBottom: "2px solid #000", paddingBottom: "2rem", marginBottom: "3rem" }}>
          <p className="etw-label" style={{ marginBottom: "0.75rem" }}>ETW PLATFORM</p>
          <h1 style={{ marginBottom: "1rem" }}>Methodology &amp; Sources</h1>
          <p style={{ fontSize: "1.0625rem", color: "var(--color-text-secondary)" }}>
            How ETW aggregates data, what its labels mean, and what you can and cannot conclude from this platform.
          </p>
        </div>

        {/* Core principle */}
        <section aria-labelledby="core-principle" style={{ marginBottom: "3rem" }}>
          <h2 id="core-principle" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            CORE PRINCIPLE
          </h2>
          <div className="etw-analysis-panel">
            <p style={{ fontWeight: 600, color: "#000", marginBottom: "0.75rem" }}>
              ETW does not fabricate data.
            </p>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
              Every data point on ETW is sourced from a credible public institution or official filing.
              ETW never invents numbers, never infers individual transactions from aggregates, and never
              presents analysis as established fact. Where data is missing, the platform displays
              &ldquo;Not publicly disclosed&rdquo; — not a blank space, not a zero, not a guess.
            </p>
          </div>
        </section>

        {/* Label definitions */}
        <section aria-labelledby="label-definitions" style={{ marginBottom: "3rem" }}>
          <h2 id="label-definitions" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            WHAT THE LABELS MEAN
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              {
                badge: "○ OFFICIAL",
                title: "Official",
                description: "Data reported directly by a government agency, international institution (World Bank, IMF, WHO, UN), or official regulatory filing (MCA, FCRA, NGO Darpan). Source URL is always provided.",
              },
              {
                badge: "✓ VERIFIED",
                title: "Verified",
                description: "ETW has cross-referenced this data point against at least two independent public sources and found consistency. Source URLs provided for each.",
              },
              {
                badge: "~ ESTIMATED",
                title: "Estimated",
                description: "This figure is an estimate from a credible methodology (e.g., UBS/Credit Suisse Global Wealth Report, Forbes for wealth data, UN modelled estimates). The estimation methodology and its limitations are explained. ETW does not confirm estimated figures.",
              },
              {
                badge: "— NOT PUBLICLY DISCLOSED",
                title: "Not publicly disclosed",
                description: "The data has not been found in any accessible public record. ETW does not speculate or fill this in. Absence of data is itself informative.",
              },
              {
                badge: "? UNVERIFIED",
                title: "Unverified",
                description: "Data comes from a single source that ETW has not yet been able to cross-reference. Source is cited. Treat with appropriate caution.",
              },
              {
                badge: "⚠ SAMPLE DATA",
                title: "Sample Data — Not Real",
                description: "This record is placeholder data used for development and demonstration purposes. It is NOT real information about a real organisation, person, or transaction. It will be replaced by verified data when available.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  border: "1px solid var(--color-border)",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "flex-start",
                }}
              >
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    border: "1px solid #999",
                    padding: "0.2rem 0.5rem",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    color: "#333",
                  }}
                >
                  {item.badge}
                </code>
                <div>
                  <strong style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.375rem" }}>
                    {item.title}
                  </strong>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources by module */}
        <section aria-labelledby="data-sources" style={{ marginBottom: "3rem" }}>
          <h2 id="data-sources" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            DATA SOURCES BY MODULE
          </h2>

          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem" }}>
            ROVER — Socioeconomic Statistics
          </h3>
          <table className="etw-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th>Source</th>
                <th>Coverage</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["World Bank Open Data", "GDP, poverty, Gini, health, education, population", "Free API — api.worldbank.org/v2"],
                ["IMF World Economic Outlook", "Government debt, inflation, GDP projections", "Free download — imf.org/en/Data"],
                ["World Health Organization", "Life expectancy, mortality, health expenditure", "Free API — data.who.int"],
                ["UN Population Division", "Population, demographics, urbanisation", "Free download — data.un.org"],
                ["UBS/Credit Suisse Global Wealth Report", "Wealth per adult, billionaire counts", "No free API — MANUAL DATA ENTRY required (see README)"],
                ["Forbes Billionaires List", "Individual billionaire counts and estimated wealth", "No free API — MANUAL DATA ENTRY required"],
                ["WID.world", "Income shares (top 1%, top 10%)", "Free download where available; API limited"],
              ].map(([src, cov, acc]) => (
                <tr key={src}>
                  <td style={{ fontWeight: 500 }}>{src}</td>
                  <td>{cov}</td>
                  <td style={{ fontSize: "0.8125rem", color: acc.includes("MANUAL") ? "#666" : "inherit" }}>
                    {acc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem" }}>
            CONTRIBUTOR — Maharashtra NGOs
          </h3>
          <table className="etw-table" style={{ marginBottom: "1.5rem" }}>
            <thead>
              <tr>
                <th>Source</th>
                <th>Coverage</th>
                <th>Terms</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["NITI Aayog NGO Darpan", "NGO registration, district, categories", "Public portal — terms allow reference with attribution"],
                ["MHA FCRA Online", "Foreign contributions, annual FCRA returns", "Public portal — terms allow reference"],
                ["MCA (Company filings)", "CSR disclosures, company registration", "Public portal — terms allow reference"],
                ["NGO annual reports", "Financial statements published by NGOs", "Where publicly available on NGO websites"],
              ].map(([src, cov, terms]) => (
                <tr key={src}>
                  <td style={{ fontWeight: 500 }}>{src}</td>
                  <td>{cov}</td>
                  <td>{terms}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
            Note: ETW does not scrape websites whose terms of use prohibit automated access. All imports reference the original public source URL.
          </p>

          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", marginTop: "2rem" }}>
            EMERGENCY INTELLIGENCE
          </h3>
          <table className="etw-table">
            <thead>
              <tr><th>Source</th><th>Type</th></tr>
            </thead>
            <tbody>
              {[
                ["NDMA SACHET", "CAP alert feed — official government alerts"],
                ["IMD (India Meteorological Department)", "Weather warnings — official government"],
                ["GDACS", "Global disaster alerts — UN/EC coordination"],
                ["ReliefWeb API", "Humanitarian reports — UN OCHA"],
                ["MSDMA", "Maharashtra State Disaster Management Authority sources"],
              ].map(([src, type]) => (
                <tr key={src}>
                  <td style={{ fontWeight: 500 }}>{src}</td>
                  <td>{type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ETW Analysis */}
        <section aria-labelledby="etw-analysis" style={{ marginBottom: "3rem" }}>
          <h2 id="etw-analysis" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            ETW ANALYSIS vs. OFFICIAL DATA
          </h2>
          <div className="etw-analysis-panel">
            <p style={{ fontWeight: 600, marginBottom: "0.75rem", color: "#000" }}>
              ETW provides its own interpretation and contextualisation — clearly labelled.
            </p>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.8, margin: 0 }}>
              Wherever ETW adds context, explains significance, or draws cross-indicator comparisons,
              this is presented in a visually distinct panel labelled{" "}
              <strong>&ldquo;ETW INTERPRETATION / ANALYSIS&rdquo;</strong> and accompanied by a
              statement that it is not an official statistic. Official data panels and ETW
              interpretation panels are never mixed. Users can always identify which statements
              come from official sources and which represent ETW&rsquo;s editorial understanding.
            </p>
          </div>
        </section>

        {/* De Basement */}
        <section aria-labelledby="de-basement-method" style={{ marginBottom: "3rem" }}>
          <h2 id="de-basement-method" className="etw-section-heading" style={{ marginBottom: "1.5rem" }}>
            DE BASEMENT MODULE — IMPORTANT NOTE
          </h2>
          <div style={{ border: "2px dashed #888", padding: "1.5rem" }}>
            <p style={{ fontWeight: 700, marginBottom: "0.75rem", color: "#000" }}>
              Educational purpose only.
            </p>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: "1rem" }}>
              The De Basement module explains how legal financial structures and regulatory gaps can
              create transparency challenges. It does <strong>not</strong> provide operational
              guidance on how to exploit any structure, and does <strong>not</strong> contain
              evasion or optimization advice.
            </p>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: "1rem" }}>
              Cases currently live on this platform are labelled{" "}
              <strong>ILLUSTRATIVE (HYPOTHETICAL)</strong> and use entirely fictional entity names.
              No real person or company is implicated in illustrative cases.
            </p>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.8, margin: 0 }}>
              Real cases can only be added by an administrator after manual verification and legal
              review. Every real case must cite primary sources (court records, regulatory filings,
              or credible media with named authors and publication dates).
            </p>
          </div>
        </section>

        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
          Last updated: October 2026. This page will be updated when new data sources are added.
        </p>
      </div>
    </div>
  );
}
