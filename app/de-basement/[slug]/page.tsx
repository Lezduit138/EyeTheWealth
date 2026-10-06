// ETW — De Basement Case Study Page

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCase(slug: string) {
  return prisma.case.findUnique({
    where: { slug },
    include: {
      evidenceChain: {
        orderBy: { displayOrder: "asc" },
      },
      entityRelationships: {
        include: {
          fromEntity: true,
          toEntity: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCase(slug);
  if (!c) return { title: "Case Not Found" };
  return {
    title: `${c.title} — DE BASEMENT`,
    description: c.subtitle ?? c.legalMechanism ?? c.title,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const c = await getCase(slug);
  if (!c || !c.publishedAt) notFound();

  const isIllustrative = c.status === "ILLUSTRATIVE";
  const whatIsKnown: string[] = c.whatIsKnown ? JSON.parse(c.whatIsKnown) : [];
  const whatCannotBeEstablished: string[] = c.whatCannotBeEstablished
    ? JSON.parse(c.whatCannotBeEstablished)
    : [];

  return (
    <div className="etw-page bg-black text-white min-h-screen">
      <div className="etw-container py-12">
        {/* Breadcrumb */}
        <div className="pb-4 border-b border-gray-800 mb-8 text-xs text-gray-500 uppercase tracking-widest">
          <Link href="/de-basement" className="text-gray-500 no-underline hover:text-white">
            DE BASEMENT
          </Link>
          {" → "}
          <span className="text-white font-bold">{c.title}</span>
        </div>

        <div className="mb-12">
          {isIllustrative && (
            <div className="mb-6 p-4 border border-dashed border-gray-600 bg-[#111] inline-block">
              <span className="font-bold text-red-500 uppercase tracking-wider text-xs">ILLUSTRATIVE CASE</span>
              <p className="text-sm text-gray-400 mt-1 mb-0 max-w-2xl">
                This case uses fictional entity names to demonstrate a structural pattern. It does not
                represent any real person, company, or legal proceeding.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <StatusBadge status={c.isSampleData ? "SAMPLE" : "OFFICIAL"} showIcon={false} />
            <span className="text-xs border border-gray-600 px-3 py-1 text-gray-400 uppercase font-bold tracking-wider">
              {c.status}
            </span>
            {c.legalMechanism && (
              <span className="text-xs border border-gray-600 px-3 py-1 text-gray-400 uppercase font-bold tracking-wider">
                {c.legalMechanism}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">{c.title}</h1>
          {c.subtitle && (
            <p className="text-xl text-gray-300 max-w-3xl leading-relaxed mb-6">{c.subtitle}</p>
          )}
        </div>

        {/* Transparency Gap */}
        {c.transparencyGap && (
          <div className="mb-12 border-l-4 border-gray-600 pl-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              STRUCTURAL TRANSPARENCY GAP
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">{c.transparencyGap}</p>
          </div>
        )}

        {/* What is known / What cannot be established */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {whatIsKnown.length > 0 && (
            <div className="border border-gray-700 p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-700 pb-2">
                WHAT IS KNOWN (PUBLIC RECORD)
              </h2>
              <ul className="space-y-3">
                {whatIsKnown.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                    <span className="text-gray-600 mt-1 flex-shrink-0">○</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {whatCannotBeEstablished.length > 0 && (
            <div className="border border-dashed border-gray-700 p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-700 pb-2">
                WHAT CANNOT BE ESTABLISHED
              </h2>
              <ul className="space-y-3">
                {whatCannotBeEstablished.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-500 leading-relaxed">
                    <span className="text-gray-700 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Evidence Chain */}
        {c.evidenceChain.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">
              EVIDENCE CHAIN
            </h2>
            <div className="space-y-4">
              {c.evidenceChain.map((ev, i) => (
                <div key={ev.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border border-gray-600 flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < c.evidenceChain.length - 1 && (
                      <div className="w-px flex-1 bg-gray-800 mt-1" />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    {ev.entityName && (
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {ev.entityName}
                      </p>
                    )}
                    {ev.transactionDesc && (
                      <p className="text-sm text-gray-300 mb-2">{ev.transactionDesc}</p>
                    )}
                    {ev.documentTitle && ev.sourceUrl && (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 underline"
                      >
                        Source: {ev.documentTitle} ({ev.sourceName}) ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educational Disclaimer */}
        {c.educationalDisclaimer && (
          <div className="border border-dashed border-gray-600 p-6 bg-[#0a0a0a]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">DISCLAIMER</p>
            <p className="text-sm text-gray-400 leading-relaxed">{c.educationalDisclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
