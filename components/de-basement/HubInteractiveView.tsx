// ETW — De-Basement Interactive Hub View Component
// High-density knowledge hub index with tab navigation, pathfinder decision helper, and article directory.

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KnowledgeArticle, DocumentChecklist, LegalCaseStudy, FAQItem, OfficialDirectoryEntry } from "@/data/de-basement/types";
import { ChecklistView } from "./ChecklistView";
import { CaseStudyView } from "./CaseStudyView";
import { FAQAccordion } from "./FAQAccordion";
import { OfficialResourcesGrid } from "./OfficialResourcesGrid";

export type HubTab = "ARTICLES" | "PATHFINDER" | "CHECKLISTS" | "CASES" | "FAQS" | "REGULATORY";

export interface DbCaseStub {
  id: string;
  slug: string;
  title: string;
  status: string;
  [key: string]: unknown;
}

interface HubInteractiveViewProps {
  articles: KnowledgeArticle[];
  checklists: DocumentChecklist[];
  cases: LegalCaseStudy[];
  faqs: FAQItem[];
  resources: OfficialDirectoryEntry[];
  dbCases?: DbCaseStub[];
}

export function HubInteractiveView({
  articles,
  checklists,
  cases,
  faqs,
  resources,
  dbCases = [],
}: HubInteractiveViewProps) {
  const [activeTab, setActiveTab] = useState<HubTab>("ARTICLES");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<string>("itru");

  const filteredArticles = articles.filter((art) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.subtitle.toLowerCase().includes(q) ||
      art.sectionTitle.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Search & Top Action Bar */}
      <div className="border-2 border-black bg-white p-4 mb-8" style={{ boxShadow: "3px 3px 0px #000" }}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search knowledge hub by statute (e.g. 139(8A), 115BBE, PMLA, 56(2)), topic, or case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="etw-input text-xs w-full p-2.5 border-2 border-black"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs font-bold text-neutral-600">JURISDICTION:</span>
            <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
              REPUBLIC OF INDIA
            </span>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="border-b-2 border-black mb-8 overflow-x-auto">
        <nav className="flex gap-1 min-w-[700px]" aria-label="Knowledge Hub Sections">
          {[
            { id: "ARTICLES", label: "1. KNOWLEDGE ARTICLES (8)" },
            { id: "PATHFINDER", label: "2. COMPLIANCE PATHFINDER" },
            { id: "CHECKLISTS", label: "3. DOCUMENT CHECKLISTS" },
            { id: "CASES", label: "4. JUDICIAL PRECEDENTS" },
            { id: "FAQS", label: "5. PRACTICAL FAQS" },
            { id: "REGULATORY", label: "6. OFFICIAL DIRECTORY" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HubTab)}
              className={`px-4 py-3 font-mono text-xs font-black tracking-wider uppercase border-t-2 border-x-2 transition-all ${
                activeTab === tab.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-neutral-700 border-transparent hover:border-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: KNOWLEDGE ARTICLES */}
      {activeTab === "ARTICLES" && (
        <section aria-labelledby="articles-heading">
          <div className="flex items-center justify-between border-b border-neutral-300 pb-3 mb-6">
            <h2 id="articles-heading" className="text-lg font-black uppercase tracking-tight text-black m-0">
              CORE STATUTORY MODULES ({filteredArticles.length})
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              UPDATED &amp; VERIFIED UNDER FINANCE ACT 2024
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="border-2 border-black bg-white p-6 flex flex-col justify-between hover:bg-[#fafafa] transition-all group"
                style={{ boxShadow: "3px 3px 0px #000" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-2 mb-3">
                    <span className="font-mono text-xs font-black uppercase px-2 py-0.5 bg-black text-white">
                      SECTION {art.sectionNumber}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-neutral-600">
                      {art.readingTimeMinutes} MIN READ • {art.lastVerifiedDate}
                    </span>
                  </div>

                  <p className="font-mono text-[11px] font-black uppercase tracking-widest text-neutral-600 mb-1">
                    {art.sectionTitle}
                  </p>

                  <h3 className="text-lg md:text-xl font-black text-black group-hover:underline mb-2 leading-snug">
                    <Link href={`/de-basement/${art.slug}`} className="text-black no-underline">
                      {art.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-neutral-700 leading-relaxed mb-4 font-sans line-clamp-3">
                    {art.subtitle}
                  </p>

                  <div className="space-y-1.5 mb-6 bg-[#f8f8f8] p-3 border-l-2 border-black">
                    <p className="font-mono text-[10px] font-black uppercase text-black mb-1">
                      Key Statutory Takeaways:
                    </p>
                    {art.keyTakeaways.slice(0, 2).map((tk, tIdx) => (
                      <p key={tIdx} className="text-[11px] text-neutral-800 m-0 leading-normal">
                        • {tk}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
                    {art.verificationBadge.replace(/_/g, " ")}
                  </span>
                  <Link
                    href={`/de-basement/${art.slug}`}
                    className="etw-btn text-xs px-3 py-1.5 font-bold uppercase"
                  >
                    READ ARTICLE →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Database Cases if any published */}
          {dbCases.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-black">
              <h3 className="text-base font-black uppercase tracking-wider mb-6">
                ARCHIVED INVESTIGATIVE CASE FILES
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dbCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/de-basement/${c.slug}`}
                    className="border border-black p-4 bg-white hover:bg-neutral-100 no-underline text-black block"
                  >
                    <span className="text-[10px] font-mono font-bold uppercase block text-neutral-500 mb-1">
                      {c.status}
                    </span>
                    <h4 className="text-sm font-bold m-0 leading-snug">{c.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: COMPLIANCE PATHFINDER */}
      {activeTab === "PATHFINDER" && (
        <section aria-labelledby="pathfinder-heading">
          <div className="border-b-2 border-black pb-3 mb-6">
            <h2 id="pathfinder-heading" className="text-lg font-black uppercase tracking-tight text-black m-0">
              STATUTORY COMPLIANCE PATHFINDER: IDENTIFY YOUR LEGAL ROUTE
            </h2>
            <p className="text-xs text-neutral-600 mt-1 mb-0">
              Select your specific financial scenario to identify the applicable statutory provision, time limits, and required evidence.
            </p>
          </div>

          {/* Scenario selectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { id: "itru", label: "Missed / Under-Reported Income", statute: "Section 139(8A) / ITR-U" },
              { id: "notice148", label: "Received Scrutiny / Sec 148 Notice", statute: "Section 148 / 148A" },
              { id: "cash", label: "High Cash Deposits in Bank", statute: "Section 69A & Rule 114E" },
              { id: "gift", label: "Gift from Parents / Relatives", statute: "Section 56(2)(x) & Sec 68" },
              { id: "inheritance", label: "Inherited Property or Gold", statute: "Section 49(1) & Inst. 1916" },
              { id: "property", label: "Real Estate Sale & Circle Rates", statute: "Section 50C & 54EC" },
              { id: "remittance", label: "Sending Money to UAE / Abroad", statute: "RBI LRS & Sec 206C(1G)" },
              { id: "crypto", label: "Crypto Gains & VDA Taxation", statute: "Section 115BBH & 194S" },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-3 text-left border-2 transition-all font-mono ${
                  selectedScenario === sc.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-neutral-300 hover:border-black"
                }`}
              >
                <span className="text-[10px] uppercase font-bold block opacity-75 mb-1">{sc.statute}</span>
                <span className="text-xs font-black block leading-tight">{sc.label}</span>
              </button>
            ))}
          </div>

          {/* Scenario Resolution Details */}
          <div className="border-2 border-black bg-white p-6 md:p-8" style={{ boxShadow: "4px 4px 0px #000" }}>
            {selectedScenario === "itru" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: SECTION 139(8A) UPDATED RETURN (ITR-U)
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">FINANCE ACT 2022</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Voluntary Disclosure of Omitted Income within 24 Months
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  If you omitted income from a previous financial year (interest, capital gains, freelance receipts, business turnover),
                  you can file an Updated Return (ITR-U) under Section 139(8A) within 24 months from the end of the relevant Assessment Year.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
                  <div className="bg-[#f5f5f5] p-3 border-l-4 border-black">
                    <span className="font-mono font-bold block mb-1">Time Limit:</span>
                    <span>Up to 24 months from end of AY (e.g. for AY 2024-25, till March 31, 2027).</span>
                  </div>
                  <div className="bg-[#f5f5f5] p-3 border-l-4 border-black">
                    <span className="font-mono font-bold block mb-1">Additional Statutory Tax:</span>
                    <span>25% of [Tax + Interest] if filed in Year 1; 50% if filed in Year 2.</span>
                  </div>
                  <div className="bg-[#f5f5f5] p-3 border-l-4 border-black">
                    <span className="font-mono font-bold block mb-1">Mandatory Condition:</span>
                    <span>Must result in positive additional tax; cannot claim loss or refund.</span>
                  </div>
                </div>
                <Link
                  href="/de-basement/legal-procedures-for-undeclared-income"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW FULL ITR-U STEP-BY-STEP PROCEDURE →
                </Link>
              </div>
            )}

            {selectedScenario === "notice148" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: REASSESSMENT NOTICE UNDER SECTION 148 &amp; 148A
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">FINANCE ACT 2021/2024</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Responding to Show-Cause Inquiry under Section 148A(b)
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  Before a reassessment notice under Section 148 can be issued, the Assessing Officer must provide a show-cause notice under
                  Section 148A(b) granting between 7 to 30 days to reply. You must submit your response electronically through the e-Proceedings tab.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                  <div className="bg-[#f5f5f5] p-3 border-l-4 border-black">
                    <span className="font-mono font-bold block mb-1">Limitation Rules:</span>
                    <span>Reopening is limited to 3 years, except where escaped income in form of asset is &gt;= Rs 50 Lakhs (extendable up to 10 years).</span>
                  </div>
                  <div className="bg-[#f5f5f5] p-3 border-l-4 border-black">
                    <span className="font-mono font-bold block mb-1">Action Required:</span>
                    <span>Appoint a Chartered Accountant or tax lawyer under Section 288 to file a formal rebuttal with documentary reconciliation.</span>
                  </div>
                </div>
                <Link
                  href="/de-basement/tax-notices-scrutiny-and-appeal-procedures"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW REASSESSMENT NOTICE HANDBOOK →
                </Link>
              </div>
            )}

            {selectedScenario === "cash" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: HIGH CASH DEPOSITS &amp; SFT REPORTING
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">RULE 114E / SEC 69A</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Documenting Lawful Source of Cash Deposits
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  Cash deposits exceeding Rs 10 Lakhs in savings accounts or Rs 50 Lakhs in current accounts are automatically reported by banks under
                  Rule 114E (SFT-004/005). Unexplained cash is assessed under Section 69A and taxed at an effective flat rate of 78% under Section 115BBE.
                </p>
                <div className="bg-[#f8f8f8] p-4 border border-neutral-300 mb-6 text-xs space-y-2">
                  <p className="font-bold uppercase text-black m-0">Mandatory Evidence to Maintain:</p>
                  <p className="m-0">• Cash book / ledger showing legitimate past withdrawals from bank accounts.</p>
                  <p className="m-0">• Agricultural sales receipts and Mandi receipts (if claiming agricultural source).</p>
                  <p className="m-0">• Business cash sales recorded in GST returns and Section 44AA books of accounts.</p>
                </div>
                <Link
                  href="/de-basement/legal-financial-transactions-and-evidence"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW CASH RESTRICTIONS &amp; BANKING RULES →
                </Link>
              </div>
            )}

            {selectedScenario === "gift" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: GIFTS UNDER SECTION 56(2)(x) &amp; SECTION 68
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">SUPREME COURT PRECEDENTS</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Proving Genuineness of Familial Gifts
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  Gifts from defined &lsquo;Relatives&rsquo; are completely tax-exempt. However, per the Supreme Court ruling in <em>CIT v. P. Mohanakala</em>,
                  a bank transfer alone does not establish genuineness. You must prove donor identity, capacity, and relationship.
                </p>
                <Link
                  href="/de-basement/legal-financial-transactions-and-evidence"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW GIFT DOCUMENTATION CHECKLIST →
                </Link>
              </div>
            )}

            {selectedScenario === "inheritance" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: INHERITED ASSETS &amp; ANCESTRAL GOLD
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">SEC 49(1) / CBDT INST. 1916</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Establishing Title &amp; Permissible Possessions
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  India has no inheritance tax. Assets received under a will or legal succession are tax-free. Under CBDT Instruction 1916, gold jewelry
                  up to 500g per married woman, 250g per unmarried woman, and 100g per male member cannot be seized during search operations.
                </p>
                <Link
                  href="/de-basement/legal-financial-transactions-and-evidence"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW INHERITANCE COMPLIANCE DETAILS →
                </Link>
              </div>
            )}

            {selectedScenario === "property" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: REAL ESTATE &amp; CIRCLE RATE VALUATION
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">SEC 50C / SEC 54EC</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Circle Rate Safe Harbor &amp; Capital Gains Exemptions
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  Under Section 50C, if the sale deed consideration is lower than the circle rate by more than 10%, the circle rate is deemed as the sale price.
                  Long-term capital gains can be sheltered by investing in Section 54EC capital gains bonds (up to Rs 50 Lakhs) within 6 months.
                </p>
                <Link
                  href="/de-basement/legal-financial-transactions-and-evidence"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW PROPERTY SALE COMPLIANCE →
                </Link>
              </div>
            )}

            {selectedScenario === "remittance" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: INTERNATIONAL TRANSFERS (INDIA ↔ UAE)
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">RBI LRS / FORM 15CA &amp; 15CB</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Lawful Remittance via Authorized Dealer Banks
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  Resident individuals can remit up to USD 250,000 per financial year under the RBI Liberalised Remittance Scheme (LRS).
                  Section 206C(1G) imposes 20% TCS on remittances exceeding Rs 7 Lakhs. Unofficial hawala or peer-to-peer netting violates FEMA Section 13.
                </p>
                <Link
                  href="/de-basement/international-remittances-and-cryptocurrency-tax"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW INTERNATIONAL REMITTANCE RULES →
                </Link>
              </div>
            )}

            {selectedScenario === "crypto" && (
              <div>
                <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase px-2 py-1 bg-black text-white">
                    PATHWAY: VIRTUAL DIGITAL ASSETS (VDA)
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-600">SECTION 115BBH &amp; 194S</span>
                </div>
                <h3 className="text-xl font-black uppercase mb-3">
                  Flat 30% Tax and 1% TDS on Crypto Transfers
                </h3>
                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4">
                  Gains from the transfer of cryptocurrencies and NFTs are taxed at a flat rate of 30% (+ 4% cess = 31.2%).
                  No deductions are permitted other than acquisition cost; losses cannot be set off against any income or carried forward.
                </p>
                <Link
                  href="/de-basement/international-remittances-and-cryptocurrency-tax"
                  className="etw-btn text-xs px-4 py-2 font-bold uppercase inline-block"
                >
                  VIEW CRYPTO TAXATION &amp; FIU-IND RULES →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: DOCUMENT CHECKLISTS */}
      {activeTab === "CHECKLISTS" && (
        <section aria-labelledby="checklists-heading">
          <div className="border-b-2 border-black pb-3 mb-6">
            <h2 id="checklists-heading" className="text-lg font-black uppercase tracking-tight text-black m-0">
              STATUTORY EVIDENTIARY DOCUMENT CHECKLISTS
            </h2>
            <p className="text-xs text-neutral-600 mt-1 mb-0">
              Downloadable and copyable compliance checklists for return correction, gifts, inheritance, real estate, and cross-border transfers.
            </p>
          </div>
          <ChecklistView checklists={checklists} />
        </section>
      )}

      {/* TAB 4: CASE PRECEDENTS */}
      {activeTab === "CASES" && (
        <section aria-labelledby="cases-heading">
          <div className="border-b-2 border-black pb-3 mb-6">
            <h2 id="cases-heading" className="text-lg font-black uppercase tracking-tight text-black m-0">
              DOCUMENTED JUDICIAL PRECEDENTS &amp; ENFORCEMENT ORDERS
            </h2>
            <p className="text-xs text-neutral-600 mt-1 mb-0">
              Verified court orders from the Supreme Court of India, Bombay High Court, and Special PMLA Courts establishing binding evidentiary standards.
            </p>
          </div>
          <CaseStudyView cases={cases} />
        </section>
      )}

      {/* TAB 5: COMPLIANCE FAQS */}
      {activeTab === "FAQS" && (
        <section aria-labelledby="faqs-heading">
          <FAQAccordion faqs={faqs} showCategoryFilter={true} />
        </section>
      )}

      {/* TAB 6: REGULATORY DIRECTORY */}
      {activeTab === "REGULATORY" && (
        <section aria-labelledby="regulatory-heading">
          <OfficialResourcesGrid resources={resources} />
        </section>
      )}
    </div>
  );
}
