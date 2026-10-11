/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";

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
    <div className="w-96 flex-shrink-0 border-l border-black bg-white flex flex-col z-20 font-sans h-full">
      {/* Header */}
      <div className="p-4 border-b border-black bg-black text-white flex justify-between items-center">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
            Resolution: {placeLevel}
          </div>
          <h2 className="font-bold text-lg leading-tight">{placeName}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 font-mono text-sm px-2 py-1 border border-white"
        >
          ✕
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-black overflow-x-auto text-xs font-mono bg-gray-50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-2 whitespace-nowrap border-r border-black font-medium transition-colors ${
              activeTab === t.id
                ? "bg-white text-black font-bold border-b-2 border-b-black"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto p-4 text-xs font-sans">
        {loading ? (
          <div className="font-mono text-gray-500 py-6 text-center">Loading area data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">
                <div className="border border-black p-3">
                  <div className="font-mono text-[10px] text-gray-500 uppercase mb-1">Status Summary</div>
                  <div className="font-bold text-sm mb-1">
                    {deprivationData?.isFlagged ? (
                      <span className="text-red-700 flex items-center gap-1">
                        <AlertTriangle size={14} /> Deprivation indicators present
                      </span>
                    ) : (
                      <span className="text-black flex items-center gap-1">
                        <ShieldCheck size={14} /> Baseline standards met
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-xs mt-2">{deprivationData?.summaryText}</p>
                </div>

                <div className="border border-black p-3 bg-gray-50">
                  <div className="font-bold mb-2 uppercase text-[11px] font-mono">Hierarchy & Identification</div>
                  <div className="flex flex-col gap-1 font-mono text-[11px]">
                    <div>Level: <span className="font-bold">{placeLevel}</span></div>
                    <div>Parent: <span className="font-bold">{assetsData?.parent?.name || "India"}</span></div>
                    <div>Vintage: <span className="font-bold">2011 / 2021 LGD</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* ASSETS & WEALTH COMPOSITION TAB */}
            {activeTab === "assets" && (
              <div className="flex flex-col gap-3">
                <div className="text-[11px] text-gray-600 italic">
                  Extensible asset categories derived from official public datasets. No arbitrary total wealth score.
                </div>

                {assetsData?.assetComposition?.map((cat: any) => (
                  <div key={cat.categoryId} className="border border-black p-3 bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-xs">{cat.categoryName}</div>
                      <span className="text-[10px] font-mono uppercase px-1 border border-black bg-gray-50">
                        {cat.resolutionLabel}
                      </span>
                    </div>

                    <div className="my-2">
                      {cat.status === "MEASURED" ? (
                        <div className="font-mono text-base font-bold text-black">
                          {cat.value?.toLocaleString()} {cat.unit}
                          {cat.isEstimate && (
                            <span className="ml-2 text-[10px] font-normal text-gray-600">(Estimated)</span>
                          )}
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-gray-500 italic">Not publicly disclosed</div>
                      )}
                    </div>

                    {cat.sourceName && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-600 font-mono">
                        Source:{" "}
                        <a href={cat.sourceUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
                          {cat.sourceName} <ExternalLink size={9} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* POVERTY & DEPRIVATION TAB */}
            {activeTab === "deprivation" && (
              <div className="flex flex-col gap-4">
                <div className="border border-black p-3 bg-white">
                  <div className="font-mono text-[10px] uppercase text-gray-500 mb-1">Rule Engine Verdict</div>
                  <div className="font-bold text-sm mb-2">{deprivationData?.deprivationStatus}</div>
                  <div className="text-gray-700 text-xs mb-3">{deprivationData?.summaryText}</div>

                  <div className="font-mono text-[10px] bg-gray-100 p-2 border border-gray-300">
                    <div className="font-bold mb-1">Configured Rule: {deprivationData?.ruleName}</div>
                    <div>MPI Threshold: {deprivationData?.ruleThresholds?.mpiBaseline}</div>
                    <div>Literacy Threshold: {deprivationData?.ruleThresholds?.literacyBaseline}</div>
                    <div>Sanitation Threshold: {deprivationData?.ruleThresholds?.sanitationBaseline}</div>
                  </div>
                </div>

                <div className="border border-black p-3">
                  <div className="font-bold uppercase text-[11px] font-mono mb-2">Weak Dimensions Detected</div>
                  {deprivationData?.weakDimensions?.length === 0 ? (
                    <div className="text-gray-500 italic">No weak dimensions crossing documented thresholds.</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {deprivationData?.weakDimensions?.map((w: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-l-black pl-2 py-1 bg-gray-50">
                          <div className="font-bold text-xs">{w.dimension}</div>
                          <div className="font-mono text-[11px]">
                            {w.indicator}: <span className="font-bold">{w.value}%</span> (Benchmark: {w.benchmark})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-gray-500 font-mono border-t border-gray-200 pt-2 italic">
                  {deprivationData?.interpretationDisclaimer}
                </div>
              </div>
            )}

            {/* FACTORS TAB */}
            {activeTab === "factors" && (
              <div className="flex flex-col gap-4">
                <div className="font-mono text-[11px] uppercase font-bold">Factors That May Contribute</div>
                {factorsData?.factorsThatMayContribute?.length === 0 ? (
                  <div className="text-gray-500 italic">No negative structural factor associations detected.</div>
                ) : (
                  factorsData?.factorsThatMayContribute?.map((f: any, idx: number) => (
                    <div key={idx} className="border border-black p-3 bg-white">
                      <div className="font-bold text-xs mb-1">{f.factorName}</div>
                      <div className="font-mono text-[10px] text-gray-500 mb-2">
                        Observed {f.indicator}: {f.observedValue}
                      </div>
                      <p className="text-gray-800 text-xs leading-relaxed mb-3">{f.hedgedExplanation}</p>

                      <div className="border-t border-gray-200 pt-2">
                        <div className="font-mono text-[10px] uppercase font-bold text-gray-600 mb-1">Published Citations:</div>
                        {f.citations?.map((c: any, cIdx: number) => (
                          <div key={cIdx} className="text-[10px] text-gray-700 font-mono mb-1">
                            • <a href={c.url} target="_blank" rel="noreferrer" className="underline">{c.title}</a> ({c.source}, {c.year})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                <div className="border border-black p-3 bg-gray-50">
                  <div className="font-bold uppercase text-[10px] font-mono mb-1">What This Does Not Capture</div>
                  <ul className="list-disc pl-4 text-[11px] text-gray-600 flex flex-col gap-1">
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
                  <div className="border border-black p-4 text-center font-mono">
                    <div className="font-bold mb-1">Regional Scope Notice</div>
                    <div className="text-gray-600">{ngosData?.regionNotice}</div>
                  </div>
                ) : ngosData?.ngos?.length === 0 ? (
                  <div className="border border-black p-4 text-center font-mono text-gray-600">
                    No NGOs on record for this area yet.
                    <div className="mt-2">
                      <Link href="/contributor" className="underline text-black font-bold">
                        Browse Contributor Directory
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-50 border border-black p-2 font-mono text-[10px] text-gray-800">
                      {ngosData?.disclaimer}
                    </div>

                    {ngosData?.ngos?.map((ngo: any) => (
                      <div key={ngo.id} className="border border-black p-3 bg-white">
                        <div className="font-bold text-xs mb-1">{ngo.name}</div>
                        <div className="text-[10px] font-mono text-gray-600 mb-2">
                          District: {ngo.district || "Maharashtra"} · {ngo.categories?.join(", ")}
                        </div>
                        <div className="text-xs text-gray-700 mb-2">{ngo.matchRationale}</div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="font-mono text-[10px] px-1 border border-black bg-gray-100">
                            {ngo.financialTransparency === "PUBLIC_FILINGS_AVAILABLE"
                              ? "Audited Filings Public"
                              : "Not publicly disclosed"}
                          </span>
                          <Link
                            href={ngo.profileUrl}
                            className="font-mono text-[11px] font-bold underline text-black hover:text-gray-600"
                          >
                            View NGO Profile →
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
                <div className="bg-gray-100 border border-black p-2 font-mono text-[10px] text-gray-800 leading-tight">
                  {individualsData?.notice}
                </div>

                {individualsData?.publicFigures?.length === 0 ? (
                  <div className="border border-black p-4 text-center font-mono text-gray-500">
                    No verified profile yet for this locality.
                  </div>
                ) : (
                  individualsData?.publicFigures?.map((person: any) => (
                    <div key={person.id} className="border border-black p-3 bg-white">
                      <div className="font-bold text-xs mb-1">{person.name}</div>
                      <div className="text-[10px] font-mono text-gray-600 mb-2">
                        Public Figure ({person.nationality || "India"}) · Born {person.birthYear || "N/A"}
                      </div>
                      <p className="text-xs text-gray-800 mb-2">{person.description}</p>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-[10px] font-mono">
                        <a
                          href={person.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline flex items-center gap-1 text-black"
                        >
                          Official Affidavit Filing <ExternalLink size={9} />
                        </a>
                        <Link href="/rover/correction" className="text-gray-500 underline">
                          Request Correction
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
                <div className="font-bold uppercase text-[11px]">Primary Public Datasets</div>
                <div className="border border-black p-2">
                  <div className="font-bold">Census of India 2011</div>
                  <div className="text-[10px] text-gray-600">Primary Census Abstract & Housing Tables</div>
                  <a href="https://censusindia.gov.in" target="_blank" rel="noreferrer" className="underline text-[10px]">
                    https://censusindia.gov.in
                  </a>
                </div>
                <div className="border border-black p-2">
                  <div className="font-bold">NITI Aayog National MPI</div>
                  <div className="text-[10px] text-gray-600">National Multidimensional Poverty Index (2023 Review)</div>
                  <a href="https://niti.gov.in" target="_blank" rel="noreferrer" className="underline text-[10px]">
                    https://niti.gov.in
                  </a>
                </div>
                <div className="border border-black p-2">
                  <div className="font-bold">Reserve Bank of India (DBIE)</div>
                  <div className="text-[10px] text-gray-600">Basic Statistical Returns (BSR) Credit & Deposits</div>
                  <a href="https://dbie.rbi.org.in" target="_blank" rel="noreferrer" className="underline text-[10px]">
                    https://dbie.rbi.org.in
                  </a>
                </div>
                <div className="border border-black p-2">
                  <div className="font-bold">NFHS-5 Factsheets</div>
                  <div className="text-[10px] text-gray-600">Ministry of Health & Family Welfare / IIPS</div>
                  <a href="http://rchiips.org/nfhs" target="_blank" rel="noreferrer" className="underline text-[10px]">
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
