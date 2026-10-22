/* eslint-disable */
// ETW — Contributor Module Landing Page (NGO Directory)
// Strict 100% Black & White Aesthetic (WCAG AA compliant)

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";

export const metadata: Metadata = {
  title: "CONTRIBUTOR — Maharashtra NGO Directory & Traceability",
  description: "Official public records, fund flows, and disaster response intelligence across Maharashtra.",
};

const CANONICAL_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhajinagar", "Beed", "Bhandara",
  "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon",
  "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
  "Nandurbar", "Nashik", "Dharashiv", "Palghar", "Parbhani", "Pune", "Raigad",
  "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
  "Washim", "Yavatmal"
];

const CATEGORIES = [
  "Health", "Education", "Poverty Alleviation", "Women Empowerment",
  "Child Welfare", "Disaster Relief", "Food & Nutrition", "Environment",
  "Disability", "Rural Development", "Animal Welfare", "Religious & Spiritual"
];

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ContributorPage({ searchParams }: Props) {
  const params = await searchParams;
  const district = params.district || "";
  const category = params.category || "";
  const q = (params.q || "").trim();
  const fcra = params.fcra === "true";
  const tax80g = params.tax80g === "true";
  const layer4 = params.layer4 === "true";
  const layer2_3 = params.layer2_3 === "true";
  const view = params.view === "table" ? "table" : "cards";

  // Active Emergency Check
  const activeEmergency = await prisma.emergency.findFirst({
    where: { isActive: true },
    orderBy: { reportedAt: "desc" },
    include: {
      ngoMatches: {
        include: { ngo: true },
        orderBy: [
          { status: "asc" }, // CONFIRMED_RESPONDING before OPERATING_NEARBY
        ]
      }
    }
  });

  // Query database for NGOs
  const where: any = { isActive: true };
  if (district) {
    where.district = district;
  }
  if (category) {
    where.categories = { contains: category };
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { registrationNumber: { contains: q } },
      { darpanId: { contains: q } },
      { areasOfWork: { contains: q } },
    ];
  }
  if (fcra) {
    where.fcraStatus = "VERIFIED";
  }
  if (tax80g) {
    where.tax80gStatus = "VERIFIED";
  }
  if (layer4) {
    where.transactions = { some: {} };
  }

  const rawNgos = await prisma.ngo.findMany({
    where,
    include: {
      financialYears: true,
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: { name: "asc" }
  });

  // Calculate highest data layer per NGO
  const ngos = rawNgos.map(ngo => {
    let highestLayer = 1;
    const txCount = ngo._count?.transactions || 0;
    const hasLayer3 = ngo.financialYears?.some((fy: any) =>
      fy.programExpenses != null || fy.administrativeExpenses != null ||
      fy.foreignContribution != null || fy.governmentGrants != null || fy.donations != null
    );
    const hasLayer2 = ngo.financialYears?.some((fy: any) =>
      fy.totalIncome != null || fy.totalExpenditure != null
    );

    if (txCount > 0) {
      highestLayer = 4;
    } else if (hasLayer3) {
      highestLayer = 3;
    } else if (hasLayer2) {
      highestLayer = 2;
    }

    return {
      ...ngo,
      highestLayer,
      txCount
    };
  }).filter(ngo => {
    if (layer2_3 && ngo.highestLayer < 2) return false;
    return true;
  });

  // Prepare query helper for URL preservation
  const makeFilterUrl = (overrides: Record<string, string | null>) => {
    const current: Record<string, string> = {};
    if (district) current.district = district;
    if (category) current.category = category;
    if (q) current.q = q;
    if (fcra) current.fcra = "true";
    if (tax80g) current.tax80g = "true";
    if (layer4) current.layer4 = "true";
    if (layer2_3) current.layer2_3 = "true";
    if (view !== "cards") current.view = view;

    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === "") {
        delete current[k];
      } else {
        current[k] = v;
      }
    }
    const qs = new URLSearchParams(current).toString();
    return `/contributor${qs ? `?${qs}` : ""}`;
  };

  const hasActiveFilters = Boolean(district || category || q || fcra || tax80g || layer4 || layer2_3);

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-16">
      {/* 1. ACTIVE EMERGENCY BANNER (Strict Black Block, White Text) */}
      {activeEmergency && (
        <div className="w-full bg-black text-white p-6 border-b-4 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-mono text-gray-300">
                  CRITICAL DISASTER RESPONSE NOTICE
                </p>
                <h2 className="text-2xl font-black tracking-tight mt-1">
                  ACTIVE EMERGENCY / {activeEmergency.disasterType || "DISASTER"} — {activeEmergency.affectedDistricts}
                </h2>
                <div className="text-sm text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono">
                  <span>Reported: {new Date(activeEmergency.reportedAt).toLocaleDateString("en-IN")}</span>
                  <span>|</span>
                  <span>Source: {activeEmergency.sourceName}</span>
                  {activeEmergency.isSimulation && (
                    <>
                      <span>|</span>
                      <span className="border border-white px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                        SIMULATION DRILL
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Link
                href={`/contributor/emergency/${activeEmergency.id}`}
                className="inline-block bg-white text-black px-5 py-3 font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors shrink-0 text-center"
              >
                VIEW EMERGENCY &amp; RESPONSE &rarr;
              </Link>
            </div>

            {/* Quick Links to Responding NGOs */}
            <div className="pt-3 border-t border-gray-700">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-2">
                Responding NGOs on record ({activeEmergency.ngoMatches.length}):
              </span>
              {activeEmergency.ngoMatches.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No responding NGOs matched yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeEmergency.ngoMatches.map(m => (
                    <Link
                      key={m.id}
                      href={`/contributor/ngo/${m.ngo.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111] hover:bg-[#222] border border-gray-600 text-white text-xs font-medium transition-colors"
                    >
                      <span className="font-bold">{m.ngo.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        [{m.status === "CONFIRMED_RESPONDING" ? "CONFIRMED" : "NEARBY"}]
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. HEADER */}
      <div className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-xs font-mono uppercase tracking-widest text-gray-600 mb-1">
            ETW PUBLIC RECORD / MODULE 2
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
                CONTRIBUTOR
              </h1>
              <p className="text-base text-gray-700 mt-2 max-w-2xl">
                Maharashtra NGO Directory &amp; Financial Traceability. Verified public disclosures, 4-layer audit records, and emergency mobilization.
              </p>
            </div>

            {/* View Switcher */}
            <div className="inline-flex border-2 border-black shrink-0">
              <Link
                href={makeFilterUrl({ view: "cards" })}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  view === "cards" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                Cards View
              </Link>
              <Link
                href={makeFilterUrl({ view: "table" })}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-l-2 border-black ${
                  view === "table" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                Table View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: SIDEBAR + RESULTS */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FILTERS */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="border-2 border-black p-5 bg-[#fafafa]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-5">
                <h2 className="text-sm font-black uppercase tracking-wider">FILTERS</h2>
                {hasActiveFilters && (
                  <Link
                    href="/contributor"
                    className="text-xs font-bold underline hover:text-gray-600"
                  >
                    Reset all
                  </Link>
                )}
              </div>

              <form method="GET" action="/contributor" className="space-y-5">
                {/* Keep view state */}
                <input type="hidden" name="view" value={view} />

                {/* Search */}
                <div>
                  <label htmlFor="q" className="block text-xs font-mono uppercase tracking-wider font-bold mb-1.5">
                    Search
                  </label>
                  <input
                    type="search"
                    id="q"
                    name="q"
                    defaultValue={q}
                    placeholder="Name, Reg No, Darpan ID..."
                    className="w-full px-3 py-2 text-sm border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* District Dropdown */}
                <div>
                  <label htmlFor="district" className="block text-xs font-mono uppercase tracking-wider font-bold mb-1.5">
                    District ({CANONICAL_DISTRICTS.length})
                  </label>
                  <select
                    id="district"
                    name="district"
                    defaultValue={district}
                    className="w-full px-3 py-2 text-sm border-2 border-black bg-white focus:outline-none"
                  >
                    <option value="">All Maharashtra Districts</option>
                    {CANONICAL_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label htmlFor="category" className="block text-xs font-mono uppercase tracking-wider font-bold mb-1.5">
                    Category ({CATEGORIES.length})
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={category}
                    className="w-full px-3 py-2 text-sm border-2 border-black bg-white focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Toggles */}
                <div className="pt-3 border-t border-gray-300 space-y-3">
                  <span className="block text-xs font-mono uppercase tracking-wider text-gray-500 font-bold">
                    Compliance &amp; Data Layers
                  </span>

                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      name="fcra"
                      value="true"
                      defaultChecked={fcra}
                      className="w-4 h-4 rounded-none border-2 border-black accent-black"
                    />
                    <span>FCRA Valid Only</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      name="tax80g"
                      value="true"
                      defaultChecked={tax80g}
                      className="w-4 h-4 rounded-none border-2 border-black accent-black"
                    />
                    <span>80G Valid Only</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      name="layer4"
                      value="true"
                      defaultChecked={layer4}
                      className="w-4 h-4 rounded-none border-2 border-black accent-black"
                    />
                    <span>Has Layer 4 (Transactions)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      name="layer2_3"
                      value="true"
                      defaultChecked={layer2_3}
                      className="w-4 h-4 rounded-none border-2 border-black accent-black"
                    />
                    <span>Layer 2/3 (Financials Filed)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Apply Filters
                </button>
              </form>
            </div>

            {/* Public Disclosure Notice */}
            <div className="mt-6 p-4 border border-gray-300 bg-white text-xs text-gray-700 leading-relaxed font-mono">
              <p className="font-bold uppercase tracking-wider mb-1 text-black">REGULATORY AUDIT NOTE</p>
              All NGO records reflect official filings submitted to NITI Aayog NGO Darpan, Ministry of Corporate Affairs, or Charity Commissioner. ETW hosts zero fictional or sample entities.
            </div>
          </aside>

          {/* RESULTS AREA */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black mb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black uppercase">Directory Results</span>
                <span className="text-xs font-mono bg-black text-white px-2 py-0.5">
                  {ngos.length} {ngos.length === 1 ? "ORG" : "ORGS"}
                </span>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-gray-500 font-mono">Active:</span>
                  {district && (
                    <span className="border border-black px-2 py-0.5 font-mono">District: {district}</span>
                  )}
                  {category && (
                    <span className="border border-black px-2 py-0.5 font-mono">Cat: {category}</span>
                  )}
                  {q && (
                    <span className="border border-black px-2 py-0.5 font-mono">&ldquo;{q}&rdquo;</span>
                  )}
                  {fcra && <span className="border border-black px-2 py-0.5 font-mono">FCRA</span>}
                  {tax80g && <span className="border border-black px-2 py-0.5 font-mono">80G</span>}
                  {layer4 && <span className="border border-black px-2 py-0.5 font-mono">Layer 4</span>}
                  {layer2_3 && <span className="border border-black px-2 py-0.5 font-mono">Layer 2/3</span>}
                </div>
              )}
            </div>

            {/* EMPTY STATE */}
            {ngos.length === 0 ? (
              <div className="border-2 border-dashed border-black p-12 text-center bg-[#fafafa]">
                <p className="text-base font-bold mb-2">No NGOs on record for this selection.</p>
                <p className="text-sm text-gray-600 mb-6 font-mono">
                  Try broadening your search term or clearing active compliance toggles.
                </p>
                <Link
                  href="/contributor"
                  className="inline-block px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
                >
                  Reset filters
                </Link>
              </div>
            ) : view === "table" ? (
              /* TABLE VIEW */
              <div className="overflow-x-auto border-2 border-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-black text-white font-mono uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 border-r border-gray-700">Name</th>
                      <th className="p-3 border-r border-gray-700">Darpan ID</th>
                      <th className="p-3 border-r border-gray-700">Reg No</th>
                      <th className="p-3 border-r border-gray-700">District</th>
                      <th className="p-3 border-r border-gray-700 text-center">80G</th>
                      <th className="p-3 border-r border-gray-700 text-center">FCRA</th>
                      <th className="p-3 border-r border-gray-700 text-center">Highest Layer</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 bg-white">
                    {ngos.map(ngo => (
                      <tr key={ngo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-bold border-r border-gray-200">
                          <Link href={`/contributor/ngo/${ngo.slug}`} className="hover:underline">
                            {ngo.name}
                          </Link>
                        </td>
                        <td className="p-3 font-mono border-r border-gray-200 text-gray-700">
                          {ngo.darpanId || <span className="text-gray-400">Not disclosed</span>}
                        </td>
                        <td className="p-3 font-mono border-r border-gray-200 text-gray-700">
                          {ngo.registrationNumber || <span className="text-gray-400">Not disclosed</span>}
                        </td>
                        <td className="p-3 border-r border-gray-200">
                          {ngo.district || <span className="text-gray-400">Not disclosed</span>}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-center font-mono">
                          {ngo.tax80gStatus === "VERIFIED" ? (
                            <span className="inline-block px-1.5 py-0.5 bg-black text-white text-[10px] font-bold">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 border border-dashed border-gray-500 text-gray-600 text-[10px]">
                              {ngo.tax80gStatus || "NONE"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-center font-mono">
                          {ngo.fcraStatus === "VERIFIED" ? (
                            <span className="inline-block px-1.5 py-0.5 bg-black text-white text-[10px] font-bold">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 border border-dashed border-gray-500 text-gray-600 text-[10px]">
                              {ngo.fcraStatus || "NONE"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-center font-mono">
                          <span className="font-bold">Layer {ngo.highestLayer}</span>
                          <span className="text-[10px] text-gray-500 block">
                            {ngo.highestLayer === 4 ? `${ngo.txCount} tx` : ngo.highestLayer >= 2 ? "Filed" : "Basic"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/contributor/ngo/${ngo.slug}`}
                            className="inline-block px-2.5 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-gray-800"
                          >
                            View &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARDS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ngos.map(ngo => {
                  let parsedCats: string[] = [];
                  try {
                    parsedCats = ngo.categories ? JSON.parse(ngo.categories) : [];
                  } catch {
                    parsedCats = [];
                  }

                  return (
                    <div
                      key={ngo.id}
                      className="border-2 border-black p-5 bg-white flex flex-col justify-between hover:shadow-[4px_4px_0px_0px_#000] transition-shadow"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[11px]">
                          <span className="font-bold border border-black px-2 py-0.5 bg-gray-100">
                            Layer {ngo.highestLayer} Data
                          </span>
                          <div className="flex gap-1.5">
                            {ngo.tax80gStatus === "VERIFIED" && (
                              <span className="bg-black text-white px-1.5 py-0.5 font-bold">80G</span>
                            )}
                            {ngo.fcraStatus === "VERIFIED" && (
                              <span className="bg-black text-white px-1.5 py-0.5 font-bold">FCRA</span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black tracking-tight leading-snug mb-3">
                          <Link href={`/contributor/ngo/${ngo.slug}`} className="hover:underline">
                            {ngo.name}
                          </Link>
                        </h3>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-700 pt-3 border-t border-gray-200 mb-3">
                          <div>
                            <span className="block text-[10px] text-gray-500 uppercase">District</span>
                            <span className="font-bold text-black">{ngo.district || "Not disclosed"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-500 uppercase">Darpan ID</span>
                            <span className="font-bold text-black">{ngo.darpanId || "Not disclosed"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-[10px] text-gray-500 uppercase">Reg Number</span>
                            <span>{ngo.registrationNumber || "Not disclosed"}</span>
                          </div>
                        </div>

                        {/* Categories */}
                        {parsedCats.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {parsedCats.slice(0, 3).map(cat => (
                              <span key={cat} className="text-[10px] font-mono border border-gray-400 px-1.5 py-0.5">
                                {cat}
                              </span>
                            ))}
                            {parsedCats.length > 3 && (
                              <span className="text-[10px] font-mono text-gray-500 px-1 py-0.5">
                                +{parsedCats.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Action */}
                      <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-600">
                          {ngo.txCount > 0 ? `${ngo.txCount} verified tx` : "Public registry"}
                        </span>
                        <Link
                          href={`/contributor/ngo/${ngo.slug}`}
                          className="px-3 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                        >
                          View Profile &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
