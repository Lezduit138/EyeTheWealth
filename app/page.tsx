// ETW — Landing Page ( / )
// "Explore. Trace. Understand."

import type { Metadata } from "next";
import { ModuleCard } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "ETW — Eye The Wealth | Explore. Trace. Understand.",
  description:
    "ETW is a financial and socioeconomic transparency platform. Explore wealth statistics, NGO funding, and financial structures using public data.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "5rem 0 4rem",
          textAlign: "center",
        }}
      >
        <div className="etw-container">
          {/* ETW wordmark */}
          <div
            id="hero-heading"
            style={{
              fontWeight: 900,
              fontSize: "clamp(4rem, 15vw, 9rem)",
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: "#000",
              marginBottom: "0.25rem",
            }}
            aria-label="ETW"
          >
            ETW
          </div>

          <div
            style={{
              fontSize: "clamp(0.75rem, 2vw, 1rem)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            EYE THE WEALTH
          </div>

          <div
            style={{
              borderTop: "2px solid #000",
              borderBottom: "2px solid #000",
              padding: "1rem 0",
              marginBottom: "2rem",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.375rem)",
                fontWeight: 400,
                color: "#000",
                letterSpacing: "0.02em",
                margin: 0,
              }}
            >
              Explore.&nbsp;&nbsp;Trace.&nbsp;&nbsp;Understand.
            </p>
          </div>

          <p
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              fontSize: "0.9375rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            ETW aggregates public financial and socioeconomic data from credible
            sources — preserving original methodology, cross-referencing where
            possible, and clearly separating official data from ETW analysis.
          </p>
        </div>
      </section>

      {/* ── Module Cards ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="modules-heading"
        style={{ padding: "4rem 0" }}
      >
        <div className="etw-container">
          <h2
            id="modules-heading"
            className="etw-section-heading"
            style={{ marginBottom: "2rem" }}
          >
            EXPLORE
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <ModuleCard
              href="/rover"
              title="ROVER"
              subtitle="Socioeconomic & Wealth Statistics"
              description="Explore GDP, poverty, inequality, health, and education data across 8 countries. Compare indicators. Trace methodology. Understand what the numbers mean."
              cta="→ ENTER ROVER"
            />

            <ModuleCard
              href="/contributor"
              title="CONTRIBUTOR"
              subtitle="Maharashtra NGO Directory"
              description="Explore NGOs, funding sources, financial records, and disaster response across Maharashtra's 36 districts. Every financial record shows its source."
              cta="→ ENTER CONTRIBUTOR"
            />

            <ModuleCard
              href="/de-basement"
              title="DE BASEMENT"
              subtitle="Financial Structures & Transparency"
              description="Examine legal financial structures, regulatory gaps, and why tracing money through legitimate structures is structurally difficult. Educational use only."
              cta="→ ENTER DE BASEMENT"
            />
          </div>
        </div>
      </section>

      {/* ── Principles ────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="principles-heading"
        style={{
          background: "#000",
          color: "#fff",
          padding: "4rem 0",
        }}
      >
        <div className="etw-container">
          <h2
            id="principles-heading"
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#666",
              borderLeft: "3px solid #666",
              paddingLeft: "0.75rem",
              marginBottom: "2.5rem",
            }}
          >
            HOW ETW WORKS
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: "○",
                title: "Official Data First",
                body: "Every data point cites its source: World Bank, IMF, WHO, UN, government portals. ETW never invents or infers numbers.",
              },
              {
                icon: "—",
                title: "Not Disclosed = Disclosed",
                body: "Where data is unavailable, ETW shows \"Not publicly disclosed\" — not a blank, not a guess.",
              },
              {
                icon: "~",
                title: "Estimates Are Labelled",
                body: "Estimated figures carry an Estimated badge with source and methodology. Official data carries an Official badge.",
              },
              {
                icon: "◎",
                title: "Analysis Is Separate",
                body: "ETW's own interpretation is visually and textually separated from official data, and labelled as analysis — not an official statistic.",
              },
            ].map((p) => (
              <div key={p.title}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "0.75rem",
                    opacity: 0.6,
                  }}
                  aria-hidden="true"
                >
                  {p.icon}
                </div>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#fff",
                    marginBottom: "0.5rem",
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#999", lineHeight: 1.7, margin: 0 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer strip ──────────────────────────────────────────────── */}
      <section
        aria-label="Legal disclaimer"
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "1.5rem 0",
        }}
      >
        <div className="etw-container">
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            ETW is a transparency research tool, not a financial advisory service.
            Data is sourced from public records. ETW does not make accusations.
            Statements of fact are supported by cited sources.{" "}
            <a href="/disclaimer" style={{ color: "#000", fontWeight: 600 }}>
              Full disclaimer →
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
