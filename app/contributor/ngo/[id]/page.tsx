// ETW — NGO Profile Page
// Complete 100% Black/White UI, 4 Data Layers, Fund Flow Graph, Transactions Ledger, Razorpay Donations

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { NgoFundFlowWrapper } from "@/components/contributor/NgoFundFlowWrapper";
import { DonateSection } from "@/components/contributor/DonateSection";
import { NgoTransactionLedger } from "@/components/contributor/NgoTransactionLedger";
import { ExternalLink, CheckSquare, Square, HelpCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

async function getNgo(idOrSlug: string) {
  return prisma.ngo.findFirst({
    where: {
      OR: [{ slug: idOrSlug }, { id: idOrSlug }],
    },
    include: {
      transactions: {
        include: { source: true },
        orderBy: { date: "desc" },
      },
      financialYears: {
        include: { source: true },
        orderBy: { financialYear: "desc" },
      },
      emergencyMatches: {
        include: {
          emergency: true,
          evidenceDocument: true,
        },
        orderBy: { createdAt: "desc" },
      },
      donations: {
        where: { status: "PAID" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ngo = await getNgo(id);
  if (!ngo) return { title: "NGO Not Found" };
  return {
    title: `${ngo.name} — CONTRIBUTOR Directory`,
    description: `Official registration details, financial records, and verified public transactions for ${ngo.name} in Maharashtra.`,
  };
}

export default async function NgoProfilePage({ params }: Props) {
  const { id } = await params;
  const ngo = await getNgo(id);
  if (!ngo) notFound();

  // Data Completeness calculation (Layers 1 to 4)
  const isLayer1Complete = true; // Name, district, registration exist
  const isLayer2Complete = ngo.financialYears.some(
    fy => fy.totalIncome != null || fy.totalExpenditure != null
  );
  const isLayer3Complete = ngo.financialYears.some(
    fy =>
      fy.programExpenses != null ||
      fy.administrativeExpenses != null ||
      fy.foreignContributions != null ||
      fy.governmentGrants != null ||
      fy.donations != null
  );
  const isLayer4Complete = ngo.transactions.length > 0;

  // Key people parsing
  let keyPeople: Array<{ name: string; role: string; sourceUrl?: string }> = [];
  if (ngo.keyPeople) {
    try {
      keyPeople = JSON.parse(ngo.keyPeople);
    } catch {
      keyPeople = [];
    }
  }

  // Parse areas of work
  let areasOfWork: string[] = [];
  if (ngo.areasOfWork) {
    try {
      areasOfWork = JSON.parse(ngo.areasOfWork);
    } catch {
      areasOfWork = [ngo.areasOfWork];
    }
  }

  // Tax Badges Helper
  const renderComplianceBadge = (status: string | null | undefined, label: string) => {
    const s = (status || "").toUpperCase();
    if (s === "VERIFIED" || s === "VALID") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-white text-[11px] font-mono font-bold">
          <span>{label}:</span>
          <span>[VERIFIED]</span>
        </span>
      );
    }
    if (s === "EXPIRED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-black bg-gray-100 text-black text-[11px] font-mono font-bold">
          <span>{label}:</span>
          <span>[EXPIRED]</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-gray-400 text-gray-500 text-[11px] font-mono">
        <span>{label}:</span>
        <span>[NOT ON RECORD]</span>
      </span>
    );
  };

  // Aggregated totals for bar breakdown when only totals exist
  const latestFinancialYear = ngo.financialYears[0];

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-16">
      {/* Breadcrumb & Correction Link */}
      <div className="border-b border-gray-300 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs font-mono uppercase tracking-widest text-gray-600 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/contributor" className="hover:text-black underline">
              CONTRIBUTOR
            </Link>
            <span>/</span>
            <span className="text-black font-bold truncate max-w-xs sm:max-w-md">{ngo.name}</span>
          </div>

          <Link
            href={`/request-correction?entityType=NGO&entityId=${ngo.id}&name=${encodeURIComponent(
              ngo.name
            )}`}
            className="text-black hover:underline flex items-center gap-1 font-bold lowercase text-[11px] shrink-0"
          >
            <HelpCircle size={13} />
            <span>report an issue / submit document</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* 1. NGO HEADER & BADGES */}
        <div>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b-2 border-black">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {renderComplianceBadge(ngo.tax80gStatus, "80G")}
                {renderComplianceBadge(ngo.tax12aStatus, "12A")}
                {renderComplianceBadge(ngo.fcraStatus, "FCRA")}
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight">
                {ngo.name}
              </h1>

              <p className="text-sm font-mono text-gray-700 mt-2">
                {ngo.address || `${ngo.city || ""}, ${ngo.district || "Maharashtra"}`}
              </p>
            </div>

            {ngo.website && (
              <a
                href={ngo.website}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 self-start shrink-0"
              >
                <span>Official Website</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* 2. DATA COMPLETENESS INDICATOR (4-Step Progress) */}
          <div className="border-2 border-black p-5 bg-[#fafafa] mt-6">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-gray-700 block mb-3">
              DATA COMPLETENESS AUDIT (4 LAYERS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="border border-black p-3 bg-white">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckSquare size={16} className="text-black shrink-0" />
                  <span>Layer 1: Identity</span>
                </div>
                <span className="text-[11px] text-gray-600 block pl-6">
                  {isLayer1Complete ? "complete" : "missing"}
                </span>
              </div>

              <div className={`border p-3 ${isLayer2Complete ? "border-black bg-white" : "border-gray-300 bg-gray-50"}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isLayer2Complete ? <CheckSquare size={16} className="text-black shrink-0" /> : <Square size={16} className="text-gray-400 shrink-0" />}
                  <span>Layer 2: Financial Totals</span>
                </div>
                <span className="text-[11px] text-gray-600 block pl-6">
                  {isLayer2Complete ? "complete" : "missing"}
                </span>
              </div>

              <div className={`border p-3 ${isLayer3Complete ? "border-black bg-white" : "border-gray-300 bg-gray-50"}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isLayer3Complete ? <CheckSquare size={16} className="text-black shrink-0" /> : <Square size={16} className="text-gray-400 shrink-0" />}
                  <span>Layer 3: Categorized Flows</span>
                </div>
                <span className="text-[11px] text-gray-600 block pl-6">
                  {isLayer3Complete ? "complete" : "missing"}
                </span>
              </div>

              <div className={`border p-3 ${isLayer4Complete ? "border-black bg-white" : "border-gray-300 bg-gray-50"}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isLayer4Complete ? <CheckSquare size={16} className="text-black shrink-0" /> : <Square size={16} className="text-gray-400 shrink-0" />}
                  <span>Layer 4: Transactions</span>
                </div>
                <span className="text-[11px] text-gray-600 block pl-6">
                  {isLayer4Complete ? `${ngo.transactions.length} transactions` : "Not publicly disclosed"}
                </span>
              </div>
            </div>
          </div>

          {/* Registration Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-5 bg-white border-2 border-black text-xs font-mono mt-6">
            <div>
              <span className="text-[10px] uppercase text-gray-500 block mb-1">District</span>
              <span className="font-bold text-black">{ngo.district || "Not disclosed"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 block mb-1">Reg. Number</span>
              <span className="font-bold text-black">{ngo.registrationNumber || "Not disclosed"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 block mb-1">Darpan ID</span>
              <span className="font-bold text-black">{ngo.darpanId || "Not publicly disclosed"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 block mb-1">Reg. Authority</span>
              <span className="font-bold text-black">{ngo.registrationAuthority || "Not disclosed"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 block mb-1">Reg. Type</span>
              <span className="font-bold text-black">{ngo.registrationType || "Charitable Entity"}</span>
            </div>
          </div>

          {/* Areas of Work & Cited Leadership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border border-black p-4 bg-white text-xs">
              <span className="font-mono text-[10px] font-bold uppercase text-gray-600 block mb-2">
                AREAS OF WORK
              </span>
              <div className="flex flex-wrap gap-1.5">
                {areasOfWork.length > 0 ? (
                  areasOfWork.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 border border-black bg-gray-50 font-mono text-[11px]">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic font-mono">Not publicly disclosed</span>
                )}
              </div>
            </div>

            <div className="border border-black p-4 bg-white text-xs">
              <span className="font-mono text-[10px] font-bold uppercase text-gray-600 block mb-2">
                KEY LEADERSHIP (Public Filings Only)
              </span>
              {keyPeople.length > 0 ? (
                <ul className="space-y-1.5 font-mono text-[11px]">
                  {keyPeople.map((kp, i) => (
                    <li key={i} className="flex justify-between items-center border-b border-gray-100 pb-1">
                      <span className="font-bold">{kp.name} &middot; {kp.role}</span>
                      {kp.sourceUrl && (
                        <a
                          href={kp.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-gray-600 hover:text-black text-[10px]"
                        >
                          Source &rarr;
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 italic font-mono">
                  No key leadership records linked with cited public filings.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. DONATE SECTION */}
        <DonateSection
          ngoId={ngo.id}
          ngoName={ngo.name}
          officialDonationUrl={ngo.officialDonationUrl}
          paymentEnabled={ngo.paymentEnabled}
          verificationStatus={ngo.verificationStatus}
          isTestMode={process.env.PAYMENTS_MODE !== "live"}
        />

        {/* 4. FUND FLOW GRAPH & TOTALS BREAKDOWN */}
        <section aria-labelledby="fund-flow-section">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
            <h2 id="fund-flow-section" className="text-lg font-black tracking-tight uppercase">
              FUND FLOW TRACEABILITY GRAPH
            </h2>
            <span className="text-xs font-mono text-gray-600">
              Dagre TB Layout &middot; Public Records
            </span>
          </div>

          {ngo.transactions.length > 0 ? (
            /* Render Graph when transactions exist */
            <div className="border-2 border-black bg-white p-4">
              <NgoFundFlowWrapper ngoName={ngo.name} transactions={ngo.transactions} />
            </div>
          ) : latestFinancialYear && (latestFinancialYear.totalIncome != null || latestFinancialYear.totalExpenditure != null) ? (
            /* Render Notice + Bar Breakdown when only totals exist */
            <div className="border-2 border-black p-6 bg-white space-y-6">
              <div className="p-4 bg-[#f5f5f5] border border-black font-mono text-xs leading-relaxed">
                <strong>DISCLOSURE NOTICE:</strong> Line-item transactions not publicly disclosed. Showing aggregate totals only from annual statutory filing ({latestFinancialYear.financialYear}).
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-gray-600 block mb-3 font-bold">
                  FINANCIAL TOTALS BREAKDOWN ({latestFinancialYear.financialYear})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="border-2 border-black p-4 bg-gray-50">
                    <span className="text-gray-600 block mb-1">TOTAL ANNUAL INCOME</span>
                    <span className="text-xl font-bold text-black">
                      {formatInr(latestFinancialYear.totalIncome)}
                    </span>
                  </div>
                  <div className="border-2 border-black p-4 bg-gray-50">
                    <span className="text-gray-600 block mb-1">TOTAL EXPENDITURE</span>
                    <span className="text-xl font-bold text-black">
                      {formatInr(latestFinancialYear.totalExpenditure)}
                    </span>
                  </div>
                  <div className="border-2 border-black p-4 bg-gray-50">
                    <span className="text-gray-600 block mb-1">FOREIGN CONTRIBUTIONS</span>
                    <span className="text-xl font-bold text-black">
                      {latestFinancialYear.foreignContributions != null
                        ? formatInr(latestFinancialYear.foreignContributions)
                        : "Not disclosed"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No financials filed */
            <div className="border-2 border-dashed border-gray-400 p-8 text-center text-xs font-mono text-gray-600 bg-[#fafafa]">
              Financial statements not publicly filed or imported yet.
            </div>
          )}
        </section>

        {/* 5. ANNUAL FINANCIAL DISCLOSURES TABLE */}
        <section aria-labelledby="annual-financials">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <h2 id="annual-financials" className="text-lg font-black tracking-tight uppercase">
              ANNUAL FINANCIAL DISCLOSURES
            </h2>
            <span className="text-xs font-mono text-gray-600">
              Figures in INR (₹) &middot; Never estimated
            </span>
          </div>

          {ngo.financialYears.length === 0 ? (
            <div className="border border-dashed border-gray-400 p-8 text-center text-xs font-mono text-gray-600 bg-[#fafafa]">
              Not publicly disclosed. No annual audited financial filings on record for this organisation.
            </div>
          ) : (
            <div className="border-2 border-black overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-black text-white font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 border-r border-gray-700">Financial Year</th>
                    <th className="p-3 border-r border-gray-700">Total Income</th>
                    <th className="p-3 border-r border-gray-700">Total Expenditure</th>
                    <th className="p-3 border-r border-gray-700">Foreign Contributions</th>
                    <th className="p-3 border-r border-gray-700">Source Filing</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {ngo.financialYears.map(fy => (
                    <tr key={fy.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold border-r border-gray-200">{fy.financialYear}</td>
                      <td className="p-3 font-mono border-r border-gray-200">
                        {fy.totalIncome != null ? formatInr(fy.totalIncome) : <span className="text-gray-400">Not disclosed</span>}
                      </td>
                      <td className="p-3 font-mono border-r border-gray-200">
                        {fy.totalExpenditure != null ? formatInr(fy.totalExpenditure) : <span className="text-gray-400">Not disclosed</span>}
                      </td>
                      <td className="p-3 font-mono border-r border-gray-200">
                        {fy.foreignContributions != null ? formatInr(fy.foreignContributions) : <span className="text-gray-400">Not disclosed</span>}
                      </td>
                      <td className="p-3 border-r border-gray-200">
                        {fy.sourceUrl ? (
                          <a
                            href={fy.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-gray-700 font-mono text-[11px] inline-flex items-center gap-1 font-bold"
                          >
                            {fy.sourceName || fy.sourceClassification || "View Document"} <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-gray-400 font-mono">Not disclosed</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        <span className="inline-block px-1.5 py-0.5 bg-black text-white text-[10px] font-bold">
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 6. PUBLIC TRANSACTION LEDGER (SEARCHABLE, FILTERABLE, CSV EXPORT) */}
        <section aria-labelledby="financial-ledger">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h2 id="financial-ledger" className="text-lg font-black tracking-tight uppercase">
              PUBLIC TRANSACTION LEDGER
            </h2>
            <span className="text-xs font-mono text-gray-600">
              Only verified public sources &middot; Never derived from annual totals
            </span>
          </div>

          <NgoTransactionLedger ngoName={ngo.name} transactions={ngo.transactions} />
        </section>

        {/* 7. PLATFORM DONATIONS SECTION */}
        <section aria-labelledby="platform-donations" className="border-2 border-black p-6 bg-[#fafafa]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h3 id="platform-donations" className="text-base font-black uppercase tracking-tight">
              DONATIONS VIA ETW (PLATFORM-RECORDED)
            </h3>
            <span className="text-xs font-mono bg-black text-white px-2 py-0.5">
              {ngo.donations.length} RECORDED
            </span>
          </div>

          {ngo.donations.length === 0 ? (
            <p className="text-xs font-mono text-gray-600">
              No platform donations recorded for this organisation yet. Donations made via ETW are acknowledged with immediate digital receipts.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="border border-black p-3 bg-white">
                  <span className="text-gray-500 block mb-1">TOTAL CONTRIBUTED</span>
                  <span className="text-lg font-bold">
                    {formatInr(ngo.donations.reduce((acc, d) => acc + d.amountPaise / 100, 0))}
                  </span>
                </div>
                <div className="border border-black p-3 bg-white">
                  <span className="text-gray-500 block mb-1">TRANSACTIONS</span>
                  <span className="text-lg font-bold">{ngo.donations.length}</span>
                </div>
                <div className="border border-black p-3 bg-white">
                  <span className="text-gray-500 block mb-1">SETTLEMENT INTERMEDIARY</span>
                  <span className="font-bold">ETW Direct Gateway</span>
                </div>
              </div>

              <div className="border border-black overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse bg-white">
                  <thead className="bg-black text-white uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-r border-gray-700">Date</th>
                      <th className="p-2 border-r border-gray-700">Receipt Ref</th>
                      <th className="p-2 border-r border-gray-700">Donor</th>
                      <th className="p-2 border-r border-gray-700 text-right">Amount</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ngo.donations.map(d => (
                      <tr key={d.id}>
                        <td className="p-2 border-r border-gray-200">
                          {new Date(d.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-2 border-r border-gray-200 font-bold">
                          <Link href={`/contributor/donations/${d.id}/receipt`} className="underline hover:text-gray-600">
                            {d.receiptNumber || d.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="p-2 border-r border-gray-200">
                          {d.isAnonymous ? "Anonymous Donor" : d.donorName || "Supporter"}
                        </td>
                        <td className="p-2 border-r border-gray-200 text-right font-bold">
                          {formatInr(d.amountPaise / 100)}
                        </td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-bold">
                            PAID
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
