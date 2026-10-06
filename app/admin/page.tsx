import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) return null; // Caught by middleware anyway

  const counts = await prisma.$transaction([
    prisma.country.count(),
    prisma.indicator.count(),
    prisma.dataPoint.count(),
    prisma.ngo.count(),
    prisma.emergency.count(),
    prisma.case.count(),
  ]);

  return (
    <div className="etw-page">
      <div className="etw-container">
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
          <div>
            <p className="etw-label mb-2">RESTRICTED ACCESS</p>
            <h1 className="text-3xl font-black mb-0">ETW ADMIN DASHBOARD</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Logged in as {session.user.email}</p>
            <p className="font-bold uppercase tracking-wider text-sm">Role: {(session.user as any).role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="border border-black p-6 bg-white">
            <h3 className="etw-label mb-4 text-gray-500">ROVER DATA</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{counts[0]}</p>
                <p className="text-xs text-gray-500 uppercase">Countries</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{counts[1]}</p>
                <p className="text-xs text-gray-500 uppercase">Indicators</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-3xl font-bold">{counts[2].toLocaleString()}</p>
                <p className="text-xs text-gray-500 uppercase">Data Points</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-400">Manage via scripts/ingest-worldbank.ts</span>
            </div>
          </div>

          <div className="border border-black p-6 bg-white">
            <h3 className="etw-label mb-4 text-gray-500">CONTRIBUTOR & EMERGENCY</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{counts[3]}</p>
                <p className="text-xs text-gray-500 uppercase">NGOs</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{counts[4]}</p>
                <p className="text-xs text-gray-500 uppercase">Emergencies</p>
              </div>
            </div>
          </div>

          <div className="border border-black p-6 bg-white">
            <h3 className="etw-label mb-4 text-gray-500">DE BASEMENT</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-3xl font-bold">{counts[5]}</p>
                <p className="text-xs text-gray-500 uppercase">Case Studies</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-dashed border-gray-400 p-8 text-center">
          <h2 className="text-xl font-bold mb-2 uppercase">Administration Tooling</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            CRUD interfaces for Contributor NGOs, Emergencies, and Case Studies will be built in a future phase. For now, use Prisma Studio (`npm run db:studio`) to manage database records.
          </p>
        </div>
      </div>
    </div>
  );
}
