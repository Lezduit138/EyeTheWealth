// ETW — Emergency Dashboard

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SampleDataBanner } from "@/components/ui/Card";

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
    title: `${emergency.title} — ETW EMERGENCY`,
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
    <div className="etw-page">
      {emergency.isSimulation && <SampleDataBanner className="mb-4" message="This is a SIMULATION. Not a real emergency." />}

      {/* Breadcrumb */}
      <div className="etw-container pb-4 border-b border-gray-200 mb-8 text-xs text-gray-500 uppercase tracking-widest">
        <Link href="/contributor" className="text-gray-500 no-underline hover:text-black">CONTRIBUTOR</Link>
        {" → EMERGENCY INTELLIGENCE"}
      </div>

      <div className="etw-container">
        {/* Header */}
        <div className="mb-12 border-4 border-black p-8 bg-white relative overflow-hidden">
          {/* Diagonal stripes pattern for emergency feel */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNMCAyMEwyMCAwSDBWMjB6TTEwIDIwTDIwIDEwVjIwSDEweiIgZmlsbD0iI2VlZSIvPgo8L3N2Zz4=')] opacity-50 z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-black text-white px-3 py-1 font-bold tracking-widest text-sm">ACTIVE ALERT</span>
              {emergency.isSimulation && <span className="etw-badge etw-badge-sample">SIMULATION</span>}
            </div>
            
            <h1 className="text-5xl font-black mb-4 uppercase leading-tight">{emergency.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t-2 border-black mt-6">
              <div>
                <span className="etw-label block text-gray-500 mb-1">AFFECTED REGION</span>
                <span className="font-bold text-lg">{emergency.affectedDistricts}</span>
              </div>
              <div>
                <span className="etw-label block text-gray-500 mb-1">SEVERITY / TYPE</span>
                <span className="font-bold text-lg">{emergency.severity} {emergency.disasterType && `· ${emergency.disasterType}`}</span>
              </div>
              <div>
                <span className="etw-label block text-gray-500 mb-1">REPORTED / SOURCE</span>
                <span className="font-bold block">{new Date(emergency.reportedAt).toLocaleDateString()}</span>
                <a href={emergency.sourceUrl} target="_blank" rel="noreferrer" className="text-sm underline mt-1 block">
                  {emergency.sourceName} ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mb-12">
          <h2 className="etw-section-heading mb-4">SITUATION OVERVIEW</h2>
          <p className="text-lg leading-relaxed">{emergency.description}</p>
        </div>

        {/* Confirmed Responders */}
        <section aria-labelledby="confirmed-responders" className="mb-12">
          <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-2">
            <h2 id="confirmed-responders" className="text-2xl font-black m-0">VERIFIED RESPONDERS</h2>
            <span className="bg-black text-white px-2 py-1 text-sm font-bold">{confirmed.length}</span>
          </div>

          {confirmed.length === 0 ? (
            <div className="border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No verified responders yet. Evidence must be attached by an administrator.
            </div>
          ) : (
            <div className="grid gap-4">
              {confirmed.map(match => (
                <div key={match.id} className="border border-black p-6 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <Link href={`/contributor/ngo/${match.ngo.slug}`} className="text-xl font-bold hover:underline">
                      {match.ngo.name}
                    </Link>
                    <StatusBadge status="VERIFIED" showIcon={false} />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{match.ngo.district}</p>
                  
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <span className="etw-label block mb-2 text-black">VERIFIED EVIDENCE</span>
                    <ul className="list-disc pl-4 text-sm space-y-2">
                      {match.evidenceDocument && (
                        <li>
                          <a href={match.evidenceDocument.url} target="_blank" rel="noreferrer" className="font-bold underline">{match.evidenceDocument.title}</a>
                          <span className="text-gray-500 ml-2">({match.evidenceDocument.documentType})</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Potential Responders */}
        <section aria-labelledby="potential-responders" className="mb-12 opacity-80">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-300 pb-2">
            <h2 id="potential-responders" className="text-xl font-bold m-0 text-gray-600">OPERATING NEARBY (UNVERIFIED)</h2>
            <span className="bg-gray-200 text-gray-600 px-2 py-1 text-sm font-bold">{potential.length}</span>
          </div>

          <div className="etw-analysis-panel mb-6 border-gray-300 bg-gray-50">
            <p className="text-sm m-0">
              <strong>Note:</strong> These NGOs are registered in the affected district and list disaster relief or related fields in their areas of work. ETW does not confirm they are responding until evidence is provided.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {potential.map(match => (
              <Link key={match.id} href={`/contributor/ngo/${match.ngo.slug}`} className="block border border-gray-200 p-4 hover:bg-gray-50 no-underline text-black">
                <div className="font-bold mb-1">{match.ngo.name}</div>
                <div className="text-sm text-gray-500">{match.ngo.district}</div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
