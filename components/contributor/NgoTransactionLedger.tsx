"use client";

import React, { useState, useMemo } from "react";
import { formatInr } from "@/lib/format";
import { Download, Search, AlertCircle, ExternalLink } from "lucide-react";

export interface LedgerTransaction {
  id: string;
  date: Date | string | null;
  financialYear?: string | null;
  amount: number | null;
  currency?: string | null;
  senderName: string | null;
  recipientName: string | null;
  transactionType: string | null;
  purpose?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  sourceClassification?: string | null;
  verificationStatus: string;
}

interface Props {
  ngoName: string;
  transactions: LedgerTransaction[];
}

export function NgoTransactionLedger({ ngoName, transactions }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [directionFilter, setDirectionFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Search text in counterparty or purpose or source
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const sender = (tx.senderName || "").toLowerCase();
        const recipient = (tx.recipientName || "").toLowerCase();
        const purpose = (tx.purpose || "").toLowerCase();
        const source = (tx.sourceName || "").toLowerCase();
        if (!sender.includes(q) && !recipient.includes(q) && !purpose.includes(q) && !source.includes(q)) {
          return false;
        }
      }

      // Min amount
      if (minAmount) {
        const val = parseFloat(minAmount);
        if (!isNaN(val) && (tx.amount == null || tx.amount < val)) {
          return false;
        }
      }

      // Direction
      if (directionFilter === "INFLOW" && tx.recipientName !== ngoName && tx.recipientName != null) {
        return false;
      }
      if (directionFilter === "OUTFLOW" && tx.senderName !== ngoName && tx.senderName != null) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, minAmount, directionFilter, ngoName]);

  const handleExportCsv = () => {
    const headers = [
      "Date",
      "Financial Year",
      "Amount (INR)",
      "Transaction Type",
      "Sender / Donor",
      "Recipient",
      "Purpose",
      "Source Name",
      "Source URL",
      "Source Classification",
      "Verification Status"
    ];

    const rows = filtered.map(tx => [
      tx.date ? new Date(tx.date).toISOString().split("T")[0] : "",
      tx.financialYear || "",
      tx.amount != null ? tx.amount.toString() : "",
      tx.transactionType || "Funding",
      `"${(tx.senderName || "Not publicly disclosed").replace(/"/g, '""')}"`,
      `"${(tx.recipientName || ngoName).replace(/"/g, '""')}"`,
      `"${(tx.purpose || "").replace(/"/g, '""')}"`,
      `"${(tx.sourceName || "").replace(/"/g, '""')}"`,
      tx.sourceUrl || "",
      tx.sourceClassification || "Public record",
      tx.verificationStatus || "VERIFIED"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeName = ngoName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    link.setAttribute("download", `${safeName}-verified-transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Mandatory Disclaimer Banner */}
      <div className="border-2 border-black p-4 bg-[#f5f5f5] text-xs font-mono text-black leading-relaxed">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-black" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-0.5">
              LEGAL NOTICE &amp; DISCLAIMER:
            </span>
            Transaction data is compiled from public disclosures, annual reports, and donor returns.
            Antigravity/ETW does not independently audit banking records.
          </div>
        </div>
      </div>

      {/* Filter / Search Bar + CSV Export */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search counterparty, purpose, donor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-black font-mono focus:outline-none"
            />
          </div>

          <input
            type="number"
            placeholder="Min ₹ amount..."
            value={minAmount}
            onChange={e => setMinAmount(e.target.value)}
            className="w-28 px-2 py-1.5 text-xs border border-black font-mono focus:outline-none"
          />

          <select
            value={directionFilter}
            onChange={e => setDirectionFilter(e.target.value)}
            className="px-2 py-1.5 text-xs border border-black font-mono bg-white focus:outline-none"
          >
            <option value="ALL">All Flows</option>
            <option value="INFLOW">Inflows Only</option>
            <option value="OUTFLOW">Outflows Only</option>
          </select>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
        >
          <Download size={13} />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-gray-400 p-8 text-center text-xs font-mono text-gray-600 bg-[#fafafa]">
          {transactions.length === 0
            ? "No individual publicly disclosed transactions on record for this organisation."
            : "No transactions matched the search/filter criteria."}
        </div>
      ) : (
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-black text-white font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 border-r border-gray-700">Date / FY</th>
                <th className="p-3 border-r border-gray-700">Amount (INR)</th>
                <th className="p-3 border-r border-gray-700">Counterparty / Donor</th>
                <th className="p-3 border-r border-gray-700">Purpose</th>
                <th className="p-3 border-r border-gray-700">Source Filing</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-mono border-r border-gray-200 whitespace-nowrap">
                    {tx.date
                      ? new Date(tx.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : tx.financialYear || "—"}
                  </td>
                  <td className="p-3 font-mono font-bold text-black border-r border-gray-200 whitespace-nowrap">
                    {formatInr(tx.amount)}
                  </td>
                  <td className="p-3 font-medium border-r border-gray-200">
                    <span className="font-bold">{tx.senderName || "Not publicly disclosed"}</span>
                    {tx.recipientName && tx.recipientName !== ngoName && (
                      <span className="block text-[11px] text-gray-500 font-mono">
                        &rarr; {tx.recipientName}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-700 border-r border-gray-200 max-w-xs">
                    {tx.purpose || "General charitable allocation"}
                  </td>
                  <td className="p-3 border-r border-gray-200 text-xs font-mono">
                    {tx.sourceUrl ? (
                      <a
                        href={tx.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold text-black hover:text-gray-600 inline-flex items-center gap-1"
                      >
                        {tx.sourceName || "Filing"} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span>{tx.sourceName || "—"}</span>
                    )}
                    <span className="block text-[10px] text-gray-500 uppercase mt-0.5">
                      {tx.sourceClassification || "Public record"}
                    </span>
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
    </div>
  );
}
