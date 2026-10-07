// ETW — Global Footer

import React from "react";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: "2px solid #000",
        background: "#000",
        color: "#fff",
        padding: "2.5rem 0 2rem",
      }}
    >
      <div className="etw-container">
        {/* Top row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: "1.25rem",
                letterSpacing: "-0.03em",
                marginBottom: "0.5rem",
              }}
            >
              ETW
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: "1rem",
              }}
            >
              EYE THE WEALTH
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#999", lineHeight: 1.6 }}>
              Aggregating public financial and socioeconomic data from credible
              sources. Preserving original methodology.
            </p>
          </div>

          {/* Modules */}
          <div>
            <div
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#666",
                marginBottom: "1rem",
              }}
            >
              MODULES
            </div>
            <nav aria-label="Footer modules navigation">
              {[
                { href: "/rover", label: "ROVER — Socioeconomic Data" },
                { href: "/contributor", label: "CONTRIBUTOR — NGO Directory" },
                { href: "/de-basement", label: "DE BASEMENT — Structures" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    color: "#bbb",
                    textDecoration: "none",
                    marginBottom: "0.5rem",
                    transition: "color 0.15s",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Platform */}
          <div>
            <div
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#666",
                marginBottom: "1rem",
              }}
            >
              PLATFORM
            </div>
            <nav aria-label="Footer platform navigation">
              {[
                { href: "/methodology", label: "Methodology & Sources" },
                { href: "/disclaimer", label: "Disclaimer" },
                { href: "/request-correction", label: "Request a Correction" },
                { href: "/admin", label: "Admin Dashboard" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    color: "#bbb",
                    textDecoration: "none",
                    marginBottom: "0.5rem",
                    transition: "color 0.15s",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Integrity notice */}
          <div>
            <div
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#666",
                marginBottom: "1rem",
              }}
            >
              DATA INTEGRITY
            </div>
            <p style={{ fontSize: "0.75rem", color: "#888", lineHeight: 1.7 }}>
              ETW does not fabricate data. Missing data shows &ldquo;Not publicly
              disclosed&rdquo;. Estimates carry an Estimated badge. Every data
              point preserves its source, year, and methodology.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #333", paddingTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>
              © {year} ETW — Eye The Wealth. All data from public sources with
              attribution.
            </p>
            <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>
              ETW analysis is clearly labelled and is not an official statistic.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
