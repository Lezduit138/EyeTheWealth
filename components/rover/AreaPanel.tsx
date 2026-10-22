/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink, ShieldCheck, AlertTriangle, Building2,
  HeartHandshake, Info, X, TrendingUp, BarChart2,
  FileText, Users, Globe,
} from "lucide-react";

interface AreaPanelProps {
  placeId:    string;
  placeSlug:  string;
  placeName:  string;
  placeLevel: string;
  onClose:    () => void;
}

type TabId = "overview" | "assets" | "deprivation" | "factors" | "ngos" | "individuals" | "sources";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview",    label: "Overview",         icon: <Globe size={12} /> },
  { id: "assets",      label: "Assets",           icon: <TrendingUp size={12} /> },
  { id: "deprivation", label: "Deprivation",      icon: <BarChart2 size={12} /> },
  { id: "factors",     label: "Factors",          icon: <Info size={12} /> },
  { id: "ngos",        label: "NGOs",             icon: <Building2 size={12} /> },
  { id: "individuals", label: "Individuals",      icon: <Users size={12} /> },
  { id: "sources",     label: "Sources",          icon: <FileText size={12} /> },
];

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ border: "1px solid #000", padding: "10px 12px", background: "#fff" }}>
      <div style={{ fontSize: 9, fontFamily: "monospace", color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 16, color: "#000", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 9, color: "#888", fontFamily: "monospace", marginTop: 3 }}>{sub}</div>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#000", borderBottom: "2px solid #000", paddingBottom: 4, marginBottom: 10 }}>
      {title}
    </div>
  );
}

function NotDisclosedBadge({ level }: { level: string }) {
  return (
    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", fontStyle: "italic", background: "#f4f4f4", border: "1px dashed #bbb", padding: "5px 8px" }}>
      Not publicly disclosed at {level} level
    </div>
  );
}

export default function AreaPanel({ placeId, placeSlug, placeName, placeLevel, onClose }: AreaPanelProps) {
  const [activeTab, setActiveTab]         = useState<TabId>("overview");
  const [loading, setLoading]             = useState(false);
  const [assetsData, setAssetsData]       = useState<any>(null);
  const [deprivData, setDeprivData]       = useState<any>(null);
  const [factorsData, setFactorsData]     = useState<any>(null);
  const [ngosData, setNgosData]           = useState<any>(null);
  const [individualsData, setIndivData]   = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    function load() {
      if (!cancelled) setLoading(true);
      Promise.all([
        fetch(`/api/v1/rover/assets?slug=${encodeURIComponent(placeSlug)}`, { signal: controller.signal }).then(r => r.json()),
        fetch(`/api/v1/rover/deprivation?slug=${encodeURIComponent(placeSlug)}`, { signal: controller.signal }).then(r => r.json()),
        fetch(`/api/v1/rover/factors?slug=${encodeURIComponent(placeSlug)}`, { signal: controller.signal }).then(r => r.json()),
        fetch(`/api/v1/rover/ngos?slug=${encodeURIComponent(placeSlug)}`, { signal: controller.signal }).then(r => r.json()),
        fetch(`/api/v1/rover/individuals?slug=${encodeURIComponent(placeSlug)}`, { signal: controller.signal }).then(r => r.json()),
      ]).then(([a, d, f, n, i]) => {
        if (cancelled) return;
        if (a.success) setAssetsData(a.data);
        if (d.success) setDeprivData(d.data);
        if (f.success) setFactorsData(f.data);
        if (n.success) setNgosData(n.data);
        if (i.success) setIndivData(i.data);
      }).catch(err => { if (!cancelled) console.error("[AreaPanel] fetch error", err); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }
    load();
    return () => { cancelled = true; controller.abort(); };
  }, [placeSlug]);

  return (
    <div style={{
      width: 420, flexShrink: 0, borderLeft: "1px solid #000",
      background: "#fff", display: "flex", flexDirection: "column",
      height: "100%", overflowY: "hidden", fontFamily: "sans-serif",
    }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ background: "#000", color: "#fff", padding: "14px 16px", borderBottom: "1px solid #000", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2, background: "#333", border: "1px solid #555", padding: "1px 6px", color: "#fff" }}>
              {placeLevel}
            </span>
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#888" }}>Census 2011 / NFHS-5</span>
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2, margin: 0, color: "#fff", letterSpacing: -0.5 }}>
            {placeName}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "1px solid #555", color: "#fff", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid #000", overflowX: "auto", background: "#fafafa", flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 11px", whiteSpace: "nowrap",
              fontSize: 11, fontFamily: "monospace", fontWeight: activeTab === t.id ? 700 : 400,
              background: activeTab === t.id ? "#fff" : "transparent",
              color: activeTab === t.id ? "#000" : "#555",
              border: "none", borderRight: "1px solid #e0e0e0",
              borderBottom: activeTab === t.id ? "2px solid #000" : "2px solid transparent",
              cursor: "pointer", transition: "all 0.1s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div style={{ flexGrow: 1, overflowY: "auto", padding: 16 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 10, fontFamily: "monospace", fontSize: 12, color: "#555" }}>
            <div style={{ width: 22, height: 22, border: "2px solid #000", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Fetching public data…
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ─────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Status */}
                <div style={{ border: `1px solid ${deprivData?.isFlagged ? "#c00" : "#000"}`, padding: 12, background: deprivData?.isFlagged ? "#fff5f5" : "#fff" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                    Rule-Engine Verdict
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                    {deprivData?.isFlagged
                      ? <><AlertTriangle size={16} color="#c00" /> <span style={{ color: "#c00" }}>Deprivation indicators present</span></>
                      : <><ShieldCheck size={16} /> Baseline standards met</>
                    }
                  </div>
                  <p style={{ fontSize: 12, color: "#444", lineHeight: 1.6, margin: 0 }}>{deprivData?.summaryText}</p>
                </div>

                {/* Quick stat grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <StatBox label="Resolution level" value={placeLevel.toUpperCase()} />
                  <StatBox label="Parent unit"      value={assetsData?.parent?.name ?? "India"} />
                </div>

                {/* ETW data rule notice */}
                <div style={{ border: "1px solid #ddd", padding: 12, background: "#fafafa" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <Info size={12} /> ETW Data Integrity Rule
                  </div>
                  <p style={{ fontSize: 11, color: "#555", lineHeight: 1.6, margin: 0 }}>
                    National/state-level aggregates (e.g. gold reserves, GSDP) are only shown at their <strong>officially published measurement level</strong>. If a statistic is not published for this level, it is labelled <em>&quot;Not publicly disclosed&quot;</em>. ETW never apportions or downscales.
                  </p>
                </div>
              </div>
            )}

            {/* ── ASSETS ───────────────────────────────────────── */}
            {activeTab === "assets" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#555", background: "#f4f4f4", border: "1px solid #ddd", padding: 8 }}>
                  Official public datasets only. No composite wealth score; no apportioning from higher levels.
                </div>

                {(!assetsData?.assetComposition || assetsData.assetComposition.length === 0) ? (
                  <div style={{ border: "1px solid #000", padding: 24, textAlign: "center", fontFamily: "monospace", fontSize: 12, color: "#777" }}>
                    No publicly-disclosed asset-level data for this unit.
                  </div>
                ) : (
                  assetsData.assetComposition.map((cat: any) => (
                    <div key={cat.categoryId} style={{ border: "1px solid #000", padding: 14, background: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{cat.categoryName}</span>
                        <span style={{
                          fontSize: 9, fontFamily: "monospace", textTransform: "uppercase",
                          padding: "2px 6px", border: "1px solid",
                          background: cat.status === "MEASURED" ? "#000" : "#f4f4f4",
                          color:      cat.status === "MEASURED" ? "#fff" : "#888",
                          borderColor: cat.status === "MEASURED" ? "#000" : "#ccc",
                        }}>
                          {cat.resolutionLabel}
                        </span>
                      </div>

                      {cat.status === "MEASURED" ? (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 20 }}>{cat.value?.toLocaleString()}</span>
                          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#555" }}>{cat.unit}</span>
                          {cat.isEstimate && <span style={{ fontSize: 10, color: "#888" }}>(Estimate)</span>}
                        </div>
                      ) : (
                        <NotDisclosedBadge level={placeLevel} />
                      )}

                      {cat.sourceName && (
                        <div style={{ borderTop: "1px solid #eee", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace", color: "#666" }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }} title={cat.sourceName}>
                            {cat.sourceName} ({cat.year ?? "Official"})
                          </span>
                          {cat.sourceUrl && (
                            <a href={cat.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#000", fontWeight: 700, textDecoration: "underline", display: "flex", alignItems: "center", gap: 3 }}>
                              Verify <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── DEPRIVATION ──────────────────────────────────── */}
            {activeTab === "deprivation" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ border: "1px solid #000", padding: 14 }}>
                  <SectionHeader title="Rule Engine Verdict" />
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{deprivData?.deprivationStatus}</div>
                  <p style={{ fontSize: 12, color: "#444", lineHeight: 1.6, marginBottom: 10 }}>{deprivData?.summaryText}</p>

                  <div style={{ background: "#f4f4f4", border: "1px solid #000", padding: 10, fontFamily: "monospace", fontSize: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 5, borderBottom: "1px solid #ccc", paddingBottom: 4 }}>{deprivData?.ruleName}</div>
                    <div>MPI Threshold: <strong>{deprivData?.ruleThresholds?.mpiBaseline}</strong></div>
                    <div>Literacy Threshold: <strong>{deprivData?.ruleThresholds?.literacyBaseline}</strong></div>
                    <div>Sanitation Threshold: <strong>{deprivData?.ruleThresholds?.sanitationBaseline}</strong></div>
                  </div>
                </div>

                <div style={{ border: "1px solid #000", padding: 14 }}>
                  <SectionHeader title="Weak Dimensions" />
                  {(!deprivData?.weakDimensions || deprivData.weakDimensions.length === 0) ? (
                    <div style={{ color: "#777", fontStyle: "italic", fontSize: 12 }}>All published dimensions meet baseline thresholds.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {deprivData.weakDimensions.map((w: any, i: number) => (
                        <div key={i} style={{ borderLeft: "3px solid #000", paddingLeft: 10, paddingTop: 4, paddingBottom: 4 }}>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{w.dimension}</div>
                          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#333", marginTop: 2 }}>
                            {w.indicator}: <strong>{w.value}%</strong>
                          </div>
                          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666" }}>Benchmark: {w.benchmark}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {deprivData?.interpretationDisclaimer && (
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", fontStyle: "italic", borderTop: "1px solid #eee", paddingTop: 8 }}>
                    {deprivData.interpretationDisclaimer}
                  </div>
                )}
              </div>
            )}

            {/* ── FACTORS ──────────────────────────────────────── */}
            {activeTab === "factors" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <SectionHeader title="Structural Factors" />
                {(!factorsData?.factorsThatMayContribute || factorsData.factorsThatMayContribute.length === 0) ? (
                  <div style={{ border: "1px solid #000", padding: 24, textAlign: "center", fontFamily: "monospace", fontSize: 12, color: "#777" }}>
                    No structural deprivation factors triggered for this locality.
                  </div>
                ) : (
                  factorsData.factorsThatMayContribute.map((f: any, i: number) => (
                    <div key={i} style={{ border: "1px solid #000", padding: 14, background: "#fff" }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{f.factorName}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", marginBottom: 8 }}>
                        Observed {f.indicator}: <strong>{f.observedValue}</strong>
                      </div>
                      <p style={{ fontSize: 12, color: "#333", lineHeight: 1.6, background: "#f9f9f9", borderLeft: "2px solid #000", padding: "6px 10px", marginBottom: 10 }}>
                        {f.hedgedExplanation}
                      </p>
                      {f.citations?.length > 0 && (
                        <div>
                          <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Citations:</div>
                          {f.citations.map((c: any, ci: number) => (
                            <div key={ci} style={{ fontSize: 10, fontFamily: "monospace", color: "#444", marginBottom: 3, lineHeight: 1.4 }}>
                              • <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "#000", textDecoration: "underline", fontWeight: 600 }}>{c.title}</a> ({c.source}, {c.year})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {factorsData?.whatThisDoesNotCapture?.length > 0 && (
                  <div style={{ border: "1px solid #ddd", padding: 12, background: "#fafafa" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>What This Does Not Capture</div>
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {factorsData.whatThisDoesNotCapture.map((w: string, i: number) => (
                        <li key={i} style={{ fontSize: 11, color: "#555", marginBottom: 3, lineHeight: 1.5 }}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {factorsData?.etwNotice && (
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", fontStyle: "italic" }}>{factorsData.etwNotice}</div>
                )}
              </div>
            )}

            {/* ── NGOS ─────────────────────────────────────────── */}
            {activeTab === "ngos" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!ngosData?.coversRegion ? (
                  <div style={{ border: "1px solid #000", padding: 24, textAlign: "center", fontFamily: "monospace" }}>
                    <Building2 size={24} style={{ margin: "0 auto 8px", color: "#888", display: "block" }} />
                    <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>Regional Scope Notice</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{ngosData?.regionNotice}</div>
                  </div>
                ) : ngosData?.ngos?.length === 0 ? (
                  <div style={{ border: "1px solid #000", padding: 24, textAlign: "center", fontFamily: "monospace" }}>
                    <HeartHandshake size={24} style={{ margin: "0 auto 8px", color: "#888", display: "block" }} />
                    <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>No NGOs on record for this area</div>
                    <p style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>Directory covers registered entities with verified filings in Maharashtra.</p>
                    <Link href="/contributor" style={{ display: "inline-block", border: "1px solid #000", padding: "5px 12px", background: "#000", color: "#fff", fontSize: 11, fontWeight: 700, textDecoration: "none", textTransform: "uppercase" }}>
                      Contributor Directory →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div style={{ background: "#fffbeb", border: "1px solid #000", padding: 8, fontFamily: "monospace", fontSize: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{ngosData?.disclaimer}</span>
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666" }}>
                      Showing {ngosData?.ngos?.length} verified organisations:
                    </div>
                    {ngosData.ngos.map((ngo: any) => (
                      <div key={ngo.id} style={{ border: "1px solid #000", padding: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{ngo.name}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, fontSize: 10, fontFamily: "monospace", color: "#555", marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: "#000" }}>{ngo.district ?? "Maharashtra"}</span>
                          <span>·</span>
                          {ngo.categories?.map((c: string, ci: number) => (
                            <span key={ci} style={{ background: "#f4f4f4", border: "1px solid #ccc", padding: "0 4px" }}>{c}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: "#444", lineHeight: 1.5, marginBottom: 10 }}>{ngo.matchRationale}</p>
                        <div style={{ borderTop: "1px solid #eee", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "monospace", fontSize: 9, border: "1px solid #ccc", padding: "2px 5px", color: "#555" }}>
                            {ngo.financialTransparency === "PUBLIC_FILINGS_AVAILABLE" ? "Audited Filings Public" : "Not publicly disclosed"}
                          </span>
                          <Link href={ngo.profileUrl ?? "/contributor"} style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#000", textDecoration: "underline" }}>
                            Profile →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── INDIVIDUALS ──────────────────────────────────── */}
            {activeTab === "individuals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {individualsData?.notice && (
                  <div style={{ background: "#f4f4f4", border: "1px solid #ccc", padding: 10, fontFamily: "monospace", fontSize: 10, color: "#555", lineHeight: 1.5 }}>
                    {individualsData.notice}
                  </div>
                )}
                {(!individualsData?.publicFigures || individualsData.publicFigures.length === 0) ? (
                  <div style={{ border: "1px solid #000", padding: 24, textAlign: "center", fontFamily: "monospace", fontSize: 12, color: "#777" }}>
                    No verified public-figure profiles for this locality.
                  </div>
                ) : (
                  individualsData.publicFigures.map((p: any) => (
                    <div key={p.id} style={{ border: "1px solid #000", padding: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666", marginBottom: 6 }}>
                        Public Figure ({p.nationality ?? "India"}) · Born {p.birthYear ?? "N/A"}
                      </div>
                      <p style={{ fontSize: 12, color: "#333", lineHeight: 1.5, marginBottom: 10 }}>{p.description}</p>
                      <div style={{ borderTop: "1px solid #eee", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "monospace", fontSize: 10 }}>
                        <a href={p.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#000", textDecoration: "underline", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          ECI Affidavit <ExternalLink size={9} />
                        </a>
                        <Link href="/request-correction" style={{ color: "#888", textDecoration: "underline" }}>
                          Correction Request
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── SOURCES ──────────────────────────────────────── */}
            {activeTab === "sources" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SectionHeader title="Primary Public Datasets" />
                {[
                  { name: "Census of India 2011",      sub: "Primary Census Abstract & Housing Tables",           url: "https://censusindia.gov.in" },
                  { name: "NITI Aayog National MPI",   sub: "National Multidimensional Poverty Index (2023)",      url: "https://niti.gov.in" },
                  { name: "RBI – DBIE",                sub: "Basic Statistical Returns: Credit & Deposits",        url: "https://dbie.rbi.org.in" },
                  { name: "NFHS-5 Factsheets",         sub: "Ministry of Health & Family Welfare / IIPS",          url: "http://rchiips.org/nfhs" },
                  { name: "Election Commission (ECI)", sub: "Candidate affidavit filings (Form 26)",               url: "https://affidavit.eci.gov.in" },
                  { name: "LGD India",                 sub: "Local Government Directory — admin hierarchy",        url: "https://lgdirectory.gov.in" },
                ].map(s => (
                  <div key={s.url} style={{ border: "1px solid #000", padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666", marginBottom: 6 }}>{s.sub}</div>
                    <a href={s.url} target="_blank" rel="noreferrer" style={{ fontFamily: "monospace", fontSize: 10, color: "#000", textDecoration: "underline" }}>{s.url}</a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
