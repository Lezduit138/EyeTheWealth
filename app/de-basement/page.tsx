/* eslint-disable */
// ETW â€” De Basement Module Landing Page

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = {
  title: "DE BASEMENT â€” Financial Structures",
  description: "Examine legal financial structures, regulatory gaps, and transparency challenges. Educational use only.",
};

export default async function DeBasementPage() {
  const cases = await prisma.case.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="etw-page bg-black text-white min-h-screen">
      <div className="etw-container py-12">
        <div className="border-b-2 border-white pb-8 mb-12">
          <p className="etw-label text-gray-400 mb-2">MODULE 3</p>
          <h1 className="text-5xl font-black tracking-tight mb-4 uppercase">DE BASEMENT</h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Legal financial structures, regulatory gaps, and why tracing money through legitimate structures is structurally difficult.
          </p>
        </div>

        <div className="border border-dashed border-gray-500 p-6 mb-12 bg-[#111]">
          <p className="font-bold text-red-500 mb-2 uppercase tracking-wider text-sm">Educational Purpose Only</p>
          <p className="text-sm text-gray-400 leading-relaxed mb-0">
            This module explains how structures operate to obscure ownership or origin. It does not provide operational guidance on how to exploit any structure, nor does it contain optimization advice. Cases labelled &ldquo;ILLUSTRATIVE&rdquo; use entirely fictional entity names.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 tracking-wide uppercase border-b border-gray-800 pb-2">CASE STUDIES &amp; STRUCTURES</h2>

        {cases.length === 0 && (
          <p className="text-gray-500 italic">No published case studies yet. Cases are added by administrators after manual verification.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => {
            const tags: string[] = c.whatIsKnown ? JSON.parse(c.whatIsKnown) : [];
            return (
              <Link
                key={c.id}
                href={`/de-basement/${c.slug}`}
                className="block border border-gray-700 bg-[#0a0a0a] hover:bg-[#1a1a1a] transition-colors p-6 group no-underline text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2">
                  <StatusBadge status={c.isSampleData ? "SAMPLE" : "VERIFIED"} showIcon={false} />
                </div>
                <h3 className="text-xl font-bold mb-3 mt-4 group-hover:underline pr-20">{c.title}</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  {c.subtitle ?? c.legalMechanism ?? ""}
                </p>

                {c.legalMechanism && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-xs border border-gray-600 px-2 py-1 text-gray-400 uppercase">
                      {c.legalMechanism}
                    </span>
                    <span className="text-xs border border-gray-600 px-2 py-1 text-gray-400 uppercase">
                      {c.status}
                    </span>
                  </div>
                )}

                <div className="mt-auto border-t border-gray-800 pt-4 flex justify-between items-center text-xs tracking-widest font-bold uppercase text-gray-500 group-hover:text-white transition-colors">
                  <span>OPEN FILE</span>
                  <span>â†’</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

