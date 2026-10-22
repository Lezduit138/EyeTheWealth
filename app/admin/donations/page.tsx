/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatIndianRupee } from "@/lib/graph/fund-flow-mapper";
import { Download, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [msg, setMsg] = useState("");
  const [refundModal, setRefundModal] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/donations");
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
      } else {
        setMsg(data.error || "Failed to load donations");
      }
    } catch {
      setMsg("Network error loading donations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/v1/admin/donations");
        const data = await res.json();
        if (!ignore) {
          if (data.success) {
            setDonations(data.data);
          } else {
            setMsg(data.error || "Failed to load donations");
          }
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setMsg("Network error loading donations");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefund = async () => {
    if (!refundModal || !refundReason.trim()) return;
    setRefunding(true);

    try {
      const res = await fetch(`/api/v1/admin/donations/${refundModal.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✓ Refund processed successfully for #${refundModal.id.substring(0, 8)}`);
        setRefundModal(null);
        setRefundReason("");
        fetchDonations();
      } else {
        setMsg(`❌ Refund failed: ${data.error}`);
      }
    } catch {
      setMsg("❌ Network error processing refund");
    } finally {
      setRefunding(false);
    }
  };

  const filtered = donations.filter((d) => {
    if (filter === "ALL") return true;
    return d.status === filter;
  });

  const exportCsv = () => {
    if (donations.length === 0) return;
    const headers = [
      "ID",
      "Date",
      "NGO",
      "AmountINR",
      "Status",
      "IsAnonymous",
      "DonorName",
      "DonorEmail",
      "RazorpayOrderId",
      "RazorpayPaymentId",
      "IsTestMode",
    ];
    const rows = donations.map((d) => [
      d.id,
      new Date(d.createdAt).toISOString(),
      `"${d.ngo?.name || ""}"`,
      d.amountPaise / 100,
      d.status,
      d.isAnonymous,
      `"${d.donorName || ""}"`,
      `"${d.donorEmail || ""}"`,
      d.razorpayOrderId || "",
      d.razorpayPaymentId || "",
      d.isTestMode,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `etw_donations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="etw-page">
      <div className="etw-container max-w-7xl py-8">
        <div className="pb-6 border-b-2 border-black mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <Link
              href="/admin"
              className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 hover:text-black flex items-center gap-1 mb-2"
            >
              <ArrowLeft size={12} /> Back to Admin
            </Link>
            <h1 className="text-3xl font-black tracking-tight">DONATION MANAGEMENT</h1>
            <p className="text-xs font-mono text-neutral-600 mt-1">
              Razorpay reconciliation, audit logs, refunds, and transparency records
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="px-3 py-1.5 border-2 border-black text-black hover:bg-neutral-100 text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              type="button"
              onClick={fetchDonations}
              className="px-3 py-1.5 border-2 border-black bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {msg && (
          <div className="mb-6 p-3 border-2 border-black bg-neutral-50 font-mono text-xs font-bold">
            {msg}
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex gap-2 mb-6">
          {["ALL", "PAID", "CREATED", "FAILED", "REFUNDED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase border transition-colors ${
                filter === st
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-neutral-300 hover:border-black"
              }`}
            >
              {st} ({st === "ALL" ? donations.length : donations.filter((d) => d.status === st).length})
            </button>
          ))}
        </div>

        {/* Donations Table */}
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-neutral-500">
            Loading donation records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-neutral-300 p-12 text-center font-mono text-xs text-neutral-500">
            No donation records found.
          </div>
        ) : (
          <div className="border-2 border-black overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-black">
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Date</th>
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Beneficiary NGO</th>
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Amount</th>
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Status</th>
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Donor</th>
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Mode</th>
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Receipt</th>
                  <th className="p-3 font-mono font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const isPaid = d.status === "PAID";
                  const isRefunded = d.status === "REFUNDED";

                  return (
                    <tr key={d.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="p-3 font-mono text-neutral-600">
                        {new Date(d.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3 font-bold">{d.ngo?.name || "Unknown"}</td>
                      <td className="p-3 font-mono font-bold text-neutral-900">
                        {formatIndianRupee(d.amountPaise / 100, d.currency)}
                      </td>
                      <td className="p-3 font-mono">
                        <span
                          className={`px-2 py-0.5 font-bold uppercase text-[10px] ${
                            isPaid
                              ? "bg-black text-white"
                              : isRefunded
                              ? "bg-neutral-300 text-neutral-800"
                              : "border border-neutral-400 text-neutral-600"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-700">
                        {d.isAnonymous ? (
                          <span className="font-mono text-neutral-500 italic">Anonymous</span>
                        ) : (
                          d.donorName || d.donorEmail || "Supporter"
                        )}
                      </td>
                      <td className="p-3 font-mono text-[10px]">
                        {d.isTestMode ? (
                          <span className="text-amber-700 font-bold">TEST</span>
                        ) : (
                          <span className="text-black font-bold">LIVE</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {d.receiptUrl ? (
                          <Link href={d.receiptUrl} className="underline hover:text-neutral-600">
                            View ↗
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3">
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundModal(d);
                              setRefundReason("");
                            }}
                            className="px-2 py-1 border border-black hover:bg-black hover:text-white font-mono text-[10px] font-bold uppercase transition-colors"
                          >
                            Refund
                          </button>
                        )}
                        {isRefunded && (
                          <span className="text-neutral-500 font-mono text-[10px]">
                            Refunded {d.refundedAt ? new Date(d.refundedAt).toLocaleDateString() : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Refund Dialog */}
        {refundModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <h3 className="font-bold text-base uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle size={16} /> Confirm Refund
                </h3>
                <button
                  type="button"
                  onClick={() => setRefundModal(null)}
                  className="text-neutral-500 hover:text-black font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-neutral-500">Donation ID:</span>{" "}
                  <span className="font-bold">{refundModal.id}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Amount:</span>{" "}
                  <span className="font-bold">
                    {formatIndianRupee(refundModal.amountPaise / 100, refundModal.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Beneficiary:</span>{" "}
                  <span className="font-bold">{refundModal.ngo?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-700 mb-1">
                  Refund Reason (Required for audit log &amp; gateway)
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Duplicate charge requested by donor on 22 Oct 2026"
                  className="w-full p-2 border border-black font-sans text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setRefundModal(null)}
                  className="px-3 py-1.5 border border-black text-xs font-mono font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={refunding || refundReason.trim().length < 5}
                  className="px-4 py-1.5 bg-black text-white text-xs font-mono font-bold uppercase disabled:opacity-50 hover:bg-neutral-800"
                >
                  {refunding ? "Processing..." : "Confirm & Execute Refund"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
