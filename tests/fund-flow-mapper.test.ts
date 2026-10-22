/**
 * Unit Tests for Fund Flow Graph pure mapper & formatters
 * Test-only fixtures; zero real or sample database records.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
  formatIndianRupee,
  mapEntitiesAndRelationshipsToGraph,
  wouldCreateCycle,
} from "../lib/graph/fund-flow-mapper.ts";
import type { GraphEntity, GraphRelationship } from "../lib/graph/fund-flow-mapper.ts";

test("formatIndianRupee formats Indian currency correctly", () => {
  assert.equal(formatIndianRupee(2500000), "₹25,00,000");
  assert.equal(formatIndianRupee(100000), "₹1,00,000");
  assert.equal(formatIndianRupee(500), "₹500");
  assert.equal(formatIndianRupee(0), "₹0");
  assert.equal(formatIndianRupee(null), "Not publicly disclosed");
  assert.equal(formatIndianRupee(undefined), "Not publicly disclosed");
  assert.equal(formatIndianRupee(12345678), "₹1,23,45,678");
});

test("wouldCreateCycle detects directed cycles", () => {
  const adj = new Map<string, Set<string>>();
  adj.set("A", new Set(["B"]));
  adj.set("B", new Set(["C"]));

  // C -> A would create a cycle A -> B -> C -> A
  assert.equal(wouldCreateCycle("C", "A", adj), true);
  // C -> D would not create a cycle
  assert.equal(wouldCreateCycle("C", "D", adj), false);
  // Self loop A -> A is a cycle
  assert.equal(wouldCreateCycle("A", "A", adj), true);
});

test("mapEntitiesAndRelationshipsToGraph maps entities, edges and flags", () => {
  const testEntities: GraphEntity[] = [
    { id: "corp-1", name: "Alpha Corp", type: "company", location: "Mumbai" },
    { id: "ngo-1", name: "Beta Foundation", type: "NGO", location: "Pune" },
  ];

  const testRelationships: GraphRelationship[] = [
    {
      id: "rel-1",
      from: "corp-1",
      to: "ngo-1",
      amount: 5000000,
      currency: "INR",
      date: "2024",
      verified: true,
      source: "MCA CSR Portal",
      sourceUrl: "https://example.com/csr",
    },
    {
      id: "rel-2",
      from: "ngo-1",
      to: "?", // Gap node
      amount: null,
      verified: false,
      isGap: true,
      gapExplanation: "Sub-grant beneficiary undisclosed",
    },
  ];

  const result = mapEntitiesAndRelationshipsToGraph(testEntities, testRelationships);

  assert.equal(result.hasCycles, false);
  // Should have corp-1, ngo-1, plus gap node
  assert.equal(result.nodes.length, 3);

  const gapNode = result.nodes.find((n) => n.type === "gap");
  assert.ok(gapNode, "Gap node must exist");
  assert.equal(gapNode.data.label, "Not publicly traceable");
  assert.equal(gapNode.data.gapExplanation, "Sub-grant beneficiary undisclosed");

  // Edges check
  assert.equal(result.edges.length, 2);
  const solidEdge = result.edges.find((e) => e.id === "rel-1");
  assert.ok(solidEdge);
  assert.equal(solidEdge.data.isVerified, true);
  assert.equal(solidEdge.data.amount, 5000000);

  const gapEdge = result.edges.find((e) => e.id === "rel-2");
  assert.ok(gapEdge);
  assert.equal(gapEdge.data.isGap, true);
  assert.equal(gapEdge.data.isVerified, false);
});

test("mapEntitiesAndRelationshipsToGraph gracefully handles missing entities and cycles", () => {
  const testEntities: GraphEntity[] = []; // empty entities list

  const cyclicRels: GraphRelationship[] = [
    { from: "X", to: "Y", verified: true },
    { from: "Y", to: "Z", verified: true },
    { from: "Z", to: "X", verified: true }, // cycle!
  ];

  const result = mapEntitiesAndRelationshipsToGraph(testEntities, cyclicRels);

  // Missing entities X, Y, Z should be auto-stubbed
  assert.equal(result.nodes.length, 3);
  assert.equal(result.edges.length, 3);
  assert.equal(result.hasCycles, true, "Should report hasCycles=true");
});
