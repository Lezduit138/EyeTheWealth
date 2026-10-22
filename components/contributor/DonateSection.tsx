/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, Heart, AlertCircle, CheckCircle2 } from "lucide-react";

interface DonateSectionProps {
  ngoId: string;
  ngoName: string;
  officialDonationUrl?: string | null;
  paymentEnabled: boolean;
  verificationStatus: string;
  isTestMode?: boolean;
}

const PRESETS = [500, 1000, 2500, 5000];

export function DonateSection({
  ngoId,
  ngoName,
  officialDonationUrl,
  paymentEnabled,
  verificationStatus,
  isTestMode = true,
}: DonateSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);

  const isVerified = verificationStatus === "Verified";
  const canDonateViaEtw = paymentEnabled && (isVerified || isTestMode);

  // If NGO has neither an official donation page nor verified ETW payments enabled, do not show donate widget
  if (!officialDonationUrl && !canDonateViaEtw) {
    return (
      <div className="border border-neutral-300 p-6 bg-neutral-50 text-neutral-600 text-xs font-mono space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-black uppercase">
          <AlertCircle size={14} /> No Direct Donation Options Available
        </div>
        <p>
          ETW only displays verified, source-backed donation links. This organisation has not
          publicly listed an official donation portal or established verified direct collection.
        </p>
      </div>
    );
  }

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) : amount;

  const handleStartDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!effectiveAmount || isNaN(effectiveAmount) || effectiveAmount < 100) {
      setErrorMsg("Minimum contribution amount is ₹100.");
      return;
    }
    if (effectiveAmount > 100000) {
      setErrorMsg("Maximum per-transaction contribution is ₹1,00,000.");
      return;
    }
    if (!termsAccepted) {
      setErrorMsg("You must accept the Donation Terms & Intermediary Conditions.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order
      const res = await fetch("/api/v1/contributor/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ngoId,
          amountInr: effectiveAmount,
          donorName: isAnonymous ? undefined : donorName || undefined,
          donorEmail: isAnonymous ? undefined : donorEmail || undefined,
          isAnonymous,
          termsAccepted: true,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initiate transaction");
      }

      // 2. Open Razorpay Checkout or mock test verification
      if (typeof window !== "undefined" && (window as any).Razorpay && orderData.keyId) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: "INR",
          name: "Eye The Wealth",
          description: `Contribution for ${ngoName}`,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            // Verify HMAC signature
            const verifyRes = await fetch("/api/v1/contributor/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: orderData.donationId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccessReceipt(verifyData.receiptUrl);
            } else {
              setErrorMsg(verifyData.error || "Payment signature verification failed.");
            }
          },
          prefill: {
            name: donorName,
            email: donorEmail,
          },
          theme: {
            color: "#000000",
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct simulation verify in test mode
        const verifyRes = await fetch("/api/v1/contributor/donations/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donationId: orderData.donationId,
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_test_${Date.now()}`,
            razorpaySignature: "mock_test_signature",
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setSuccessReceipt(verifyData.receiptUrl);
        } else {
          setErrorMsg(verifyData.error || "Verification error");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-black p-6 bg-white space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
            CONTRIBUTION & SUPPORT
          </span>
          <h2 className="text-xl font-black tracking-tight text-black flex items-center gap-2">
            <Heart size={18} className="fill-black" /> Support {ngoName}
          </h2>
        </div>

        {canDonateViaEtw && isTestMode && (
          <span className="border border-black bg-neutral-100 text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase self-start sm:self-auto">
            TEST MODE — No real money moves
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Option 1: Official NGO Page (DEFAULT) */}
        {officialDonationUrl && (
          <div className="flex-1 border border-neutral-300 p-4 bg-neutral-50 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block mb-1">
                RECOMMENDED • DIRECT DISBURSEMENT
              </span>
              <h3 className="font-bold text-sm text-black">
                Donate on NGO&apos;s Official Portal
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                100% of your funds go directly to the organisation without any platform intermediary.
              </p>
            </div>
            <a
              href={officialDonationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              Go to Official Donation Page <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Option 2: Donate via ETW (If verified & enabled) */}
        {canDonateViaEtw && (
          <div className="flex-1 border-2 border-black p-4 bg-white flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-black block mb-1">
                PLATFORM-RECORDED
              </span>
              <h3 className="font-bold text-sm text-black">
                Contribute via ETW Intermediary
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Secured via Razorpay (INR domestic only). Generates an immutable platform record.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-black text-white hover:bg-neutral-800 transition-colors text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={14} /> Donate via ETW
            </button>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex justify-between items-start border-b-2 border-black pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
                  ETW CONTRIBUTOR
                </span>
                <h3 className="text-lg font-black text-black">
                  Contribute to {ngoName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSuccessReceipt(null);
                  setErrorMsg("");
                }}
                className="text-neutral-500 hover:text-black font-mono font-bold text-sm p-1"
              >
                ✕ Close
              </button>
            </div>

            {successReceipt ? (
              <div className="p-6 border-2 border-black bg-neutral-50 text-center space-y-4">
                <CheckCircle2 size={36} className="mx-auto text-black" />
                <h4 className="font-black text-base uppercase tracking-tight">
                  Contribution Confirmed!
                </h4>
                <p className="text-xs text-neutral-600">
                  Your transaction has been recorded. You can view or print your official acknowledgment receipt below:
                </p>
                <Link
                  href={successReceipt}
                  className="inline-block px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider"
                >
                  View Digital Receipt →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleStartDonation} className="space-y-4 text-xs font-sans">
                {isTestMode && (
                  <div className="p-2.5 bg-neutral-100 border border-black font-mono text-[11px] text-neutral-700">
                    ⚠ TEST MODE ACTIVE: Simulated transaction. No actual currency will be debited.
                  </div>
                )}

                {/* Amount presets */}
                <div>
                  <label className="block font-mono uppercase font-bold text-neutral-600 mb-2">
                    Select Contribution Amount (INR ₹)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setAmount(p);
                          setCustomAmount("");
                        }}
                        className={`py-2 font-mono font-bold border transition-colors ${
                          amount === p && !customAmount
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-neutral-300 hover:border-black"
                        }`}
                      >
                        ₹{p.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={100}
                    max={100000}
                    placeholder="Or enter custom amount in ₹ (min ₹100, max ₹1,00,000)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full p-2 border border-black font-mono text-xs focus:outline-none"
                  />
                </div>

                {/* Donor fields */}
                <div className="space-y-3 pt-2 border-t border-neutral-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anon"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="anon" className="font-mono text-neutral-800 cursor-pointer">
                      Donate anonymously (Hide name &amp; details from public records)
                    </label>
                  </div>

                  {!isAnonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-neutral-600 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full p-2 border border-neutral-300 focus:border-black font-sans text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-neutral-600 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder="for digital receipt"
                          className="w-full p-2 border border-neutral-300 focus:border-black font-sans text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms consent */}
                <div className="pt-2 border-t border-neutral-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-[11px] text-neutral-600 leading-tight cursor-pointer">
                      I agree to the{" "}
                      <Link href="/donation-terms" target="_blank" className="underline font-bold text-black">
                        Donation Terms
                      </Link>{" "}
                      and understand that ETW is an educational intermediary, this digital receipt is not an 80G tax exemption certificate, and donations are subject to statutory intermediary limits.
                    </label>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2 border border-black bg-neutral-100 text-black font-mono text-[11px]">
                    {errorMsg}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-black text-black font-mono font-bold uppercase text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-black text-white font-mono font-bold uppercase text-xs hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : `Proceed with ₹${effectiveAmount || 0}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
