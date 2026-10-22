// ETW — De-Basement Case Study View Component
// Strictly documented Indian cases with facts, statutes, outcomes, and compliance lessons.

import React from "react";
import { LegalCaseStudy } from "@/data/de-basement/types";

interface CaseStudyViewProps {
  cases: LegalCaseStudy[];
}

export function CaseStudyView({ cases }: CaseStudyViewProps) {
  if (!cases || cases.length === 0) return null;

  return (
    <div className="my-10 space-y-10">
      {cases.map((cs) => (
        <article
          key={cs.id}
          className="border-2 border-black bg-white p-6 md:p-8"
          style={{ boxShadow: "4px 4px 0px #000" }}
          id={cs.slug}
        >
          {/* Top badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase px-2.5 py-1 bg-black text-white">
                DOCUMENTED PRECEDENT
              </span>
              <span className="text-xs font-mono font-bold text-neutral-600">
                {cs.courtOrAgency} ({cs.year})
              </span>
            </div>
            <span className="text-xs font-mono font-bold border border-black px-2 py-0.5">
              STATUS: {cs.status}
            </span>
          </div>

          {/* Title & citation */}
          <h3 className="text-xl md:text-2xl font-black text-black tracking-tight mb-2 m-0 leading-tight">
            {cs.title}
          </h3>
          <p className="font-mono text-xs text-neutral-600 mb-6 font-bold">
            Citation: {cs.citation}
          </p>

          {/* Statutes invoked */}
          <div className="mb-6">
            <span className="font-mono text-xs font-bold uppercase text-neutral-600 block mb-2">
              Applicable Statutory Legislation:
            </span>
            <div className="flex flex-wrap gap-2">
              {cs.statutesInvoked.map((st, sIdx) => (
                <span
                  key={sIdx}
                  className="font-mono text-xs bg-[#f0f0f0] border border-neutral-400 px-2.5 py-1 text-black font-semibold"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>

          {/* Established Facts */}
          <div className="mb-6 bg-[#fafafa] border border-neutral-300 p-5">
            <h4 className="font-mono text-xs font-black uppercase text-black mb-3">
              Established Facts (Public Court Record):
            </h4>
            <ul className="list-disc pl-5 m-0 space-y-2 text-xs md:text-sm text-neutral-800 leading-relaxed">
              {cs.factsEstablished.map((f, fIdx) => (
                <li key={fIdx}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Legal issue */}
          <div className="mb-6 border-l-4 border-black pl-4">
            <span className="font-mono text-xs font-bold uppercase text-neutral-600 block mb-1">
              Core Legal &amp; Evidentiary Issue:
            </span>
            <p className="text-xs md:text-sm text-neutral-900 font-medium m-0 leading-relaxed">
              {cs.legalIssue}
            </p>
          </div>

          {/* Findings and Judgment */}
          <div className="mb-6">
            <span className="font-mono text-xs font-black uppercase text-black block mb-1">
              Judicial Ruling &amp; Findings:
            </span>
            <p className="text-xs md:text-sm text-neutral-800 leading-relaxed m-0">
              {cs.findingsAndJudgment}
            </p>
          </div>

          {/* Financial penalties and recoveries */}
          <div className="mb-6 bg-[#f5f5f5] p-4 border border-neutral-300">
            <span className="font-mono text-xs font-black uppercase text-black block mb-1">
              Financial Recovery / Penalties Enforced:
            </span>
            <p className="text-xs md:text-sm text-neutral-900 font-bold m-0 leading-relaxed">
              {cs.financialPenaltiesOrRecovery}
            </p>
          </div>

          {/* Compliance lessons */}
          <div className="border-t-2 border-black pt-4 mb-6">
            <span className="font-mono text-xs font-black uppercase text-black block mb-3">
              Actionable Compliance Lessons:
            </span>
            <div className="space-y-2">
              {cs.complianceLessons.map((les, lIdx) => (
                <div key={lIdx} className="flex gap-2 text-xs md:text-sm text-neutral-800">
                  <span className="font-mono font-black text-black">✓</span>
                  <span>{les}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources list */}
          {cs.sources && cs.sources.length > 0 && (
            <div className="pt-3 border-t border-neutral-200 text-xs text-neutral-500 font-mono">
              <span className="font-bold uppercase text-neutral-600 mr-2">Official Sources:</span>
              {cs.sources.map((src, sIdx) => (
                <span key={sIdx} className="mr-4">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-black font-semibold"
                  >
                    {src.name} ({src.authority})
                  </a>
                  {src.citationDate ? ` [${src.citationDate}]` : ""}
                </span>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
