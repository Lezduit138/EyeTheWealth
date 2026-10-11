/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, AlertTriangle, Building2, HeartHandshake, Database, Info } from "lucide-react";

interface AreaPanelProps {
  placeId: string;
  placeSlug: string;
  placeName: string;
  placeLevel: string;
  onClose: () => void;
}

export default function AreaPanel({
  placeId,
  placeSlug,
  placeName,
  placeLevel,
  onClose,
}: AreaPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "assets" | "deprivation" | "factors" | "ngos" | "individuals" | "sources"
  >("overview");

  const [loading, setLoading] = useState(false);
  const [assetsData, setAssetsData] = useState<any>(null);
  const [deprivationData, setDeprivationData] = useState<any>(null);
  const [factorsData, setFactorsData] = useState<any>(null);
  const [ngosData, setNgosData] = useState<any>(null);
  const [individualsData, setIndividualsData] = useState<any>(null);

  // Fetch Area Data
  useEffect(() => {
    async function fetchAreaData() {
      setLoading(true);
      try {
        const [assetsRes, depRes, factorsRes, ngosRes, indRes] = await Promise.all([
          fetch(`/api/v1/rover/assets?slug=${encodeURIComponent(placeSlug)}`).then((r) => r.json()),
          fetch(`/api/v1/rover/deprivation?slug=${encodeURIComponent(placeSlug)}`).then((r) => r.json()),
          fetch(`/api/v1/rover/factors?slug=${encodeURIComponent(placeSlug)}`).then((r) => r.json()),
          fetch(`/api/v1/rover/ngos?slug=${encodeURIComponent(placeSlug)}`).then((r) => r.json()),
          fetch(`/api/v1/rover/individuals?slug=${encodeURIComponent(placeSlug)}`).then((r) => r.json()),
        ]);

        if (assetsRes.success) setAssetsData(assetsRes.data);
        if (depRes.success) setDeprivationData(depRes.data);
        if (factorsRes.success) setFactorsData(factorsRes.data);
        if (ngosRes.success) setNgosData(ngosRes.data);
        if (indRes.success) setIndividualsData(indRes.data);
      } catch (err) {
        console.error("Failed loading area data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAreaData();
  }, [placeSlug]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "assets", label: "Assets & Wealth" },
    { id: "deprivation", label: "Poverty & Deprivation" },
    { id: "factors", label: "Factors" },
    { id: "ngos", label: "NGOs" },
    { id: "individuals", label: "Individuals" },
    { id: "sources", label: "Sources" },
  ];

  return (
    <div className="w-[420px] flex-shrink-0 border-l border-black bg-white flex flex-col z-20 font-sans h-full shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-black bg-black text-white flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-white bg-gray-800 px-1.5 py-0.5 font-mono border border-gray-600">
              {placeLevel}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              Vintage: 2011/2021
            </span>
          </div>
          <h2 className="font-bold text-lg leading-tight tracking-tight text-white">{placeName}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-gray-800 font-mono text-sm px-2.5 py-1 border border-white transition-colors"
          title="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-black overflow-x-auto text-xs font-mono bg-gray-50 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-2.5 whitespace-nowrap border-r border-black font-semibold transition-colors ${
              activeTab === t.id
                ? "bg-white text-black font-bold border-b-2 border-b-black shadow-[inset_0_-2px_0_#000]"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto p-4 text-xs font-sans bg-white">
        {loading ? (
          <div className="font-mono text-gray-500 py-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin"></div>
            <span>Fetching real public data...</span>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">
                <div className={`border border-black p-3.5 ${deprivationData?.isFlagged ? "bg-red-50/50" : "bg-gray-50"}`}>
                  <div className="font-mono text-[10px] text-gray-600 uppercase mb-1">Status Summary</div>
                  <div className="font-bold text-sm mb-1.5 flex items-center gap-1.5">
                    {deprivationData?.isFlagged ? (
                      <>
                        <AlertTriangle size={15} className="text-red-700" />
                        <span className="text-red-800">Deprivation indicators present</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={15} className="text-black" />
                        <span>Baseline standards met</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-800 text-xs leading-relaxed">{deprivationData?.summaryText}</p>
                </div>

                {/* Key Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-black p-2.5 bg-white">
                    <div className="text-[10px] text-gray-500 font-mono uppercase">Finest Level</div>
                    <div className="font-bold text-sm capitalize">{placeLevel}</div>
                  </div>
                  <div className="border border-black p-2.5 bg-white">
                    <div className="text-[10px] text-gray-500 font-mono uppercase">Parent Unit</div>
                    <div className="font-bold text-sm truncate">{assetsData?.parent?.name || "India"}</div>
                  </div>
                </div>

                <div className="border border-black p-3 bg-gray-50">
                  <div className="font-bold mb-2 uppercase text-[11px] font-mono flex items-center gap-1">
                    <Info size={12} /> Data Resolution Principles
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    ETW adheres to the <strong>strict zero-downscaling rule</strong>. National and state metrics (such as gold reserves or state GDP) are shown exclusively at their published measurement level. If not officially published for this level, the metric is labelled <em>&quot;Not publicly disclosed&quot;</em>.
                  </p>
                </div>
              </div>
            )}

            {/* ASSETS & WEALTH COMPOSITION TAB */}
            {activeTab === "assets" && (
              <div className="flex flex-col gap-3">
                <div className="text-[11px] text-gray-700 bg-gray-50 border border-gray-200 p-2 font-mono">
                  Extensible asset categories derived from official public datasets. No arbitrary composite total wealth score.
                </div>

                {assetsData?.assetComposition?.map((cat: any) => (
                  <div key={cat.categoryId} className="border border-black p-3.5 bg-white hover:border-gray-800 transition-all shadow-sm">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div className="font-bold text-xs uppercase tracking-wider">{cat.categoryName}</div>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                        cat.status === "MEASURED"
                          ? "border-black bg-black text-white"
                          : "border-gray-400 bg-gray-100 text-gray-600"
                      }`}>
                        {cat.resolutionLabel}
                      </span>
                    </div>

                    <div className="my-2.5">
                      {cat.status === "MEASURED" ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-lg font-bold text-black">
                            {cat.value?.toLocaleString()}
                          </span>
                          <span className="font-mono text-xs text-gray-700 font-medium">
                            {cat.unit}
                          </span>
                          {cat.isEstimate && (
                            <span className="text-[10px] font-mono text-gray-500">(Estimated)</span>
                          )}
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-gray-500 italic bg-gray-50 p-1.5 border border-dashed border-gray-300">
                          Not publicly disclosed at {placeLevel} level
                        </div>
                      )}
                    </div>

                    {cat.sourceName ? (
                      <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-600 font-mono">
                        <span className="truncate max-w-[200px]" title={cat.sourceName}>
                          Source: {cat.sourceName} ({cat.year || "Official"})
                        </span>
                        <a
                          href={cat.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline inline-flex items-center gap-0.5 text-black hover:text-gray-600 font-bold"
                        >
                          Verify Source <ExternalLink size={9} />
                        </a>
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-[9px] text-gray-400 font-mono">
                        No sub-national disaggregation disclosed in public filings.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* POVERTY & DEPRIVATION TAB */}
            {activeTab === "deprivation" && (
              <div className="flex flex-col gap-4">
                <div className="border border-black p-3.5 bg-white">
                  <div className="font-mono text-[10px] uppercase text-gray-500 mb-1">Rule Engine Verdict</div>
                  <div className="font-bold text-sm mb-2">{deprivationData?.deprivationStatus}</div>
                  <div className="text-gray-800 text-xs mb-3">{deprivationData?.summaryText}</div>

                  <div className="font-mono text-[10px] bg-gray-100 p-2.5 border border-black flex flex-col gap-1">
                    <div className="font-bold mb-1 border-b border-gray-300 pb-1">
                      Rule: {deprivationData?.ruleName}
                    </div>
                    <div>MPI Headcount Threshold: {deprivationData?.ruleThresholds?.mpiBaseline}</div>
                    <div>Literacy Threshold: {deprivationData?.ruleThresholds?.literacyBaseline}</div>
                    <div>Sanitation Access Threshold: {deprivationData?.ruleThresholds?.sanitationBaseline}</div>
                  </div>
                </div>

                <div className="border border-black p-3.5 bg-white">
                  <div className="font-bold uppercase text-[11px] font-mono mb-2">Weak Dimensions Evaluated</div>
                  {deprivationData?.weakDimensions?.length === 0 ? (
                    <div className="text-gray-500 italic py-2">
                      All published dimensions meet baseline national thresholds.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {deprivationData?.weakDimensions?.map((w: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-l-black pl-2.5 py-1.5 bg-gray-50 border border-r-0 border-t-0 border-b-0">
                          <div className="font-bold text-xs">{w.dimension}</div>
                          <div className="font-mono text-[11px] text-gray-800 mt-0.5">
                            {w.indicator}: <span className="font-bold">{w.value}%</span>
                          </div>
                          <div className="text-[10px] font-mono text-gray-500">Benchmark: {w.benchmark}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-gray-500 font-mono border-t border-gray-200 pt-2 italic leading-tight">
                  {deprivationData?.interpretationDisclaimer}
                </div>
              </div>
            )}

            {/* FACTORS TAB */}
            {activeTab === "factors" && (
              <div className="flex flex-col gap-4">
                <div className="font-mono text-[11px] uppercase font-bold tracking-wide">
                  Factors That May Contribute
                </div>
                {factorsData?.factorsThatMayContribute?.length === 0 ? (
                  <div className="text-gray-500 italic border border-black p-4 text-center">
                    No structural deprivation factors triggered for this locality.
                  </div>
                ) : (
                  factorsData?.factorsThatMayContribute?.map((f: any, idx: number) => (
                    <div key={idx} className="border border-black p-3.5 bg-white shadow-sm">
                      <div className="font-bold text-xs mb-1">{f.factorName}</div>
                      <div className="font-mono text-[10px] text-gray-600 mb-2">
                        Observed {f.indicator}: <span className="font-bold">{f.observedValue}</span>
                      </div>
                      <p className="text-gray-800 text-xs leading-relaxed mb-3 bg-gray-50 p-2 border-l-2 border-l-black">
                        {f.hedgedExplanation}
                      </p>

                      <div className="border-t border-gray-200 pt-2">
                        <div className="font-mono text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Published Empirical Citations:
                        </div>
                        {f.citations?.map((c: any, cIdx: number) => (
                          <div key={cIdx} className="text-[10px] text-gray-800 font-mono mb-1 leading-snug">
                            • <a href={c.url} target="_blank" rel="noreferrer" className="underline font-medium hover:text-black">
                              {c.title}
                            </a> ({c.source}, {c.year})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                <div className="border border-black p-3 bg-gray-50">
                  <div className="font-bold uppercase text-[10px] font-mono mb-1">What This Does Not Capture</div>
                  <ul className="list-disc pl-4 text-[11px] text-gray-700 flex flex-col gap-1 leading-snug">
                    {factorsData?.whatThisDoesNotCapture?.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-[10px] text-gray-500 font-mono italic">
                  {factorsData?.etwNotice}
                </div>
              </div>
            )}

            {/* NGOS TAB */}
            {activeTab === "ngos" && (
              <div className="flex flex-col gap-3">
                {!ngosData?.coversRegion ? (
                  <div className="border border-black p-6 text-center font-mono bg-gray-50">
                    <Building2 className="mx-auto mb-2 text-gray-400" size={24} />
                    <div className="font-bold mb-1">Regional Scope Notice</div>
                    <div className="text-gray-600 text-xs">{ngosData?.regionNotice}</div>
                  </div>
                ) : ngosData?.ngos?.length === 0 ? (
                  <div className="border border-black p-6 text-center font-mono text-gray-600 bg-gray-50">
                    <HeartHandshake className="mx-auto mb-2 text-gray-400" size={24} />
                    <div className="font-bold text-black mb-1">No NGOs on record for this area yet</div>
                    <p className="text-[11px] text-gray-500 mb-3">
                      Directory currently covers registered entities with verified filings in Maharashtra.
                    </p>
                    <Link
                      href="/contributor"
                      className="inline-block border border-black px-3 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800"
                    >
                      Browse Contributor Directory →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-50 border border-black p-2.5 font-mono text-[10px] text-gray-800 flex items-start gap-1.5">
                      <Info size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{ngosData?.disclaimer}</span>
                    </div>

                    <div className="text-[11px] font-mono text-gray-500 mb-1">
                      Showing {ngosData?.ngos?.length} verified organisations active in region:
                    </div>

                    {ngosData?.ngos?.map((ngo: any) => (
                      <div key={ngo.id} className="border border-black p-3.5 bg-white hover:border-gray-800 transition-all shadow-sm">
                        <div className="font-bold text-xs mb-1 text-black">{ngo.name}</div>
                        <div className="text-[10px] font-mono text-gray-600 mb-2 flex flex-wrap gap-1">
                          <span className="font-bold text-black">{ngo.district || "Maharashtra"}</span>
                          <span>·</span>
                          {ngo.categories?.map((cat: string, cIdx: number) => (
                            <span key={cIdx} className="bg-gray-100 px-1 border border-gray-300">
                              {cat}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed">{ngo.matchRationale}</p>

                        <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                          <span className="font-mono text-[9px] px-1.5 py-0.5 border border-black bg-gray-100 font-medium">
                            {ngo.financialTransparency === "PUBLIC_FILINGS_AVAILABLE"
                              ? "Audited Filings Public"
                              : "Not publicly disclosed"}
                          </span>
                          <Link
                            href={ngo.profileUrl}
                            className="font-mono text-[11px] font-bold text-black hover:underline flex items-center gap-1"
                          >
                            Contributor Profile →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* INDIVIDUALS TAB */}
            {activeTab === "individuals" && (
              <div className="flex flex-col gap-3">
                <div className="bg-gray-100 border border-black p-2.5 font-mono text-[10px] text-gray-800 leading-tight">
                  {individualsData?.notice}
                </div>

                {individualsData?.publicFigures?.length === 0 ? (
                  <div className="border border-black p-6 text-center font-mono text-gray-500 bg-gray-50">
                    No verified profile yet for this locality.
                  </div>
                ) : (
                  individualsData?.publicFigures?.map((person: any) => (
                    <div key={person.id} className="border border-black p-3.5 bg-white shadow-sm">
                      <div className="font-bold text-xs mb-1">{person.name}</div>
                      <div className="text-[10px] font-mono text-gray-600 mb-2">
                        Public Figure ({person.nationality || "India"}) · Born {person.birthYear || "N/A"}
                      </div>
                      <p className="text-xs text-gray-800 mb-3 leading-relaxed">{person.description}</p>

                      <div className="flex justify-between items-center pt-2.5 border-t border-gray-200 text-[10px] font-mono">
                        <a
                          href={person.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline flex items-center gap-1 text-black font-bold"
                        >
                          ECI Affidavit Filing <ExternalLink size={9} />
                        </a>
                        <Link href="/rover/correction" className="text-gray-500 underline hover:text-black">
                          Correction Request
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SOURCES TAB */}
            {activeTab === "sources" && (
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="font-bold uppercase text-[11px] mb-1">Primary Public Datasets</div>
                <div className="border border-black p-3 bg-white">
                  <div className="font-bold">Census of India 2011</div>
                  <div className="text-[10px] text-gray-600 mb-1">Primary Census Abstract & Housing Tables</div>
                  <a href="https://censusindia.gov.in" target="_blank" rel="noreferrer" className="underline text-[10px] text-black">
                    https://censusindia.gov.in
                  </a>
                </div>
                <div className="border border-black p-3 bg-white">
                  <div className="font-bold">NITI Aayog National MPI</div>
                  <div className="text-[10px] text-gray-600 mb-1">National Multidimensional Poverty Index (2023 Review)</div>
                  <a href="https://niti.gov.in" target="_blank" rel="noreferrer" className="underline text-[10px] text-black">
                    https://niti.gov.in
                  </a>
                </div>
                <div className="border border-black p-3 bg-white">
                  <div className="font-bold">Reserve Bank of India (DBIE)</div>
                  <div className="text-[10px] text-gray-600 mb-1">Basic Statistical Returns (BSR) Credit & Deposits</div>
                  <a href="https://dbie.rbi.org.in" target="_blank" rel="noreferrer" className="underline text-[10px] text-black">
                    https://dbie.rbi.org.in
                  </a>
                </div>
                <div className="border border-black p-3 bg-white">
                  <div className="font-bold">NFHS-5 Factsheets</div>
                  <div className="text-[10px] text-gray-600 mb-1">Ministry of Health & Family Welfare / IIPS</div>
                  <a href="http://rchiips.org/nfhs" target="_blank" rel="noreferrer" className="underline text-[10px] text-black">
                    http://rchiips.org/nfhs
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
