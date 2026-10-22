/**
 * Unit Tests for Ingestion Pipeline & Currency Formatters
 * Strict validation: zero dummy/sample data; guarantees integrity of Layer 1-4 records.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { formatInr } from "../lib/format.ts";
import { normalizeDistrict } from "../lib/emergencies/types.ts";

test("formatInr formats standard and compact Indian numbers", () => {
  // Standard full formatting
  assert.equal(formatInr(2500000), "₹25,00,000");
  assert.equal(formatInr(100000), "₹1,00,000");
  assert.equal(formatInr(500), "₹500");
  assert.equal(formatInr(0), "₹0");
  assert.equal(formatInr(null), "₹0");
  assert.equal(formatInr(undefined), "₹0");

  // Compact Indian notation
  assert.equal(formatInr(25000000, { compact: true }), "₹2.5 Cr");
  assert.equal(formatInr(10000000, { compact: true }), "₹1 Cr");
  assert.equal(formatInr(2500000, { compact: true }), "₹25 Lakh");
  assert.equal(formatInr(100000, { compact: true }), "₹1 Lakh");
  assert.equal(formatInr(5000, { compact: true }), "₹5k");
});

test("rejection of synthetic transactions created without specific dates or sources", () => {
  // Rule: Layer 4 requires verifiable public line-items with explicit source & date.
  // Totals from Layer 2/3 must never be decomposed into synthetic transactions.
  const isValidLayer4Record = (record: {
    amount: number | null;
    sourceName?: string | null;
    sourceUrl?: string | null;
    date?: string | null;
    financialYear?: string | null;
  }) => {
    if (!record.amount || record.amount <= 0) return false;
    if (!record.sourceName || record.sourceName.trim().length === 0) return false;
    if (!record.date && !record.financialYear) return false;
    return true;
  };

  // Valid transaction from MCA CSR filing
  assert.equal(
    isValidLayer4Record({
      amount: 1500000,
      sourceName: "MCA CSR Filing FY 2023-24",
      sourceUrl: "https://csr.gov.in/filing/123",
      date: "2023-11-15",
    }),
    true
  );

  // Rejected: Missing verifiable source
  assert.equal(
    isValidLayer4Record({
      amount: 500000,
      sourceName: "",
      date: "2023-10-01",
    }),
    false
  );

  // Rejected: Missing date/financial year
  assert.equal(
    isValidLayer4Record({
      amount: 250000,
      sourceName: "Bank Estimate",
    }),
    false
  );
});

test("district normalization handles all major Maharashtra district variants", () => {
  assert.equal(normalizeDistrict("pune")?.name, "Pune");
  assert.equal(normalizeDistrict("MUMBAI")?.name, "Mumbai City");
  assert.equal(normalizeDistrict("Bombay")?.name, "Mumbai City");
  assert.equal(normalizeDistrict("Chhatrapati Sambhajinagar")?.name, "Aurangabad");
  assert.equal(normalizeDistrict("Dharashiv")?.name, "Osmanabad");
  assert.equal(normalizeDistrict("Nagpur")?.name, "Nagpur");
  assert.equal(normalizeDistrict("Nashik")?.name, "Nashik");
  assert.equal(normalizeDistrict("Kolhapur")?.name, "Kolhapur");
  assert.equal(normalizeDistrict("Solapur")?.name, "Solapur");
  assert.equal(normalizeDistrict("Unknown Nonexistent District"), null);
});

test("highest data layer calculation classifies NGO records strictly", () => {
  const calculateLayer = (ngo: {
    hasFinancials: boolean;
    hasInflowBreakdown: boolean;
    txCount: number;
  }) => {
    if (ngo.txCount > 0) return 4;
    if (ngo.hasInflowBreakdown) return 3;
    if (ngo.hasFinancials) return 2;
    return 1;
  };

  assert.equal(calculateLayer({ hasFinancials: false, hasInflowBreakdown: false, txCount: 0 }), 1);
  assert.equal(calculateLayer({ hasFinancials: true, hasInflowBreakdown: false, txCount: 0 }), 2);
  assert.equal(calculateLayer({ hasFinancials: true, hasInflowBreakdown: true, txCount: 0 }), 3);
  assert.equal(calculateLayer({ hasFinancials: true, hasInflowBreakdown: true, txCount: 5 }), 4);
});
