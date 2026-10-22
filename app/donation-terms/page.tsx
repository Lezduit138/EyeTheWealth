import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donation Terms & Conditions — Eye The Wealth",
  description:
    "Terms of donation, platform intermediary role, DPDP privacy policy, and refund rules for Eye The Wealth.",
};

export default function DonationTermsPage() {
  return (
    <div className="etw-page">
      <div className="etw-container max-w-4xl py-12">
        <div className="pb-6 border-b-2 border-black mb-8">
          <p className="etw-label text-neutral-500 mb-1">LEGAL & TRANSPARENCY</p>
          <h1 className="text-4xl font-bold tracking-tight text-black">
            DONATION TERMS & CONDITIONS
          </h1>
          <p className="text-sm font-mono text-neutral-600 mt-2">
            Last updated: October 2026 • Platform Intermediary Disclosure
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-neutral-800">
          <section className="border border-black p-6 bg-neutral-50">
            <h2 className="text-base font-bold uppercase tracking-wider text-black mb-3">
              1. Platform Intermediary Role
            </h2>
            <p className="mb-2">
              Eye The Wealth (ETW) is an independent transparency research and civic intelligence
              portal. ETW is not a charity, foundation, bank, or payment aggregator.
            </p>
            <p>
              When you donate through the ETW platform, your domestic INR contribution is routed
              exclusively to the selected verified Non-Governmental Organisation (NGO) pursuant to a
              formal settlement arrangement and verified documentation. ETW does not hold, invest, or
              charge fees on your contribution.
            </p>
          </section>

          <section className="border border-black p-6">
            <h2 className="text-base font-bold uppercase tracking-wider text-black mb-3">
              2. Tax Exemption & Receipts (Not Tax Advice)
            </h2>
            <p className="mb-2">
              ETW issues a digital platform receipt acknowledging that your contribution was processed
              and forwarded to the designated NGO.
            </p>
            <p className="mb-2 font-bold">
              The ETW receipt is not a tax exemption certificate and does not substitute for an official
              Section 80G or 12A tax certificate.
            </p>
            <p>
              Tax exemption eligibility (such as Section 80G under the Indian Income Tax Act, 1961) is
              granted solely by the competent tax authorities to qualifying organisations. If an NGO
              maintains verified 80G/12A status, official tax receipts must be requested directly from
              that organisation using the contact information provided on their public profile.
            </p>
          </section>

          <section className="border border-black p-6">
            <h2 className="text-base font-bold uppercase tracking-wider text-black mb-3">
              3. Refund Policy
            </h2>
            <p className="mb-2">
              Charitable donations are generally non-refundable once disbursed. However, if a
              duplicate or unauthorized transaction occurs due to technical error, a refund may be
              requested within <strong>7 calendar days</strong> of transaction date.
            </p>
            <p>
              All refund requests are reviewed by an ETW administrator and processed through our
              payment gateway (Razorpay) to the original payment source. Refund transactions are
              audited and recorded in the immutable platform log.
            </p>
          </section>

          <section className="border border-black p-6">
            <h2 className="text-base font-bold uppercase tracking-wider text-black mb-3">
              4. DPDP & Privacy Notice
            </h2>
            <p className="mb-2">
              Under India’s Digital Personal Data Protection (DPDP) standards:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Your financial credentials (card details, UPI PINs, net banking passwords) are
                handled exclusively on PCI-DSS certified Razorpay hosted pages and never touch ETW
                servers.
              </li>
              <li>
                If you select <strong>&quot;Donate anonymously&quot;</strong>, your name and email are never
                disclosed publicly or linked to the donation record on public pages.
              </li>
              <li>
                Platform records display total aggregate contribution volume per financial year for
                public transparency, excluding donor PII.
              </li>
            </ul>
          </section>

          <div className="pt-6 border-t border-neutral-300 flex justify-between items-center text-xs font-mono">
            <Link href="/contributor" className="underline font-bold text-black hover:text-neutral-600">
              ← Return to Contributor Directory
            </Link>
            <span className="text-neutral-500">ETW Regulatory Compliance Framework</span>
          </div>
        </div>
      </div>
    </div>
  );
}
