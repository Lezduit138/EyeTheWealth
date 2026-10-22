// ETW — De-Basement Comprehensive Knowledge Articles Repository
// Rigorous, citation-backed educational articles on legal money regularization under Indian law.

import type { KnowledgeArticle } from "./types.ts";
import { DOCUMENT_CHECKLISTS } from "./checklists.ts";
import { DOCUMENTED_CASES } from "./cases.ts";
import { KNOWLEDGE_FAQS } from "./faqs.ts";

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "art-1",
    slug: "understanding-black-money-and-money-laundering",
    sectionNumber: 1,
    sectionTitle: "UNDERSTANDING BLACK MONEY & MONEY LAUNDERING",
    title: "Black Money, Undeclared Income & Money Laundering: Statutory Definitions and Legal Frameworks",
    subtitle:
      "A rigorous analysis of how Indian jurisprudence defines undeclared wealth, the legal boundary between tax non-compliance and money laundering, and how financial intelligence agencies detect illicit funds.",
    readingTimeMinutes: 14,
    lastVerifiedDate: "October 2026",
    verificationBadge: "STATUTORY_VERIFIED",
    summary:
      "This foundational guide dissects the critical legal distinctions between undeclared income, tax evasion, legitimate tax planning, and money laundering under Indian law. It explains why moving funds through banking channels does not validate their source, reviews the investigative architecture of FIU-IND and CBDT's Project Insight, and details the severe penalties under the Income Tax Act, PMLA 2002, and the Black Money Act 2015.",
    keyTakeaways: [
      "Undeclared income arises from non-reporting of otherwise lawful earnings; money laundering involves concealing or legitimizing the 'proceeds of crime' derived from a scheduled predicate offense.",
      "The Supreme Court of India has firmly established that channeling funds through bank accounts, cheques, or demand drafts does not establish the lawful source of money (CIT v. P. Mohanakala).",
      "Financial authorities (FIU-IND, CBDT Insight, ED) utilize automated reporting matrices including Cash Transaction Reports (CTR), Suspicious Transaction Reports (STR), and AIS data synthesis.",
      "Unexplained cash credits and investments are taxed at an effective flat rate of 78% under Section 115BBE with zero expense deductions and zero loss set-offs.",
      "The Black Money Act 2015 levies 30% tax plus 90% penalty (total 120%) alongside rigorous imprisonment up to 10 years for undisclosed foreign assets.",
    ],
    officialSources: [
      {
        name: "Income Tax Act, 1961",
        authority: "Legislative Department, Ministry of Law and Justice",
        url: "https://incometaxindia.gov.in",
        citationDate: "As amended up to Finance (No. 2) Act, 2024",
        statutoryReference: "Sections 68, 69, 69A, 69B, 69C, 115BBE, 270A, 276C",
      },
      {
        name: "Prevention of Money Laundering Act, 2002 (PMLA)",
        authority: "Ministry of Finance & Directorate of Enforcement",
        url: "https://enforcementdirectorate.gov.in",
        citationDate: "Act No. 15 of 2003 as amended",
        statutoryReference: "Sections 2(1)(u), 3, 4, 5, 24",
      },
      {
        name: "Black Money (Undisclosed Foreign Income and Assets) and Imposition of Tax Act, 2015",
        authority: "Ministry of Finance, Government of India",
        url: "https://incometaxindia.gov.in",
        citationDate: "Act No. 22 of 2015",
        statutoryReference: "Sections 3, 41, 42, 43, 50",
      },
      {
        name: "FIU-IND Annual AML/CFT Directives",
        authority: "Financial Intelligence Unit – India",
        url: "https://fiuindia.gov.in",
        citationDate: "Rule 3, 7, 8 of PML (Maintenance of Records) Rules 2005",
      },
    ],
    comparisonTables: [
      {
        title: "Comparative Legal Matrix: Legal Status, Intent, and Statutory Consequences",
        description:
          "Statutory boundary comparison under Indian criminal and direct tax jurisprudence.",
        headers: ["Parameter", "Undeclared Income", "Tax Evasion", "Legitimate Tax Planning", "Money Laundering"],
        rows: [
          {
            parameter: "Core Definition",
            undeclaredIncome: "Legitimate earnings (salary, trade, capital gain) omitted from tax returns due to oversight or timing.",
            taxEvasion: "Deliberate and fraudulent concealment of income or inflation of expenses to evade statutory tax liability.",
            legitimateTaxPlanning: "Structuring financial affairs within statutory provisions, deductions (e.g. 80C, 54, 10AA), and exemptions.",
            moneyLaundering: "Process of disguising the origin of 'proceeds of crime' derived from a scheduled criminal offense.",
          },
          {
            parameter: "Underlying Activity",
            undeclaredIncome: "Lawful business or economic activity; source of funds is legally generated.",
            taxEvasion: "Lawful or unlawful activity where reporting obligations are intentionally falsified.",
            legitimateTaxPlanning: "Lawful economic transactions fully disclosed and backed by genuine commercial substance.",
            moneyLaundering: "Predicate criminal activity (cheating, corruption, drug trafficking, cyber fraud, forgery under IPC/BNS).",
          },
          {
            parameter: "Governing Statutes",
            undeclaredIncome: "Income Tax Act, 1961 (Sections 139, 140B, 148, 156).",
            taxEvasion: "Income Tax Act, 1961 (Sections 270A, 271AAC, 276C) and relevant GST statutes.",
            legitimateTaxPlanning: "Income Tax Act, 1961 (Chapter VI-A, Section 10, Section 54 series).",
            moneyLaundering: "Prevention of Money Laundering Act, 2002 (PMLA) and Indian Penal Code / BNS.",
          },
          {
            parameter: "Intent / Mens Rea",
            undeclaredIncome: "May be negligent, erroneous, or inadvertent; civil liability primarily.",
            taxEvasion: "Willful intent to defraud public revenue; culpable mental state presumed under Section 278E.",
            legitimateTaxPlanning: "Bona fide intent to optimize tax burden strictly in compliance with statutory incentives.",
            moneyLaundering: "Intent to project tainted property derived from criminal activity as untainted.",
          },
          {
            parameter: "Legal Consequences",
            undeclaredIncome: "Payment of principal tax, statutory interest (234A/B/C), and late fees; rectifiable via ITR-U.",
            taxEvasion: "Tax at 78% (Sec 115BBE), 50% to 200% penalty (Sec 270A), and rigorous imprisonment up to 7 years.",
            legitimateTaxPlanning: "Zero penalty; lawful reduction of tax liability recognized by courts (McDowell doctrine).",
            moneyLaundering: "Provisional attachment of property (Sec 5), confiscation (Sec 8), rigorous imprisonment of 3 to 7 years (up to 10 for NDPS).",
          },
        ],
      },
    ],
    faqs: KNOWLEDGE_FAQS.filter((f) =>
      ["faq-itru-eligibility", "faq-amnesty-existence", "faq-sec115bbe-tax-rate", "faq-loan-myth"].includes(f.id)
    ),
    relatedSlugs: [
      "legal-procedures-for-undeclared-income",
      "legal-financial-transactions-and-evidence",
      "documented-case-studies-and-judicial-precedents",
    ],
  },
  {
    id: "art-2",
    slug: "legal-procedures-for-undeclared-income",
    sectionNumber: 2,
    sectionTitle: "LEGAL PROCEDURES FOR UNDECLARED INCOME",
    title: "Statutory Procedures for Reporting Undeclared Income, Return Correction & Reassessment",
    subtitle:
      "A comprehensive operational guide to Section 139(8A) Updated Returns (ITR-U), response protocols for Section 148 notices, establishing source of funds, and calculating interest and penalties.",
    readingTimeMinutes: 18,
    lastVerifiedDate: "October 2026",
    verificationBadge: "STATUTORY_VERIFIED",
    summary:
      "This central guide outlines the exact lawful procedures available under current Indian tax law to regularize omitted or under-reported income. It details the step-by-step requirements for filing an Updated Return (ITR-U), statutory timelines, additional tax calculations under Section 140B, protocols for responding to scrutiny notices under Section 143(2) and reassessment under Section 148A, and how to legally establish the evidentiary trail of funds.",
    keyTakeaways: [
      "An Updated Return under Section 139(8A) can be filed up to 24 months from the end of the relevant Assessment Year, accompanied by an additional tax of 25% (if filed within 12 months) or 50% (between 12 and 24 months).",
      "ITR-U cannot be used to declare a loss, increase a refund claim, reduce total tax liability, or in cases where search, survey, or Section 148 proceedings have already been initiated.",
      "India currently offers NO tax amnesty or voluntary disclosure immunity scheme; ITR-U is a voluntary compliance route that carries heavy financial penalties and does not protect against PMLA prosecution if funds stem from crime.",
      "Under the revised reassessment regime (Section 148/148A), notice cannot be issued after 3 years unless the Assessing Officer possesses tangible evidence that escaped income represented in the form of an asset exceeds Rs 50 Lakhs (extendable up to 10 years).",
      "Taxpayers have the statutory right under Section 288 to be represented by a certified Chartered Accountant or tax lawyer throughout e-proceedings.",
    ],
    officialSources: [
      {
        name: "Income Tax Act, 1961",
        authority: "Central Board of Direct Taxes, Ministry of Finance",
        url: "https://incometaxindia.gov.in",
        citationDate: "Updated under Finance Act 2024",
        statutoryReference: "Sections 139(8A), 140B, 142(1), 143(2), 148, 148A, 149, 234A, 234B, 234C, 270A, 271AAC",
      },
      {
        name: "CBDT Circular No. 12/2022 on Updated Return Guidelines",
        authority: "Central Board of Direct Taxes",
        url: "https://www.incometax.gov.in",
        citationDate: "June 2022",
        statutoryReference: "Rule 12AC of Income Tax Rules, 1962",
      },
      {
        name: "Income Tax e-Filing Helpdesk on ITR-U",
        authority: "Directorate of Systems, CBDT",
        url: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-itr-u",
        citationDate: "Verified October 2026",
      },
    ],
    stepProcedures: [
      {
        stepNumber: 1,
        title: "Reconcile Annual Information Statement (AIS) & Taxpayer Information Summary (TIS)",
        timeframe: "Immediate prerequisite before preparing computations",
        applicableLaw: "Income Tax Rules 1962, Rule 114-I",
        actionRequired:
          "Log in to the Income Tax e-Filing portal, navigate to the AIS tab, download the JSON and PDF for the targeted Financial Year, and cross-reference all high-value transactions, bank interest, share trading, and real estate purchases against past returns.",
        requiredDocuments: [
          "AIS and TIS summary reports",
          "Form 26AS tax credit statement",
          "Comprehensive bank statements for all operational accounts",
        ],
        officialResource: "e-Filing Portal > Services > Annual Information Statement (AIS)",
        potentialCostsOrPenalties: "Zero government fee for downloading AIS.",
        commonMistakesOrRisks:
          "Filing an ITR-U without reconciling AIS will cause automated mismatch flags in the Centralized Processing Centre (CPC), prompting immediate scrutiny.",
      },
      {
        stepNumber: 2,
        title: "Verify Statutory Eligibility for Updated Return (Section 139(8A))",
        timeframe: "Within 24 months from the end of the relevant Assessment Year",
        applicableLaw: "Income Tax Act 1961, Section 139(8A) provisos",
        actionRequired:
          "Verify that the filing meets all statutory conditions: (a) it must increase total taxable income or tax payable, (b) it must not claim an increased refund or loss, (c) no search (Sec 132), survey (Sec 133A), or notice under Sec 148 has been issued for that year.",
        requiredDocuments: [
          "Original return acknowledgment (if return was previously filed)",
          "Audit report under Sec 44AB (if business turnover limits crossed)",
        ],
        officialResource: "Income Tax Act, Section 139(8A)",
        potentialCostsOrPenalties: "Filing an ineligible ITR-U will render the return defective under Section 139(9).",
        commonMistakesOrRisks:
          "Attempting to file ITR-U after a notice under Section 148 has already been served; Section 139(8A) strictly bars filing after search or reassessment notice.",
      },
      {
        stepNumber: 3,
        title: "Compute Tax, Statutory Interest, and Section 140B Additional Tax",
        timeframe: "Prior to return submission",
        applicableLaw: "Income Tax Act 1961, Sections 140B, 234A, 234B, 234C",
        actionRequired:
          "Calculate: (1) Base tax on additional income at slab or special rates, (2) Interest under Section 234A (1% per month for delay in return), (3) Interest under Section 234B (1% per month for default in advance tax), (4) Interest under Section 234C. Then compute Section 140B Additional Tax: 25% of [aggregate tax + interest] if filed within 12 months; 50% if filed between 12 and 24 months.",
        requiredDocuments: [
          "Detailed CA Tax Computation Sheet",
          "Challan ITNS 280 (Minor Head 115 - Tax on Updated Return)",
        ],
        officialResource: "e-Filing Portal e-Pay Tax > Type of Payment: Minor Head 115",
        potentialCostsOrPenalties: "Additional 25% to 50% statutory surcharge on total tax plus interest.",
        commonMistakesOrRisks:
          "Calculating the 25% or 50% additional tax on base tax alone. The statute explicitly specifies additional tax is computed on [Tax + Interest].",
      },
      {
        stepNumber: 4,
        title: "Pay Tax via e-Pay Tax and Generate Challan Details",
        timeframe: "Before uploading the ITR-U form",
        applicableLaw: "Income Tax Act 1961, Section 140B(1)",
        actionRequired:
          "Execute payment through e-Pay Tax using net banking or RTGS/NEFT under Major Head 0021 (Income Tax other than Companies) and Minor Head 115 (Tax on Updated Return). Record the BSR Code, Challan Serial Number, and Date of Payment.",
        requiredDocuments: ["Official Challan Receipt with BSR Code and CIN"],
        officialResource: "e-Filing Portal > e-Pay Tax",
        commonMistakesOrRisks:
          "Paying under Minor Head 100 (Advance Tax) or 300 (Self-Assessment Tax). Challan must strictly bear Minor Head 115.",
      },
      {
        stepNumber: 5,
        title: "Prepare and Electronically File Form ITR-U",
        timeframe: "Before the 24-month statutory deadline expires",
        applicableLaw: "Income Tax Rules 1962, Rule 12AC",
        actionRequired:
          "Download the offline utility for the relevant Assessment Year, select 'Updated Return under Section 139(8A)', select the applicable reason code (e.g. 'Income not reported correctly', 'Unreported capital gains'), fill Part B-AT with challan details, generate JSON, and upload via DSC or Aadhaar OTP.",
        requiredDocuments: [
          "Completed ITR XML/JSON file",
          "Digital Signature Certificate (DSC) or Aadhaar-linked mobile for e-verification",
        ],
        officialResource: "e-Filing Portal > e-File > Income Tax Returns > File Income Tax Return",
        commonMistakesOrRisks:
          "Failure to e-verify the return immediately; an unverified ITR-U is treated as non-est (invalid).",
      },
    ],
    checklists: DOCUMENT_CHECKLISTS.filter((c) => ["checklist-itr-u", "checklist-sec148a-notice"].includes(c.id)),
    faqs: KNOWLEDGE_FAQS.filter((f) =>
      ["faq-itru-eligibility", "faq-amnesty-existence", "faq-sec115bbe-tax-rate", "faq-ca-legal-representation"].includes(f.id)
    ),
    relatedSlugs: [
      "understanding-black-money-and-money-laundering",
      "legal-financial-transactions-and-evidence",
      "tax-notices-scrutiny-and-appeal-procedures",
    ],
  },
  {
    id: "art-3",
    slug: "legal-financial-transactions-and-evidence",
    sectionNumber: 3,
    sectionTitle: "LEGAL FINANCIAL TRANSACTIONS & EVIDENTIARY REQUIREMENTS",
    title: "Conducting Lawful Financial Transactions: Banking Limits, Gifts, Loans & Real Estate Compliance",
    subtitle:
      "Statutory restrictions on cash dealings under Sections 269SS, 269T, and 269ST, circle rate rules under Section 50C, legitimate gift exemptions under Section 56(2)(x), and documenting business records.",
    readingTimeMinutes: 16,
    lastVerifiedDate: "October 2026",
    verificationBadge: "STATUTORY_VERIFIED",
    summary:
      "This section details how legitimate personal and business financial activities are regulated under Indian law. It covers the mandatory banking channels for loans and cash transactions, statutory thresholds under Section 269SS/T/ST, the tax treatment of gifts and inheritance, circle rate compliance in real estate sales under Section 50C, accounting obligations under Section 44AA, and why artificial structuring (sham loans, bogus gifts, fake invoices) constitutes criminal fraud.",
    keyTakeaways: [
      "Accepting or repaying loans/deposits of Rs 20,000 or more in cash is prohibited under Sections 269SS and 269T, attracting a 100% monetary penalty.",
      "Section 269ST prohibits receiving cash of Rs 2,00,000 or more from a person in a day, in respect of a single transaction, or relating to one event/occasion.",
      "Gifts from specified relatives are completely tax-free under Section 56(2)(x), but the donor's financial capacity and banking trail must be substantiated under Section 68.",
      "In real estate sales, if the sale agreement value is lower than the Stamp Duty Value (circle rate) by more than 10%, Section 50C deems the circle rate as the actual sale consideration for capital gains tax.",
      "Businesses crossing gross receipts of Rs 25 Lakhs (or income > Rs 2.5 Lakhs) must maintain formal books of account under Section 44AA.",
    ],
    officialSources: [
      {
        name: "Income Tax Act, 1961",
        authority: "Central Board of Direct Taxes",
        url: "https://incometaxindia.gov.in",
        citationDate: "Finance Act 2024",
        statutoryReference: "Sections 44AA, 44AB, 50C, 56(2)(x), 269SS, 269T, 269ST, 271D, 271E, 271DA",
      },
      {
        name: "CBDT Master Circular on Cash Transactions",
        authority: "Ministry of Finance",
        url: "https://incometaxindia.gov.in",
        citationDate: "Circular No. 22/2017",
      },
    ],
    checklists: DOCUMENT_CHECKLISTS.filter((c) =>
      ["checklist-gift-proof", "checklist-inheritance", "checklist-property-sale"].includes(c.id)
    ),
    faqs: KNOWLEDGE_FAQS.filter((f) =>
      ["faq-cash-deposits-sft", "faq-gifts-parents-relatives", "faq-cash-in-lockers-limits", "faq-ancestral-gold-jewelry"].includes(f.id)
    ),
    relatedSlugs: [
      "understanding-black-money-and-money-laundering",
      "banking-regulations-kyc-and-loan-compliance",
      "ngos-charitable-donations-and-tax-deductions",
    ],
  },
  {
    id: "art-4",
    slug: "banking-regulations-kyc-and-loan-compliance",
    sectionNumber: 4,
    sectionTitle: "BANKS, LOANS & FINANCIAL INSTITUTIONS",
    title: "Banking Compliance, KYC Architecture & The Fallacy of Loan Laundering",
    subtitle:
      "A forensic examination of RBI KYC Master Directions, SFT automated reporting, Enhanced Due Diligence (EDD), and why bank loans cannot regularize undeclared funds.",
    readingTimeMinutes: 13,
    lastVerifiedDate: "October 2026",
    verificationBadge: "RBI_MASTER_DIRECTION",
    summary:
      "Explains the regulatory architecture governing Scheduled Commercial Banks, Small Finance Banks, and NBFCs in India. It outlines customer due diligence protocols, reporting thresholds for cash deposits and credit cards under Rule 114E, loan underwriting procedures, and debunks the myth that borrowing from a bank can legitimize unexplained cash.",
    keyTakeaways: [
      "Banks operate under the RBI Master Direction on KYC (RBI/DBR/2015-16/18), enforcing continuous Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD) for high-risk accounts.",
      "Under Rule 114E, banks automatically report cash deposits exceeding Rs 10 Lakhs in savings accounts and Rs 50 Lakhs in current accounts directly to the Income Tax Department's Insight engine.",
      "Taking out a bank loan creates an enforceable repayment liability; servicing loan EMIs through unrecorded cash deposits triggers automated Suspicious Transaction Reports (STRs) under PMLA.",
      "Submitting falsified financial balance sheets, inflated turnover figures, or bogus tax returns to secure bank loans constitutes criminal cheating under Section 420 IPC / Section 318 BNS.",
      "Loan write-offs or corporate restructuring agreements do not extinguish tax liability or prevent ED scrutiny under Section 3 of PMLA.",
    ],
    officialSources: [
      {
        name: "Reserve Bank of India Master Direction – Know Your Customer (KYC) Direction, 2016",
        authority: "Department of Banking Regulation, RBI",
        url: "https://www.rbi.org.in",
        citationDate: "RBI/DBR/2015-16/18 Master Direction DBR.AML.BC.No.81/14.01.001/2015-16",
        statutoryReference: "Sections 35A of Banking Regulation Act 1949 & PMLA Rules 2005",
      },
      {
        name: "Prevention of Money Laundering (Maintenance of Records) Rules, 2005",
        authority: "Ministry of Finance",
        url: "https://fiuindia.gov.in",
        citationDate: "Notification No. 9/2005 as amended",
      },
    ],
    faqs: KNOWLEDGE_FAQS.filter((f) => ["faq-cash-deposits-sft", "faq-loan-myth"].includes(f.id)),
    relatedSlugs: [
      "understanding-black-money-and-money-laundering",
      "legal-financial-transactions-and-evidence",
      "international-remittances-and-cryptocurrency-tax",
    ],
  },
  {
    id: "art-5",
    slug: "ngos-charitable-donations-and-tax-deductions",
    sectionNumber: 5,
    sectionTitle: "NGOS & CHARITABLE DONATIONS",
    title: "Charitable Donations, NGO Registration & The Law Against Donation Laundering",
    subtitle:
      "Statutory requirements under Section 12AB, Section 80G, Form 10BD/10BE donor certificates, FCRA compliance, and legal consequences of bogus donation syndicates.",
    readingTimeMinutes: 14,
    lastVerifiedDate: "October 2026",
    verificationBadge: "OFFICIAL_CBDT_CIRCULAR",
    summary:
      "Covers the legal and tax framework governing non-profit entities in India (Trusts, Societies, and Section 8 companies). It explains the registration requirements under Sections 12AB and 80G, the electronic donor statement system (Form 10BD/10BE), FCRA regulations, verified examples of credible public trusts, and explains why charitable donations cannot erase tax liabilities or legitimize illicit funds.",
    keyTakeaways: [
      "Tax deductions under Section 80G (50% or 100% of donation) are legally admissible only if the recipient NGO files Form 10BD and issues a verifiable Form 10BE certificate to the donor.",
      "Donations made in cash exceeding Rs 2,000 are not eligible for any deduction under Section 80G.",
      "Foreign contributions to Indian NGOs are strictly regulated under FCRA 2010 (amended 2020), requiring a designated account with State Bank of India New Delhi Main Branch and prohibiting sub-granting.",
      "Participating in bogus donation cartels (paying cash plus commission to receive a cheque and 80G receipt) triggers disallowance, taxation at 78% under Section 115BBE, and criminal prosecution under Section 276C and PMLA.",
      "Charitable donations only reduce taxable income; they do NOT erase pre-existing tax liabilities or convert tainted funds into legal capital.",
    ],
    officialSources: [
      {
        name: "Income Tax Act, 1961 — Charitable Trust Provisions",
        authority: "CBDT, Ministry of Finance",
        url: "https://incometaxindia.gov.in",
        citationDate: "Finance Act 2020 & 2023 Amendments",
        statutoryReference: "Sections 11, 12AB, 13, 80G, Rule 18AB (Form 10BD & 10BE)",
      },
      {
        name: "Foreign Contribution (Regulation) Amendment Act, 2020",
        authority: "Ministry of Home Affairs, Government of India",
        url: "https://fcraonline.nic.in",
        citationDate: "Act No. 33 of 2020",
        statutoryReference: "Sections 7, 12, 17 of FCRA 2010",
      },
    ],
    faqs: KNOWLEDGE_FAQS.filter((f) => ["faq-bogus-donations"].includes(f.id)),
    relatedSlugs: [
      "understanding-black-money-and-money-laundering",
      "legal-procedures-for-undeclared-income",
      "legal-financial-transactions-and-evidence",
    ],
  },
  {
    id: "art-6",
    slug: "international-remittances-and-cryptocurrency-tax",
    sectionNumber: 6,
    sectionTitle: "INTERNATIONAL TRANSFERS & CRYPTOCURRENCY",
    title: "Cross-Border Remittances (India ↔ UAE) & Virtual Digital Asset Taxation",
    subtitle:
      "Statutory compliance under RBI Liberalised Remittance Scheme (LRS), Form 15CA/CB, TCS under Section 206C(1G), UAE CBUAE AML framework, and Section 115BBH VDA taxation.",
    readingTimeMinutes: 16,
    lastVerifiedDate: "October 2026",
    verificationBadge: "STATUTORY_VERIFIED",
    summary:
      "A complete guide to lawful international wire transfers between India and the UAE, alongside cryptocurrency compliance under Indian direct tax law. Details the RBI LRS limit of USD 250,000, Tax Collected at Source (TCS) rates, mandatory Form 15CA/15CB documentation, UAE anti-money laundering standards under goAML, and the stringent 30% tax and 1% TDS regime governing Virtual Digital Assets (VDAs).",
    keyTakeaways: [
      "Resident Indians can lawfully remit up to USD 250,000 per financial year under the RBI Liberalised Remittance Scheme (LRS) through Authorized Dealer Category-I banks.",
      "Outward remittances under LRS attract 20% Tax Collected at Source (TCS) on amounts exceeding Rs 7 Lakhs (education and medical remittances carry lower concessional rates).",
      "Payments to non-residents chargeable to tax require Form 15CA (electronic declaration) and Form 15CB (Chartered Accountant certification) under Section 195.",
      "UAE remittances are monitored through the Central Bank of the UAE (CBUAE) and FIU's goAML system under Federal Decree-Law No. (20) of 2018.",
      "Virtual Digital Assets (cryptocurrency / NFTs) are taxed at a flat 30% (plus 4% cess) under Section 115BBH with NO deduction other than acquisition cost, zero loss set-off, and 1% TDS under Section 194S.",
      "Using informal hawala, chop, or unregistered P2P crypto corridors violates FEMA Section 13 and constitutes criminal money laundering under PMLA Section 3.",
    ],
    officialSources: [
      {
        name: "Foreign Exchange Management Act, 1999 (FEMA)",
        authority: "Reserve Bank of India & Ministry of Finance",
        url: "https://www.rbi.org.in",
        citationDate: "Act No. 42 of 1999",
        statutoryReference: "Section 10, 11, 13, Master Direction - LRS",
      },
      {
        name: "Income Tax Act, 1961 — International & VDA Provisions",
        authority: "CBDT, Ministry of Finance",
        url: "https://incometaxindia.gov.in",
        citationDate: "Finance Act 2022 & 2024",
        statutoryReference: "Sections 2(47A), 115BBH, 194S, 195, 206C(1G), Rule 37BB (Form 15CA/CB)",
      },
      {
        name: "Federal Decree-Law No. (20) of 2018 on AML/CFT (UAE)",
        authority: "Central Bank of the UAE & Executive Office of AML/CFT",
        url: "https://www.centralbank.ae",
        citationDate: "UAE Federal Legislation 2018 as amended",
      },
      {
        name: "FIU-IND Registration Directives for Offshore VDA Service Providers",
        authority: "Financial Intelligence Unit – India",
        url: "https://fiuindia.gov.in",
        citationDate: "December 2023 Compliance Order",
      },
    ],
    checklists: DOCUMENT_CHECKLISTS.filter((c) => ["checklist-remittance-lrs"].includes(c.id)),
    faqs: KNOWLEDGE_FAQS.filter((f) => ["faq-crypto-vda-tax", "faq-international-uae-lrs"].includes(f.id)),
    relatedSlugs: [
      "understanding-black-money-and-money-laundering",
      "legal-financial-transactions-and-evidence",
      "banking-regulations-kyc-and-loan-compliance",
    ],
  },
  {
    id: "art-7",
    slug: "documented-case-studies-and-judicial-precedents",
    sectionNumber: 7,
    sectionTitle: "LEGAL CONSEQUENCES & DOCUMENTED CASE STUDIES",
    title: "Judicial Precedents & Enforcement Case Studies: Supreme Court Jurisprudence on Financial Crimes",
    subtitle:
      "A forensic breakdown of 5 landmark Indian judicial and enforcement cases: CIT v. P. Mohanakala, NSEL PMLA attachments, Vijay Mallya FEOA restitution, Penny Stock cartels, and the Jain Hawala diary evidentiary ruling.",
    readingTimeMinutes: 17,
    lastVerifiedDate: "October 2026",
    verificationBadge: "STATUTORY_VERIFIED",
    summary:
      "Presents comprehensive, fact-based analyses of five documented Indian legal cases spanning tax evasion, sham gifts, loan diversion, market manipulation, and money laundering. Each case dissects the established facts, governing statutes, judicial rulings, asset recoveries or penalties, and actionable compliance lessons, strictly distinguishing final decrees from pending proceedings.",
    keyTakeaways: [
      "The Supreme Court in CIT v. P. Mohanakala settled that banking channel transfers are not self-authenticating; assessees must prove donor capacity and genuine relationship under Section 68.",
      "In NSEL, the courts established that properties purchased with commingled or converted funds qualify as 'proceeds of crime' under Section 2(1)(u) of PMLA and can be attached to make restitution to victims.",
      "The Fugitive Economic Offenders Act 2018 allows the Central Government to confiscate domestic and international properties of economic offenders fleeing Indian jurisdiction, enabling recovery exceeding Rs 14,000 Crore in the Kingfisher Airlines consortium default.",
      "Penny stock syndicates attempting to convert unaccounted cash into tax-free long-term capital gains were dismantled under the doctrine of 'human probabilities', leading to 78% tax under Section 115BBE.",
      "While CBI v. V.C. Shukla established that informal diary entries require corroboration, modern statutory amendments (PMLA Section 24, IT Act Section 292C) create legal presumptions of guilt for seized financial data.",
    ],
    officialSources: [
      {
        name: "Supreme Court of India Official Judgments",
        authority: "Supreme Court of India",
        url: "https://main.sci.gov.in",
        citationDate: "1998, 2007, 2022 Judgments",
      },
      {
        name: "High Court of Judicature at Bombay Records",
        authority: "Bombay High Court",
        url: "https://bombayhighcourt.nic.in",
        citationDate: "NSEL & Sanjay Bimalchand Jain Rulings",
      },
      {
        name: "PMLA Special Court Records, Mumbai",
        authority: "City Civil & Sessions Court, Mumbai",
        url: "https://districts.ecourts.gov.in",
        citationDate: "Special PMLA Case 4 of 2018",
      },
    ],
    caseStudies: DOCUMENTED_CASES,
    relatedSlugs: [
      "understanding-black-money-and-money-laundering",
      "legal-procedures-for-undeclared-income",
      "legal-financial-transactions-and-evidence",
    ],
  },
  {
    id: "art-8",
    slug: "tax-notices-scrutiny-and-appeal-procedures",
    sectionNumber: 8,
    sectionTitle: "TAX NOTICES, SCRUTINY & APPELLATE REMEDIES",
    title: "Handbook on Income Tax Notices: Section 133(6), 142(1), 148A, and Faceless Appeals",
    subtitle:
      "A practical compliance roadmap for understanding and responding to direct tax notices, e-Proceedings protocols, and navigating the statutory appellate hierarchy (CIT(A), ITAT, High Court).",
    readingTimeMinutes: 15,
    lastVerifiedDate: "October 2026",
    verificationBadge: "STATUTORY_VERIFIED",
    summary:
      "A complete procedural guide for individuals and businesses on how to handle notices from the Income Tax Department. Covers verification inquiries under Section 133(6), preliminary assessment calls under Section 142(1), CASS scrutiny under Section 143(2), show-cause notices under Section 148A, and the statutory appellate ladder up to the Supreme Court of India.",
    keyTakeaways: [
      "Notices under Section 133(6) are purely for calling of information/verification; non-compliance attracts a statutory penalty of Rs 500 per day under Section 272A.",
      "Section 148A mandates a preliminary inquiry and an opportunity to be heard (giving between 7 and 30 days) before any reassessment notice under Section 148 can be issued.",
      "Under Section 149(1), reopening beyond 3 years (up to 10 years) is legally permissible only if escaped income in the form of an asset, expenditure, or book entry exceeds Rs 50 Lakhs with approval from the specified authority.",
      "All notice responses must be submitted electronically through the 'e-Proceedings' facility on the official e-Filing portal.",
      "Statutory appellate remedies proceed from CIT (Appeals) under Section 246A, to the Income Tax Appellate Tribunal (ITAT) under Section 253, the High Court under Section 260A, and the Supreme Court under Section 261.",
    ],
    officialSources: [
      {
        name: "Income Tax Act, 1961 — Assessment & Appeals",
        authority: "CBDT, Ministry of Finance",
        url: "https://incometaxindia.gov.in",
        citationDate: "Finance Act 2024",
        statutoryReference: "Sections 133(6), 142(1), 143(2), 144, 148, 148A, 149, 246A, 253, 260A",
      },
      {
        name: "Faceless Assessment & Faceless Appeal Schemes, 2020/2021",
        authority: "Central Board of Direct Taxes",
        url: "https://www.incometax.gov.in",
        citationDate: "CBDT Notifications S.O. 2745(E) and 2746(E)",
      },
    ],
    checklists: DOCUMENT_CHECKLISTS.filter((c) => ["checklist-sec148a-notice", "checklist-itr-u"].includes(c.id)),
    faqs: KNOWLEDGE_FAQS.filter((f) => ["faq-ca-legal-representation", "faq-sec115bbe-tax-rate"].includes(f.id)),
    relatedSlugs: [
      "legal-procedures-for-undeclared-income",
      "understanding-black-money-and-money-laundering",
      "documented-case-studies-and-judicial-precedents",
    ],
  },
];
