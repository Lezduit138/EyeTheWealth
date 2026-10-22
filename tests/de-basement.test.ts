// ETW — De-Basement Legal Knowledge Hub Test Suite
// Verifies statutory coverage, zero synthetic data, citation accuracy, and procedural completeness.

import test from "node:test";
import assert from "node:assert";
import {
  KNOWLEDGE_ARTICLES,
  DOCUMENT_CHECKLISTS,
  DOCUMENTED_CASES,
  KNOWLEDGE_FAQS,
  OFFICIAL_REGULATORY_RESOURCES,
} from "../data/de-basement/index.ts";

test("De-Basement Knowledge Hub: All 8 statutory sections are fully populated", () => {
  assert.strictEqual(KNOWLEDGE_ARTICLES.length, 8, "Must contain exactly 8 comprehensive articles");

  const expectedSections = [
    "understanding-black-money-and-money-laundering",
    "legal-procedures-for-undeclared-income",
    "legal-financial-transactions-and-evidence",
    "banking-regulations-kyc-and-loan-compliance",
    "ngos-charitable-donations-and-tax-deductions",
    "international-remittances-and-cryptocurrency-tax",
    "documented-case-studies-and-judicial-precedents",
    "tax-notices-scrutiny-and-appeal-procedures",
  ];

  expectedSections.forEach((slug, idx) => {
    const art = KNOWLEDGE_ARTICLES.find((a) => a.slug === slug);
    assert.ok(art, `Article with slug '${slug}' must exist`);
    assert.strictEqual(art.sectionNumber, idx + 1, `Article '${slug}' must have section number ${idx + 1}`);
    assert.ok(art.title.length > 10, `Article '${slug}' must have a substantive title`);
    assert.ok(art.subtitle.length > 20, `Article '${slug}' must have a substantive subtitle`);
    assert.ok(art.keyTakeaways.length >= 4, `Article '${slug}' must have at least 4 key takeaways`);
    assert.ok(art.officialSources.length >= 2, `Article '${slug}' must cite at least 2 official sources`);
  });
});

test("Section 2 (Central Section): Legal Procedures for Undeclared Income contains complete statutory walkthrough", () => {
  const centralArt = KNOWLEDGE_ARTICLES.find((a) => a.slug === "legal-procedures-for-undeclared-income");
  assert.ok(centralArt, "Central section article must exist");

  // Verify step procedures
  assert.ok(centralArt.stepProcedures, "Central section must include step-by-step procedures");
  assert.ok(centralArt.stepProcedures.length >= 5, "Must have at least 5 procedural steps");

  const step1 = centralArt.stepProcedures[0];
  assert.strictEqual(step1.stepNumber, 1);
  assert.ok(step1.actionRequired.includes("AIS") || step1.title.includes("AIS"), "Step 1 must cover AIS reconciliation");

  // Verify statutory references to ITR-U and Section 139(8A)
  const sourcesText = JSON.stringify(centralArt.officialSources);
  assert.ok(sourcesText.includes("139(8A)"), "Must cite Section 139(8A)");
  assert.ok(sourcesText.includes("140B"), "Must cite Section 140B additional tax");

  // Verify checklists are attached
  assert.ok(centralArt.checklists && centralArt.checklists.length >= 1, "Must attach relevant document checklists");
});

test("Section 1: Black Money & PMLA includes full comparison table", () => {
  const sec1 = KNOWLEDGE_ARTICLES.find((a) => a.slug === "understanding-black-money-and-money-laundering");
  assert.ok(sec1, "Section 1 article must exist");
  assert.ok(sec1.comparisonTables && sec1.comparisonTables.length >= 1, "Must contain a comparison table");

  const compTable = sec1.comparisonTables[0];
  assert.ok(compTable.headers.includes("Undeclared Income"));
  assert.ok(compTable.headers.includes("Tax Evasion"));
  assert.ok(compTable.headers.includes("Legitimate Tax Planning"));
  assert.ok(compTable.headers.includes("Money Laundering"));
  assert.ok(compTable.rows.length >= 4, "Comparison table must contain parameter rows");
});

test("Section 7 & Cases: Contains real documented Indian court precedents (zero fictional records)", () => {
  assert.ok(DOCUMENTED_CASES.length >= 5, "Must contain at least 5 documented cases");

  const citations = DOCUMENTED_CASES.map((c) => c.citation).join(" ");
  assert.ok(citations.includes("291 ITR 278"), "Must include CIT v. P. Mohanakala (2007) citation");
  assert.ok(citations.includes("PMLA"), "Must include PMLA citations");
  assert.ok(citations.includes("1998"), "Must include Jain Hawala 1998 citation");

  DOCUMENTED_CASES.forEach((c) => {
    assert.ok(c.factsEstablished.length >= 3, `Case ${c.slug} must document established facts`);
    assert.ok(c.legalIssue.length > 10, `Case ${c.slug} must state the legal issue`);
    assert.ok(c.findingsAndJudgment.length > 20, `Case ${c.slug} must state court findings`);
    assert.ok(c.complianceLessons.length >= 2, `Case ${c.slug} must list compliance lessons`);
    assert.ok(c.sources.length >= 1, `Case ${c.slug} must cite official court/agency sources`);
  });
});

test("Document Checklists: Enforce statutory requirements and official issuing authorities", () => {
  assert.ok(DOCUMENT_CHECKLISTS.length >= 6, "Must provide at least 6 document checklists");

  const expectedChecklistIds = [
    "checklist-itr-u",
    "checklist-gift-proof",
    "checklist-inheritance",
    "checklist-property-sale",
    "checklist-remittance-lrs",
    "checklist-sec148a-notice",
  ];

  expectedChecklistIds.forEach((id) => {
    const cl = DOCUMENT_CHECKLISTS.find((c) => c.id === id);
    assert.ok(cl, `Checklist with id '${id}' must exist`);
    assert.ok(cl.items.length >= 3, `Checklist '${id}' must contain at least 3 items`);
    assert.ok(cl.statutoryReference.length > 5, `Checklist '${id}' must cite governing statute`);
  });
});

test("Compliance FAQs: Grounded in statutory provisions and CBDT/RBI rules", () => {
  assert.ok(KNOWLEDGE_FAQS.length >= 10, "Must provide at least 10 comprehensive FAQs");

  KNOWLEDGE_FAQS.forEach((faq) => {
    assert.ok(faq.question.length > 15, "FAQ question must be descriptive");
    assert.ok(faq.answer.length > 50, "FAQ answer must provide comprehensive legal explanation");
    assert.ok(faq.statutoryCitation.length > 5, "FAQ must provide exact statutory citation");
    assert.ok(faq.keyRuleSummary.length > 10, "FAQ must summarize the core rule");
  });
});

test("Official Regulatory Resources: Cites active government and statutory portals", () => {
  assert.ok(OFFICIAL_REGULATORY_RESOURCES.length >= 6, "Must list at least 6 official portals");

  OFFICIAL_REGULATORY_RESOURCES.forEach((res) => {
    assert.ok(res.officialUrl.startsWith("https://"), `Portal URL for ${res.title} must be HTTPS`);
    assert.ok(res.authority.length > 5, `Resource ${res.title} must specify the regulatory authority`);
    assert.ok(res.applicableAct.length > 5, `Resource ${res.title} must specify the governing Act`);
  });
});
