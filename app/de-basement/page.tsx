// ETW — De-Basement Module Landing Page
// Legal Money Regularization & Financial Transparency Knowledge Hub

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatutoryDisclaimer } from "@/components/de-basement/StatutoryDisclaimer";
import { HubInteractiveView } from "@/components/de-basement/HubInteractiveView";
import {
  KNOWLEDGE_ARTICLES,
  DOCUMENT_CHECKLISTS,
  DOCUMENTED_CASES,
  KNOWLEDGE_FAQS,
  OFFICIAL_REGULATORY_RESOURCES,
} from "@/data/de-basement";

export const metadata: Metadata = {
  title: "DEBASEMENT — Legal Money Regularization Knowledge Hub",
  description:
    "Educational platform focused exclusively on understanding the legal treatment of undeclared money, financial transparency, lawful income disclosure, tax compliance, and the distinction between money laundering and legal regularization.",
};

interface DbCaseItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  [key: string]: unknown;
}

export default async function DeBasementPage() {
  // Query any published investigative cases from the database
  let dbCases: DbCaseItem[] = [];
  try {
    dbCases = await prisma.case.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error fetching published cases:", err);
  }

  return (
    <div className="etw-page bg-white text-black min-h-screen">
      <div className="etw-container py-10">
        {/* Module Header */}
        <div className="border-b-4 border-black pb-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="font-mono text-xs font-black uppercase px-2.5 py-1 bg-black text-white">
              MODULE 03 — FINANCIAL TRANSPARENCY &amp; COMPLIANCE
            </span>
            <span className="text-xs font-mono font-bold text-neutral-600">
              JURISDICTION: REPUBLIC OF INDIA • OFFICIAL CBDT &amp; RBI REPOSITORIES
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-4 text-black">
            DEBASEMENT
          </h1>

          <p className="text-base md:text-lg text-neutral-800 max-w-4xl leading-relaxed m-0 font-sans">
            A specialized text-based educational platform focused on the legal treatment of undeclared money,
            statutory income disclosure procedures, tax compliance mechanisms under the Income Tax Act 1961,
            legitimate cross-border transfers, and the strict statutory distinction between money laundering
            under PMLA 2002 and lawful financial regularization.
          </p>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10 text-xs font-mono">
          <div className="border-2 border-black p-3 bg-[#fafafa]">
            <span className="text-neutral-500 uppercase block text-[10px]">Statutory Modules</span>
            <span className="text-xl font-black text-black">08 SECTIONS</span>
          </div>
          <div className="border-2 border-black p-3 bg-[#fafafa]">
            <span className="text-neutral-500 uppercase block text-[10px]">Return Regularization</span>
            <span className="text-xl font-black text-black">SEC. 139(8A)</span>
          </div>
          <div className="border-2 border-black p-3 bg-[#fafafa]">
            <span className="text-neutral-500 uppercase block text-[10px]">Document Checklists</span>
            <span className="text-xl font-black text-black">06 PROTOCOLS</span>
          </div>
          <div className="border-2 border-black p-3 bg-[#fafafa]">
            <span className="text-neutral-500 uppercase block text-[10px]">Judicial Precedents</span>
            <span className="text-xl font-black text-black">05 LANDMARK</span>
          </div>
          <div className="border-2 border-black p-3 bg-[#fafafa] col-span-2 md:col-span-1">
            <span className="text-neutral-500 uppercase block text-[10px]">Official Portals</span>
            <span className="text-xl font-black text-black">08 VERIFIED</span>
          </div>
        </div>

        {/* Mandatory Educational & Regulatory Disclaimer */}
        <StatutoryDisclaimer compact={false} />

        {/* Central Interactive Knowledge Hub View */}
        <HubInteractiveView
          articles={KNOWLEDGE_ARTICLES}
          checklists={DOCUMENT_CHECKLISTS}
          cases={DOCUMENTED_CASES}
          faqs={KNOWLEDGE_FAQS}
          resources={OFFICIAL_REGULATORY_RESOURCES}
          dbCases={dbCases}
        />
      </div>
    </div>
  );
}
