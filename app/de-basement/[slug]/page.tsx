// ETW — De-Basement Dynamic Route Page
// Serves both comprehensive Knowledge Hub articles and verified investigative case studies.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatutoryDisclaimer } from "@/components/de-basement/StatutoryDisclaimer";
import { ComparisonTable } from "@/components/de-basement/ComparisonTable";
import { ProcedureTimeline } from "@/components/de-basement/ProcedureTimeline";
import { ChecklistView } from "@/components/de-basement/ChecklistView";
import { CaseStudyView } from "@/components/de-basement/CaseStudyView";
import { FAQAccordion } from "@/components/de-basement/FAQAccordion";
import { ArticleContentBody } from "@/components/de-basement/ArticleContentBody";
import { KNOWLEDGE_ARTICLES } from "@/data/de-basement";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getDbCase(slug: string) {
  try {
    return await prisma.case.findUnique({
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
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Check static knowledge hub articles first
  const article = KNOWLEDGE_ARTICLES.find((a) => a.slug === slug);
  if (article) {
    return {
      title: `${article.title} — DEBASEMENT | ETW`,
      description: article.subtitle,
    };
  }

  // Check database case
  const c = await getDbCase(slug);
  if (c) {
    return {
      title: `${c.title} — DEBASEMENT | ETW`,
      description: c.subtitle ?? c.legalMechanism ?? c.title,
    };
  }

  return { title: "Article Not Found — DEBASEMENT" };
}

export default async function KnowledgeArticlePage({ params }: Props) {
  const { slug } = await params;

  // 1. Check if the slug corresponds to a core knowledge article
  const article = KNOWLEDGE_ARTICLES.find((a) => a.slug === slug);

  if (article) {
    const relatedArticles = KNOWLEDGE_ARTICLES.filter((a) =>
      article.relatedSlugs.includes(a.slug)
    );

    return (
      <div className="etw-page bg-white text-black min-h-screen">
        <div className="etw-container py-10">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="pb-4 border-b border-neutral-300 mb-8 text-xs font-mono uppercase tracking-wider flex items-center gap-2"
          >
            <Link href="/de-basement" className="text-neutral-600 no-underline hover:text-black">
              DEBASEMENT HUB
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-black font-bold">
              SECTION {article.sectionNumber}: {article.sectionTitle}
            </span>
          </nav>

          {/* Article Header */}
          <header className="border-b-4 border-black pb-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase px-2.5 py-1 bg-black text-white">
                  SECTION {article.sectionNumber}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-600">
                  {article.sectionTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
                <span className="px-2 py-0.5 border border-black font-bold">
                  {article.readingTimeMinutes} MIN READ
                </span>
                <span className="px-2 py-0.5 border border-black font-bold">
                  VERIFIED: {article.lastVerifiedDate}
                </span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase mb-4 leading-tight">
              {article.title}
            </h1>

            <p className="text-base md:text-xl text-neutral-700 max-w-4xl leading-relaxed m-0 font-sans">
              {article.subtitle}
            </p>
          </header>

          {/* Compact Educational Notice */}
          <StatutoryDisclaimer compact={true} />

          {/* Summary & Key Statutory Takeaways */}
          <section
            aria-labelledby="takeaways-heading"
            className="border-2 border-black p-6 md:p-8 bg-[#fafafa] mb-10"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <h2 id="takeaways-heading" className="text-sm font-black font-mono uppercase tracking-widest text-black mb-3">
              EXECUTIVE STATUTORY SUMMARY
            </h2>
            <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-6 font-sans">
              {article.summary}
            </p>

            <div className="border-t-2 border-black pt-4">
              <h3 className="text-xs font-mono font-black uppercase text-black mb-3">
                KEY STATUTORY TAKEAWAYS &amp; LEGAL IMPERATIVES:
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-neutral-900 leading-relaxed font-sans m-0">
                {article.keyTakeaways.map((point, pIdx) => (
                  <li key={pIdx}>{point}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Comparison Tables (if present) */}
          {article.comparisonTables &&
            article.comparisonTables.map((tbl, tIdx) => (
              <ComparisonTable
                key={tIdx}
                title={tbl.title}
                description={tbl.description}
                headers={tbl.headers}
                rows={tbl.rows}
              />
            ))}

          {/* Step-by-Step Procedure Timeline (if present) */}
          {article.stepProcedures && (
            <ProcedureTimeline
              title={`PROCEDURAL PROTOCOL: ${article.title.toUpperCase()}`}
              steps={article.stepProcedures}
            />
          )}

          {/* Evidentiary Document Checklists (if present) */}
          {article.checklists && <ChecklistView checklists={article.checklists} />}

          {/* Judicial Case Studies (if present) */}
          {article.caseStudies && <CaseStudyView cases={article.caseStudies} />}

          {/* Comprehensive Statutory Commentary & Prose */}
          <div className="my-10 border-t-2 border-black pt-8">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-neutral-600 mb-6">
              STATUTORY ANALYSIS &amp; DETAILED COMMENTARY
            </h2>
            <ArticleContentBody slug={article.slug} />
          </div>

          {/* Official Source Citations */}
          <section
            aria-labelledby="sources-heading"
            className="border-2 border-black p-6 bg-white my-10"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            <h2 id="sources-heading" className="text-xs font-mono font-black uppercase tracking-widest text-black mb-4">
              OFFICIAL STATUTORY SOURCES &amp; REGULATORY CITATIONS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {article.officialSources.map((src, sIdx) => (
                <div key={sIdx} className="border border-neutral-300 p-3 bg-[#fafafa]">
                  <p className="font-bold text-black m-0 mb-1">{src.name}</p>
                  <p className="text-[11px] text-neutral-600 m-0">Authority: {src.authority}</p>
                  {src.statutoryReference && (
                    <p className="text-[11px] text-neutral-700 m-0 mt-0.5">
                      Statute: {src.statutoryReference}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-500 m-0 mt-0.5">
                    Citation Date: {src.citationDate}
                  </p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold text-black text-[11px] block mt-2"
                  >
                    Official Portal Link ↗
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Relevant FAQs */}
          {article.faqs && article.faqs.length > 0 && (
            <div className="my-10 border-t-2 border-black pt-8">
              <FAQAccordion faqs={article.faqs} showCategoryFilter={false} />
            </div>
          )}

          {/* Related Articles Navigation */}
          {relatedArticles.length > 0 && (
            <div className="border-t-4 border-black pt-8 mt-12">
              <h2 className="text-xs font-mono font-black uppercase tracking-widest text-neutral-600 mb-6">
                RELATED STATUTORY GUIDES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/de-basement/${rel.slug}`}
                    className="border-2 border-black p-5 bg-white hover:bg-[#fafafa] transition-colors no-underline text-black block group"
                    style={{ boxShadow: "2px 2px 0px #000" }}
                  >
                    <span className="font-mono text-[10px] font-black uppercase text-neutral-500 block mb-1">
                      SECTION {rel.sectionNumber}
                    </span>
                    <h3 className="text-sm font-black group-hover:underline m-0 mb-2 leading-snug">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-neutral-600 m-0 line-clamp-2">
                      {rel.subtitle}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Check if the slug corresponds to a database case study
  const c = await getDbCase(slug);
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
              <span className="font-bold text-red-500 uppercase tracking-wider text-xs">
                ILLUSTRATIVE CASE
              </span>
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

        {/* Structural Transparency Gap */}
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
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              DISCLAIMER
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">{c.educationalDisclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
