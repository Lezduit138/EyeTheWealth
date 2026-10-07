/* eslint-disable */
// ETW â€” Contributor Module Landing Page (NGO Directory)

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SampleDataBanner } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "CONTRIBUTOR â€” Maharashtra NGO Directory",
  description: "Explore NGOs, funding sources, financial records, and disaster response across Maharashtra.",
};

const DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur",
  "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City",
  "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani",
  "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
  "Washim", "Yavatmal"
];

const CATEGORIES = [
  "Health", "Education", "Poverty", "Women", "Children",
  "Disaster relief", "Food", "Environment", "Disability", "Rural development"
];

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ContributorPage({ searchParams }: Props) {
  const { district, category, q } = await searchParams;

  // Active Emergency Check
  const activeEmergency = await prisma.emergency.findFirst({
    where: { isActive: true },
    orderBy: { reportedAt: "desc" },
    include: {
      ngoMatches: {
        include: { ngo: true }
      }
    }
  });

  // Build filter for directory
  const where: any = { isActive: true };
  if (district) where.district = district;
  if (category) where.categories = { contains: category };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { areasOfWork: { contains: q } },
      { registrationNumber: { contains: q } },
    ];
  }

  const ngos = await prisma.ngo.findMany({
    where,
    orderBy: { name: "asc" },
  });

  // Check if we have sample data to show banner
  const hasSampleData = ngos.some(n => n.isSampleData);

  return (
    <div className="etw-page">
      {hasSampleData && <SampleDataBanner className="mb-4" />}

      {/* Emergency Banner */}
      {activeEmergency && (
        <div className="etw-container mb-8">
          <div className="etw-emergency-banner">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-xl tracking-wider">ðŸš¨ ACTIVE EMERGENCY</span>
                  {activeEmergency.isSimulation && (
                    <span className="etw-badge etw-badge-sample" style={{ borderColor: "#fff", color: "#fff" }}>SIMULATION</span>
                  )}
                </div>
                <h2 className="text-2xl mb-1">{activeEmergency.title}</h2>
                <div className="text-sm text-gray-300 flex items-center gap-2">
                  <span>Reported: {new Date(activeEmergency.reportedAt).toLocaleDateString()}</span>
                  <span>Â·</span>
                  <span>Source: {activeEmergency.sourceName}</span>
                </div>
              </div>
              <Link
                href={`/contributor/emergency/${activeEmergency.id}`}
                className="etw-btn"
                style={{ borderColor: "#fff", color: "#fff" }}
              >
                VIEW EMERGENCY & RESPONSE â†’
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="etw-container pb-8 border-b-2 border-black mb-10">
        <p className="etw-label mb-2">MODULE 2</p>
        <h1 className="text-5xl font-black tracking-tight mb-2">CONTRIBUTOR</h1>
        <p className="text-lg text-gray-600">Maharashtra NGO Directory & Financial Traceability</p>
      </div>

      <div className="etw-container flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <form className="mb-8">
            <div className="mb-6">
              <label htmlFor="q" className="etw-label block mb-2">SEARCH</label>
              <input
                type="search"
                id="q"
                name="q"
                defaultValue={q}
                className="etw-input"
                placeholder="NGO name or area of work..."
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="district" className="etw-label block mb-2">DISTRICT</label>
              <select id="district" name="district" defaultValue={district || ""} className="etw-input py-2 px-3">
                <option value="">All Districts</option>
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="category" className="etw-label block mb-2">CATEGORY</label>
              <select id="category" name="category" defaultValue={category || ""} className="etw-input py-2 px-3">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="etw-btn etw-btn-filled w-full justify-center">
              APPLY FILTERS
            </button>
            
            {(q || district || category) && (
              <div className="mt-3 text-center">
                <Link href="/contributor" className="text-sm underline text-gray-500">
                  Clear filters
                </Link>
              </div>
            )}
          </form>

          <div className="p-4 bg-gray-50 border border-gray-200">
            <p className="etw-label mb-2 text-gray-500">ABOUT THIS DIRECTORY</p>
            <p className="text-sm text-gray-600">
              Only publicly registered entities are listed. Financial records are sourced from official filings (FCRA, MCA) or public annual reports.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Directory Results</h2>
            <span className="etw-label text-gray-500">{ngos.length} organisations found</span>
          </div>

          {ngos.length === 0 ? (
            <div className="border border-dashed border-gray-300 p-10 text-center">
              <p className="text-gray-500">No NGOs found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {ngos.map(ngo => (
                <Link
                  key={ngo.id}
                  href={`/contributor/ngo/${ngo.slug}`}
                  className="etw-card block hover:bg-gray-50 transition-colors no-underline text-black group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold group-hover:underline">{ngo.name}</h3>
                    {ngo.isSampleData && <StatusBadge status="SAMPLE" showIcon={false} />}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="etw-label block text-gray-500 mb-1">DISTRICT</span>
                      {ngo.district || "Not disclosed"}
                    </div>
                    <div>
                      <span className="etw-label block text-gray-500 mb-1">REG. NUMBER</span>
                      {ngo.registrationNumber || "Not disclosed"}
                    </div>
                    <div className="col-span-2">
                      <span className="etw-label block text-gray-500 mb-1">CATEGORIES</span>
                      {ngo.categories ? JSON.parse(ngo.categories).join(", ") : "Not disclosed"}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span>Areas: {ngo.areasOfWork ? JSON.parse(ngo.areasOfWork).join(" Â· ") : "Not disclosed"}</span>
                    <span className="font-bold text-xs uppercase tracking-wider">VIEW PROFILE â†’</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

