import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatIndianRupee } from "@/lib/graph/fund-flow-mapper";
import { Printer, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Donation Receipt #${id.substring(0, 8)} — ETW Contributor`,
    description: "Official donation acknowledgment receipt",
  };
}

export default async function DonationReceiptPage({ params }: Props) {
  const { id } = await params;
  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      ngo: true,
    },
  });

  if (!donation) {
    notFound();
  }

  const isPaid = donation.status === "PAID";
  const amountInr = donation.amountPaise / 100;
  let taxExemption: { has80G?: boolean; has12A?: boolean; sourceUrl?: string } | null = null;
  if (donation.ngo.taxExemptionInfo) {
    try {
      taxExemption = JSON.parse(donation.ngo.taxExemptionInfo);
    } catch {
      taxExemption = null;
    }
  }

  return (
    <div className="etw-page min-h-screen bg-neutral-100 py-10 print:bg-white print:py-0">
      <div className="etw-container max-w-3xl">
        {/* Navigation & Print Bar (hidden in print) */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Link
            href={`/contributor/ngo/${donation.ngo.slug || donation.ngo.id}`}
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-black hover:underline"
          >
            <ArrowLeft size={14} /> Back to {donation.ngo.name}
          </Link>

          <button
            type="button"
            className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Printer size={14} /> Print Receipt
          </button>
        </div>

        {/* Receipt Container */}
        <div className="bg-white border-2 border-black p-8 sm:p-12 shadow-md print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-black pb-6 mb-6 flex justify-between items-start">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
                EYE THE WEALTH • CONTRIBUTOR
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-1">
                DONATION ACKNOWLEDGMENT
              </h1>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                Receipt ID: {donation.id}
              </p>
            </div>
            <div className="text-right">
              {donation.isTestMode && (
                <span className="inline-block border-2 border-black bg-neutral-100 text-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase mb-1">
                  TEST MODE — NO REAL FUNDS MOVED
                </span>
              )}
              <div
                className={`font-mono text-xs font-bold uppercase px-2 py-1 border ${
                  isPaid
                    ? "bg-black text-white border-black"
                    : "bg-neutral-200 text-neutral-800 border-neutral-400"
                }`}
              >
                STATUS: {donation.status}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-4">
              <div>
                <span className="font-mono text-neutral-500 font-bold block mb-1">
                  CONTRIBUTION DATE
                </span>
                <span className="font-semibold text-neutral-900">
                  {new Date(donation.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div>
                <span className="font-mono text-neutral-500 font-bold block mb-1">
                  FINANCIAL YEAR
                </span>
                <span className="font-semibold text-neutral-900">
                  {donation.financialYear || "2024-25"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-4">
              <div>
                <span className="font-mono text-neutral-500 font-bold block mb-1">
                  BENEFICIARY ORGANISATION
                </span>
                <span className="font-bold text-sm text-black block">
                  {donation.ngo.name}
                </span>
                <span className="text-neutral-600 text-[11px] block mt-0.5">
                  Reg No: {donation.ngo.registrationNumber || "Not disclosed"} • {donation.ngo.district || "Maharashtra"}
                </span>
                {donation.ngo.darpanId && (
                  <span className="text-neutral-600 text-[11px] block">
                    NGO Darpan ID: {donation.ngo.darpanId}
                  </span>
                )}
              </div>
              <div>
                <span className="font-mono text-neutral-500 font-bold block mb-1">
                  DONOR DETAILS
                </span>
                {donation.isAnonymous ? (
                  <span className="font-bold text-neutral-900">
                    Anonymous Donor (Identity withheld per request)
                  </span>
                ) : (
                  <div>
                    <span className="font-bold text-neutral-900 block">
                      {donation.donorName || "Supporter"}
                    </span>
                    {donation.donorEmail && (
                      <span className="text-neutral-600 block mt-0.5">
                        {donation.donorEmail}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="bg-neutral-50 border-2 border-black p-4 flex justify-between items-center">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-600 block">
                  TOTAL CONTRIBUTION PROCESSED
                </span>
                <span className="text-xs text-neutral-500">
                  Currency: {donation.currency} (Indian Rupees)
                </span>
              </div>
              <div className="text-2xl font-black font-mono">
                {formatIndianRupee(amountInr, donation.currency)}
              </div>
            </div>

            {/* Gateway References */}
            <div className="border border-neutral-300 p-3 bg-white font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Gateway Order ID:</span>
                <span className="font-bold">{donation.razorpayOrderId || "—"}</span>
              </div>
              {donation.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gateway Payment ID:</span>
                  <span className="font-bold">{donation.razorpayPaymentId}</span>
                </div>
              )}
            </div>

            {/* Tax Exemption Status Notice */}
            <div className="border-t-2 border-black pt-4 text-[11px] leading-relaxed text-neutral-600 space-y-2">
              <p className="font-bold text-neutral-900 uppercase tracking-wider font-mono">
                REGULATORY & TAX NOTICE:
              </p>
              <p>
                1. This document serves as a digital transaction acknowledgment from the Eye The
                Wealth platform confirming transmission of your contribution to the designated
                beneficiary.
              </p>
              <p>
                2. <strong>This receipt is not a tax exemption certificate.</strong> Under Section
                80G / 12A of the Indian Income Tax Act, 1961, tax exemption certificates are issued
                exclusively by eligible registered charities.
                {taxExemption?.has80G && (
                  <span>
                    {" "}This NGO has recorded verified Section 80G registration in official public
                    records. To request an official Section 80G tax receipt, please contact{" "}
                    <strong>{donation.ngo.name}</strong> directly.
                  </span>
                )}
              </p>
              <p>
                3. Subject to ETW Intermediary Terms: ETW does not provide legal, financial, or tax
                advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
