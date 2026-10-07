// ETW — NGO Profile Page
// Shows NGO details, financial records table, and visual Fund Flow graph

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourcePanel, SourceDetail } from "@/components/ui/SourcePanel";
import { SampleDataBanner } from "@/components/ui/Card";
import { NgoFundFlowWrapper } from "@/components/contributor/NgoFundFlowWrapper";

interface Props {
  params: Promise<{ id: string }>;
}

async function getNgo(slug: string) {
  return prisma.ngo.findUnique({
    where: { slug },
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
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ngo = await getNgo(id);
  if (!ngo) return { title: "NGO Not Found" };
  return {
    title: `${ngo.name} — CONTRIBUTOR`,
    description: `Financial records, funding sources, and disaster response activity for ${ngo.name} in Maharashtra.`,
  };
}

export default async function NgoProfilePage({ params }: Props) {
  const { id } = await params;
  const ngo = await getNgo(id);
  if (!ngo) notFound();

  return (
    <div className="etw-page">
      {ngo.isSampleData && <SampleDataBanner className="mb-4" />}

      {/* Breadcrumb */}
      <div className="etw-container pb-4 border-b border-gray-200 mb-8 text-xs text-gray-500 uppercase tracking-widest">
        <Link href="/contributor" className="text-gray-500 no-underline hover:text-black">
          CONTRIBUTOR
        </Link>
        {" → "}
        <span className="text-black font-bold">{ngo.name}</span>
      </div>

      <div className="etw-container">
        {/* NGO Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold m-0">{ngo.name}</h1>
            {ngo.isSampleData && <StatusBadge status="SAMPLE" showIcon={false} />}
          </div>
          <p className="text-gray-600 max-w-3xl mb-6 leading-relaxed">
            {ngo.address ?? "No public address on record."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6 bg-gray-50 border border-gray-200">
            <div>
              <span className="etw-label block text-gray-500 mb-1">DISTRICT</span>
              <span className="font-bold">{ngo.district ?? "Not disclosed"}</span>
            </div>
            <div>
              <span className="etw-label block text-gray-500 mb-1">REG. NUMBER</span>
              <span className="font-bold">{ngo.registrationNumber ?? "Not disclosed"}</span>
            </div>
            <div>
              <span className="etw-label block text-gray-500 mb-1">NITI AAYOG ID</span>
              <span className="font-bold">{ngo.ngoId ?? "Not disclosed"}</span>
            </div>
            <div>
              <span className="etw-label block text-gray-500 mb-1">FCRA REG.</span>
              <span className="font-bold">{ngo.fcraRegistration ?? "Not disclosed"}</span>
            </div>
            <div>
              <span className="etw-label block text-gray-500 mb-1">REG. TYPE</span>
              <span className="font-bold">{ngo.registrationType ?? "Unknown"}</span>
            </div>
          </div>
        </div>

        {/* Annual Financial Summary */}
        {ngo.financialYears.length > 0 && (
          <section aria-labelledby="annual-financials" className="mb-12">
            <h2 id="annual-financials" className="etw-section-heading mb-6">
              ANNUAL FINANCIAL RECORDS
            </h2>
            <table className="etw-table w-full">
              <thead>
                <tr>
                  <th>Financial Year</th>
                  <th>Total Income (₹)</th>
                  <th>Total Expenditure (₹)</th>
                  <th>Foreign Contributions (₹)</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ngo.financialYears.map((fy) => (
                  <tr key={fy.id}>
                    <td className="font-bold">{fy.financialYear}</td>
                    <td>
                      {fy.totalIncome != null ? (
                        `₹${fy.totalIncome.toLocaleString()}`
                      ) : (
                        <span className="etw-not-disclosed">Not disclosed</span>
                      )}
                    </td>
                    <td>
                      {fy.totalExpenditure != null ? (
                        `₹${fy.totalExpenditure.toLocaleString()}`
                      ) : (
                        <span className="etw-not-disclosed">Not disclosed</span>
                      )}
                    </td>
                    <td>
                      {fy.foreignContributions != null ? (
                        `₹${fy.foreignContributions.toLocaleString()}`
                      ) : (
                        <span className="etw-not-disclosed">Not disclosed</span>
                      )}
                    </td>
                    <td>
                      {fy.sourceUrl ? (
                        <a href={fy.sourceUrl} target="_blank" rel="noreferrer" className="text-sm underline">
                          {fy.source?.name ?? "View"} ↗
                        </a>
                      ) : (
                        fy.source?.name ?? <span className="etw-not-disclosed">Not disclosed</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge
                        status={fy.verificationStatus as "OFFICIAL" | "ESTIMATED" | "NOT_DISCLOSED" | "SAMPLE" | "VERIFIED" | "UNVERIFIED"}
                        showIcon={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Disaster Response Activity */}
        {ngo.emergencyMatches.length > 0 && (
          <section aria-labelledby="disaster-response" className="mb-12">
            <h2 id="disaster-response" className="etw-section-heading mb-6">
              DISASTER RESPONSE ACTIVITY
            </h2>
            <div className="grid gap-4">
              {ngo.emergencyMatches.map((match) => (
                <div key={match.id} className="border border-gray-200 p-6 flex items-start gap-6">
                  <div className="text-4xl">🚨</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        href={`/contributor/emergency/${match.emergency.id}`}
                        className="font-bold text-lg text-black hover:underline"
                      >
                        {match.emergency.title}
                      </Link>
                      <StatusBadge
                        status={match.status === "CONFIRMED_RESPONDING" ? "VERIFIED" : "UNVERIFIED"}
                        showIcon={false}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {match.status === "CONFIRMED_RESPONDING"
                        ? "Verified response activities logged."
                        : "Operating nearby; response unverified."}
                    </p>
                    {match.evidenceDocument && (
                      <div className="mt-3">
                        <span className="etw-label block text-gray-500 mb-2">EVIDENCE</span>
                        <a
                          href={match.evidenceDocument.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline"
                        >
                          {match.evidenceDocument.title}{" "}
                          {match.evidenceDocument.documentType
                            ? `(${match.evidenceDocument.documentType})`
                            : ""}
                          {" "}↗
                        </a>
                      </div>
                    )}
                    {match.evidenceUrl && !match.evidenceDocument && (
                      <a href={match.evidenceUrl} target="_blank" rel="noreferrer" className="text-sm underline">
                        View evidence ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="financial-ledger" className="mb-12">
          <h2 id="financial-ledger" className="etw-section-heading mb-6">
            PUBLIC TRANSACTION RECORDS (LEDGER)
          </h2>
          
          <div className="mb-10">
            <NgoFundFlowWrapper ngoName={ngo.name} transactions={ngo.transactions} />
          </div>

          {ngo.transactions.length === 0 ? (
            <div className="border border-dashed border-gray-300 p-10 text-center">
              <p className="text-gray-500">No public transaction records found for this organisation.</p>
            </div>
          ) : (
            <table className="etw-table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount (₹)</th>
                  <th>Sender / Source Entity</th>
                  <th>Type</th>
                  <th>Public Record</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ngo.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      {tx.date ? new Date(tx.date).toLocaleDateString() : (
                        <span className="etw-not-disclosed">Unknown</span>
                      )}
                    </td>
                    <td className="font-bold">
                      {tx.amount != null ? `₹${tx.amount.toLocaleString()}` : (
                        <span className="etw-not-disclosed">Not disclosed</span>
                      )}
                    </td>
                    <td>
                      {tx.senderName ?? (
                        <span className="etw-not-disclosed">Unknown / Not disclosed</span>
                      )}
                    </td>
                    <td>{tx.transactionType ?? tx.senderType ?? "—"}</td>
                    <td>
                      {tx.sourceUrl ? (
                        <a
                          href={tx.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline"
                        >
                          {tx.source?.name ?? "View Record"} ↗
                        </a>
                      ) : (
                        tx.source?.name ?? "Unknown"
                      )}
                    </td>
                    <td>
                      <SourcePanel title="Record Details">
                        <SourceDetail
                          value={tx.amount ?? undefined}
                          unit="INR"
                          year={tx.date ? new Date(tx.date).getFullYear() : undefined}
                          sourceName={tx.source?.name}
                          sourceUrl={tx.sourceUrl ?? undefined}
                          methodology={tx.notes ?? undefined}
                        />
                      </SourcePanel>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
