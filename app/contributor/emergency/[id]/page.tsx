// ETW — Emergency Dashboard
// Strict 100% Black & White Aesthetic (WCAG AA compliant)

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

async function getEmergency(id: string) {
  return prisma.emergency.findUnique({
    where: { id },
    include: {
      ngoMatches: {
        include: {
          ngo: true,
          evidenceDocument: true,
        },
        orderBy: [{ status: "asc" }, { ngo: { name: "asc" } }],
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const emergency = await getEmergency(id);
  if (!emergency) return { title: "Emergency Not Found" };
  return {
    title: `${emergency.title} — ETW EMERGENCY INTELLIGENCE`,
    description: emergency.description,
  };
}

export default async function EmergencyDashboard({ params }: Props) {
  const { id } = await params;
  const emergency = await getEmergency(id);
  if (!emergency) notFound();

  const confirmed = emergency.ngoMatches.filter(m => m.status === "CONFIRMED_RESPONDING");
  const potential = emergency.ngoMatches.filter(m => m.status === "OPERATING_NEARBY");

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-16">
      {/* Simulation Banner if applicable */}
      {emergency.isSimulation && (
        <div className="bg-black text-white px-6 py-2 border-b border-gray-700 text-center font-mono text-xs uppercase tracking-widest font-bold">
          [SIMULATION DRILL] This record is a preparedness simulation exercise.
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-300 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs font-mono uppercase tracking-widest text-gray-600 flex items-center gap-2">
          <Link href="/contributor" className="hover:text-black underline">CONTRIBUTOR</Link>
          <span>/</span>
          <span>EMERGENCY INTELLIGENCE</span>
          <span>/</span>
          <span className="text-black font-bold">{emergency.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Emergency Header Box */}
        <div className="border-4 border-black p-8 bg-white mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4 font-mono text-xs">
            <span className="bg-black text-white px-3 py-1 font-bold tracking-widest uppercase">
              ACTIVE ALERT
            </span>
            <span className="border border-black px-2.5 py-1 font-bold">
              SEVERITY: {emergency.severity || "STANDARD"}
            </span>
            {emergency.disasterType && (
              <span className="border border-black px-2.5 py-1">
                TYPE: {emergency.disasterType}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tight leading-tight">
            {emergency.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t-2 border-black text-xs font-mono">
            <div>
              <span className="text-gray-500 uppercase block mb-1">AFFECTED REGION</span>
              <span className="text-sm font-bold text-black">{emergency.affectedDistricts}</span>
            </div>
            <div>
              <span className="text-gray-500 uppercase block mb-1">REPORTED AT</span>
              <span className="text-sm font-bold text-black">
                {new Date(emergency.reportedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 uppercase block mb-1">DATA SOURCE</span>
              <a
                href={emergency.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-black underline inline-flex items-center gap-1"
              >
                {emergency.sourceName} &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Situation Overview */}
        <section className="mb-12">
          <h2 className="text-sm font-black font-mono uppercase tracking-widest border-b-2 border-black pb-2 mb-4">
            SITUATION OVERVIEW
          </h2>
          <p className="text-base text-gray-800 leading-relaxed font-sans">
            {emergency.description}
          </p>
        </section>

        {/* Confirmed Responders */}
        <section aria-labelledby="confirmed-responders" className="mb-12">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
            <h2 id="confirmed-responders" className="text-lg font-black uppercase tracking-tight">
              TIER 1: CONFIRMED RESPONDING NGOS
            </h2>
            <span className="bg-black text-white px-2 py-0.5 text-xs font-mono font-bold">
              {confirmed.length} VERIFIED
            </span>
          </div>

          {confirmed.length === 0 ? (
            <div className="border border-dashed border-gray-400 p-8 text-center text-xs font-mono text-gray-600 bg-[#fafafa]">
              No field deployment evidence has been submitted or verified for this emergency yet.
            </div>
          ) : (
            <div className="space-y-4">
              {confirmed.map(match => (
                <div key={match.id} className="border-2 border-black p-6 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <Link
                      href={`/contributor/ngo/${match.ngo.slug}`}
                      className="text-xl font-black hover:underline"
                    >
                      {match.ngo.name}
                    </Link>
                    <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-wider self-start sm:self-auto">
                      [CONFIRMED RESPONDING]
                    </span>
                  </div>

                  <p className="text-xs font-mono text-gray-600 mb-4">
                    Registered District: {match.ngo.district || "Not disclosed"} | Darpan ID: {match.ngo.darpanId || "N/A"}
                  </p>

                  {match.evidenceDocument && (
                    <div className="p-3 bg-[#fafafa] border border-gray-300 text-xs font-mono">
                      <span className="font-bold text-black uppercase block mb-1">
                        VERIFIED DEPLOYMENT EVIDENCE:
                      </span>
                      <a
                        href={match.evidenceDocument.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold text-black hover:text-gray-700"
                      >
                        {match.evidenceDocument.title} &rarr;
                      </a>
                      <span className="text-gray-500 ml-2">
                        ({match.evidenceDocument.documentType} &middot; verified by ETW Admin)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Operating Nearby (Unconfirmed) */}
        <section aria-labelledby="nearby-responders" className="mb-12">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h2 id="nearby-responders" className="text-base font-black uppercase tracking-tight text-gray-800">
              TIER 2: NGOS OPERATING IN AFFECTED OR ADJACENT DISTRICTS
            </h2>
            <span className="border border-black px-2 py-0.5 text-xs font-mono font-bold">
              {potential.length} NEARBY
            </span>
          </div>

          <div className="p-4 border border-gray-300 bg-[#fafafa] text-xs font-mono text-gray-700 mb-6 leading-relaxed">
            <strong>NOTICE ON TIER 2 MATCHES:</strong> These NGOs maintain registered operations in the affected or adjacent districts and list disaster relief or humanitarian aid in their charter. ETW has not yet received field deployment evidence for this specific event.
          </div>

          {potential.length === 0 ? (
            <div className="border border-dashed border-gray-400 p-6 text-center text-xs font-mono text-gray-600">
              No registered NGOs in our directory operate in these districts with disaster capabilities.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {potential.map(match => (
                <Link
                  key={match.id}
                  href={`/contributor/ngo/${match.ngo.slug}`}
                  className="border border-black p-4 bg-white hover:bg-gray-50 transition-colors block text-black"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-sm leading-snug">{match.ngo.name}</span>
                    <span className="text-[10px] font-mono border border-gray-500 px-1.5 py-0.5 text-gray-600 shrink-0">
                      OPERATING NEARBY
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gray-600">
                    District: {match.ngo.district || "Not disclosed"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
