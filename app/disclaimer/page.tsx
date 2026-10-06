// ETW — Disclaimer Page

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "ETW legal disclaimer — data sourcing, limitations, and not financial advice.",
};

export default function DisclaimerPage() {
  return (
    <div className="etw-page">
      <div className="etw-container" style={{ maxWidth: "800px" }}>

        <div style={{ borderBottom: "2px solid #000", paddingBottom: "2rem", marginBottom: "3rem" }}>
          <p className="etw-label" style={{ marginBottom: "0.75rem" }}>ETW PLATFORM</p>
          <h1 style={{ marginBottom: "1rem" }}>Disclaimer</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Please read this disclaimer carefully before using ETW.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {[
            {
              heading: "Not Financial or Legal Advice",
              text: "ETW is a transparency research tool. Nothing on this platform constitutes financial, investment, legal, or regulatory advice. Data presented is for informational and educational purposes only. Consult qualified professionals for financial or legal decisions.",
            },
            {
              heading: "Data Accuracy and Completeness",
              text: "ETW aggregates publicly available data from credible sources. We make reasonable efforts to ensure accuracy but cannot guarantee that all data is current, complete, or error-free. Data may be revised by source organisations after ETW retrieves it. Always verify critical information with the primary source, whose URL is provided.",
            },
            {
              heading: "Sample Data",
              text: "Records labelled \"SAMPLE DATA — NOT REAL\" are placeholder data used during platform development. They do not represent any real organisation, person, or financial transaction. These records will be replaced with verified data through administrative tools.",
            },
            {
              heading: "Illustrative Cases (De Basement)",
              text: "Cases in the De Basement module labelled \"ILLUSTRATIVE (HYPOTHETICAL)\" are fictional educational examples. They do not describe any real person, company, transaction, or legal proceeding. Any resemblance to real entities is coincidental. These cases are designed to explain structural patterns, not to implicate any individual or organisation.",
            },
            {
              heading: "No Accusations",
              text: "ETW does not make accusations of wrongdoing against any individual, organisation, or government. Statements on this platform are either (a) citations of official public records and credible media, or (b) clearly labelled ETW analysis. ETW does not draw legal conclusions from information on this platform.",
            },
            {
              heading: "ETW Analysis",
              text: "Where ETW provides interpretation or contextualisation of data, this is clearly labelled as \"ETW INTERPRETATION / ANALYSIS\" and is not an official statistic. ETW analysis represents editorial understanding, not authoritative findings.",
            },
            {
              heading: "Emergency Information",
              text: "Emergency alerts on the Contributor module are sourced from official feeds (NDMA, IMD, GDACS, ReliefWeb) and may not reflect the most current situation. For life-safety decisions, always consult official government emergency management authorities directly.",
            },
            {
              heading: "NGO Matching (Emergency Module)",
              text: "ETW labels NGOs as \"Operating nearby\" based on geographic and operational data. An NGO is only labelled \"Confirmed responding\" when a specific evidence record with a source URL and date has been attached by an administrator. ETW does not imply that any NGO is or is not responding to a disaster without evidence.",
            },
            {
              heading: "Intellectual Property",
              text: "Data from sources such as World Bank, IMF, WHO, and UN is used in accordance with their respective open data licences. NGO data is sourced from public government portals. ETW does not claim ownership of source data.",
            },
            {
              heading: "Limitations of Public Records",
              text: "Public records may be incomplete, delayed, or contain errors introduced at the source. ETW presents what is publicly available, not what is necessarily true or complete. Absence of a record does not confirm absence of a fact.",
            },
          ].map((section) => (
            <section key={section.heading} aria-labelledby={section.heading.replace(/\s/g, "-")}>
              <h2
                id={section.heading.replace(/\s/g, "-")}
                style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}
              >
                {section.heading}
              </h2>
              <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.8, margin: 0 }}>
                {section.text}
              </p>
            </section>
          ))}
        </div>

        <div
          style={{
            marginTop: "3rem",
            borderTop: "1px solid var(--color-border)",
            paddingTop: "1.5rem",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            Last updated: October 2026. By using ETW, you acknowledge that you have read
            and understood this disclaimer.
          </p>
        </div>
      </div>
    </div>
  );
}
