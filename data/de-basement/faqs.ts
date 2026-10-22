// ETW — De-Basement Frequently Asked Questions (FAQ)
// Rigorous practical legal & tax questions answered with statutory citations

import type { FAQItem } from "./types.ts";

export const KNOWLEDGE_FAQS: FAQItem[] = [
  {
    id: "faq-itru-eligibility",
    category: "RETURN_CORRECTION",
    question: "Can I file an Updated Return (ITR-U) under Section 139(8A) to declare previously missed income?",
    answer:
      "Yes, provided you meet the strict statutory eligibility conditions. An ITR-U can be filed within 24 months from the end of the relevant Assessment Year to declare previously omitted income or correct an under-reported income. However, you cannot file an ITR-U if: (1) it results in a loss or increases an existing loss, (2) it results in a refund or increases an existing refund, (3) it reduces the total tax liability declared in an earlier return, or (4) a search under Section 132, survey under Section 133A, or reassessment proceeding under Section 148 has already been initiated for that assessment year.",
    statutoryCitation: "Income Tax Act 1961, Section 139(8A) read with Section 140B",
    keyRuleSummary: "Allowed within 24 months of AY end; requires 25% (year 1) or 50% (year 2) additional tax; barred if search/notice initiated.",
    officialReferenceUrl: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-itr-u",
  },
  {
    id: "faq-amnesty-existence",
    category: "TAX_REGULARIZATION",
    question: "Is there currently any black money amnesty scheme or immunity scheme available in India?",
    answer:
      "No. There is currently NO tax amnesty or voluntary disclosure scheme (such as the historic VDIS 1997, IDS 2016, or PMGKY 2016) in force in India. The Income Tax Department and Ministry of Finance have repeatedly clarified that no general amnesty will be granted. The Updated Return (ITR-U) under Section 139(8A) is a voluntary return mechanism that requires paying full tax, statutory interest, and an additional tax penalty of 25% or 50%; it does NOT grant immunity from prosecution under the Prevention of Money Laundering Act (PMLA), Black Money Act 2015, or Benami Transactions Act if the funds originated from illicit activities.",
    statutoryCitation: "CBDT Clarifications & Finance Act 2022 Memorandum",
    keyRuleSummary: "No amnesty exists. ITR-U is a voluntary return with heavy financial penalties, not an immunity shield.",
    officialReferenceUrl: "https://incometaxindia.gov.in",
  },
  {
    id: "faq-cash-deposits-sft",
    category: "BANKING_AND_CASH",
    question: "How do banks monitor and report high-value cash deposits to the Income Tax Department?",
    answer:
      "Under Rule 114E of the Income Tax Rules, 1962, banks and financial institutions are statutorily mandated to file a Statement of Financial Transactions (SFT) for: (1) Cash deposits aggregating to Rs 10 Lakh or more in one or more savings bank accounts of a person in a financial year; (2) Cash deposits or withdrawals aggregating to Rs 50 Lakh or more in one or more current accounts; (3) Cash payments aggregating to Rs 1 Lakh or more for credit card bills, or non-cash payments aggregating to Rs 10 Lakh or more. These reports automatically flow into the taxpayer's Annual Information Statement (AIS) and the Centralized Information Management System (CIMS).",
    statutoryCitation: "Income Tax Act 1961, Section 285BA read with Income Tax Rules 1962, Rule 114E",
    keyRuleSummary: "Rs 10L savings account cash deposits / Rs 50L current account deposits trigger mandatory SFT reporting to CBDT.",
    officialReferenceUrl: "https://www.incometax.gov.in/iec/foportal/help/statutory-forms/sft",
  },
  {
    id: "faq-loan-myth",
    category: "LOANS_AND_BANKING",
    question: "Can I regularize undeclared cash by depositing it into a company or taking out a bank loan?",
    answer:
      "No. Attempting to convert undeclared cash into 'legitimate' funds by depositing cash into an account or taking a bank loan is a common misconception that creates grave criminal exposure. If cash is deposited into an entity without provable revenue, the Assessing Officer will invoke Section 68 (Unexplained Cash Credits) and tax the entire sum at an effective rate of 78% under Section 115BBE, along with a 10% penalty under Section 271AAC. Furthermore, taking a bank loan requires servicing EMIs through documented lawful income; repaying loans with unaccounted cash triggers Suspicious Transaction Reports (STRs) under PMLA.",
    statutoryCitation: "Income Tax Act 1961, Section 68 & 115BBE; PMLA 2002, Section 3",
    keyRuleSummary: "Loans do not legitimize cash. Falsifying declarations or loan laundering triggers Section 115BBE and PMLA prosecution.",
  },
  {
    id: "faq-gifts-parents-relatives",
    category: "GIFTS_AND_INHERITANCE",
    question: "Is money received as a gift from parents or immediate family members taxable under Indian law?",
    answer:
      "Gifts of any amount received from a specified 'Relative' defined under Section 56(2) of the Income Tax Act are completely exempt from income tax in the hands of the recipient. Specified relatives include spouse, brother, sister, brother/sister of spouse, brother/sister of either parent, any lineal ascendant or descendant, and any lineal ascendant or descendant of spouse. However, to defend against potential Section 68 scrutiny, you must maintain: (1) a written and signed Gift Deed or declaration, (2) proof of banking transfer (NEFT/RTGS/Cheque), (3) proof of relationship, and (4) donor's ITR and bank statement proving the donor's financial capacity.",
    statutoryCitation: "Income Tax Act 1961, Section 56(2)(x) proviso (a)",
    keyRuleSummary: "Gifts from specified relatives are 100% tax-free, but donor's financial capacity and banking trail must be documented.",
  },
  {
    id: "faq-cash-in-lockers-limits",
    category: "BANKING_AND_CASH",
    question: "Is there a legal limit on the amount of cash an individual can hold at home or in a bank locker?",
    answer:
      "Indian law does not specify a statutory upper ceiling on the amount of cash you can hold, provided every single rupee is fully accounted for and can be proven to have originated from legitimate disclosed income, tax-paid savings, or lawful withdrawals from your bank accounts. However, under Section 269ST, you cannot receive Rs 2 Lakh or more in cash from a single person in a day or for a single transaction. During an income tax search under Section 132, any cash found for which the taxpayer cannot provide satisfactory accounting is treated as undisclosed money under Section 69A and taxed under Section 115BBE.",
    statutoryCitation: "Income Tax Act 1961, Section 69A, Section 115BBE, and Section 269ST",
    keyRuleSummary: "No limit on cash holdings IF backed by books/withdrawals; unexplained cash is taxed at 78% under Section 115BBE.",
  },
  {
    id: "faq-sec115bbe-tax-rate",
    category: "PENALTIES_AND_RATES",
    question: "What is the exact tax rate applied to unexplained cash, investments, and credits under Section 115BBE?",
    answer:
      "Income assessed under Section 68 (unexplained cash credits), Section 69 (unexplained investments), Section 69A (unexplained money, bullion, jewelry), Section 69B (undisclosed investment amounts), Section 69C (unexplained expenditure), or Section 69D (amount borrowed on hundi) is taxed at a flat base rate of 60%. A mandatory surcharge of 25% is levied on this tax (15%), plus a 4% Health and Education Cess, resulting in an effective tax rate of 78%. Furthermore, a penalty of 10% on tax payable is levied under Section 271AAC if not voluntarily admitted in the return, and NO basic exemption limit, deductions under Chapter VI-A, or set-off of any loss is permitted.",
    statutoryCitation: "Income Tax Act 1961, Section 115BBE read with Section 271AAC",
    keyRuleSummary: "Flat 60% tax + 25% surcharge + 4% cess = 78% effective rate, plus 10% penalty; zero deductions allowed.",
  },
  {
    id: "faq-crypto-vda-tax",
    category: "CRYPTO_AND_INTERNATIONAL",
    question: "How are cryptocurrency gains taxed in India, and can crypto losses offset other income?",
    answer:
      "Under Section 115BBH of the Income Tax Act, any income arising from the transfer of a Virtual Digital Asset (VDA / cryptocurrency / NFT) is taxed at a flat rate of 30% (plus 4% cess, effective 31.2%). Crucially: (1) No deduction is allowed for any expenditure other than the direct cost of acquisition (mining infrastructure, electricity, internet, or platform fees cannot be deducted); (2) No loss from transfer of one cryptocurrency can be set off against gains from another cryptocurrency, nor against any other income head; (3) Crypto losses cannot be carried forward to subsequent financial years. In addition, Section 194S mandates 1% TDS on all crypto transfers exceeding Rs 50,000 (or Rs 10,000 for specified individuals).",
    statutoryCitation: "Income Tax Act 1961, Section 2(47A), Section 115BBH, and Section 194S",
    keyRuleSummary: "Flat 30% tax + 4% cess; only cost of acquisition deductible; zero loss set-off; 1% TDS on transfers.",
    officialReferenceUrl: "https://www.incometax.gov.in/iec/foportal/help/individual/vda-taxation",
  },
  {
    id: "faq-international-uae-lrs",
    category: "CRYPTO_AND_INTERNATIONAL",
    question: "What is the lawful procedure to transfer funds from India to the UAE under RBI rules?",
    answer:
      "Resident individuals in India can remit funds to the UAE lawfully through the Liberalised Remittance Scheme (LRS) administered by the Reserve Bank of India, up to a maximum limit of USD 250,000 per financial year for permissible current or capital account transactions (such as overseas education, travel, medical treatment, real estate investment, or portfolio investments). The transfer must be routed through an Authorized Dealer Category-I bank using Form A2. For remittances exceeding Rs 7 Lakhs, Tax Collected at Source (TCS) of 20% applies under Section 206C(1G). For non-LRS commercial remittances, Form 15CA (electronic self-declaration) and Form 15CB (Chartered Accountant certification) are statutorily required.",
    statutoryCitation: "FEMA 1999; RBI Master Direction on LRS; Income Tax Act Section 195 & 206C(1G)",
    keyRuleSummary: "LRS limit USD 250k/year via AD Bank; Form A2 required; 20% TCS above Rs 7L threshold; 15CA/15CB for taxable payments.",
  },
  {
    id: "faq-bogus-donations",
    category: "NGOS_AND_DONATIONS",
    question: "Can making a charitable donation erase an existing tax liability or convert unaccounted money?",
    answer:
      "No. Charitable donations under Section 80G only provide a deduction against total taxable income (either 50% or 100% of the donated sum, subject to qualifying limits); they do not erase existing tax liabilities or legalize undisclosed wealth. Furthermore, participating in 'donation laundering' syndicates—where a donor gives cash plus a commission to an NGO in exchange for a bank cheque and an 80G receipt—is a severe criminal conspiracy. The Income Tax Department actively audits Form 10BD filings, cross-referencing donor PANs. When discovered, the deduction is cancelled, the donation is taxed as unexplained expenditure under Section 69C at 78%, and both donor and trust trustees face prosecution under Section 276C and PMLA.",
    statutoryCitation: "Income Tax Act 1961, Section 80G, Section 69C, Section 115BBE, Section 276C; PMLA 2002",
    keyRuleSummary: "Donations do not erase tax liabilities. Bogus donation cartels are prosecuted under Section 69C and PMLA.",
  },
  {
    id: "faq-ancestral-gold-jewelry",
    category: "GIFTS_AND_INHERITANCE",
    question: "How do I establish the legitimate source of inherited ancestral gold jewelry if no purchase invoices exist?",
    answer:
      "In India, traditional gold jewelry passed down over generations rarely possesses original retail purchase invoices. Under CBDT Instruction No. 1916 (dated May 11, 1994), tax authorities during a search/survey operation cannot seize gold jewelry up to specific family thresholds: 500 grams for each married female, 250 grams for each unmarried female, and 100 grams for each male family member. For gold holdings exceeding these thresholds, you should establish legitimacy through: (1) Family settlement deeds or partition deeds, (2) Valuation reports from a CBDT Registered Valuer, (3) Mention in wills or probate documents, and (4) Evidence of family social status and wedding gift (Stridhan) customs.",
    statutoryCitation: "CBDT Instruction No. 1916; Section 69A Income Tax Act 1961",
    keyRuleSummary: "CBDT norms protect 500g (married woman), 250g (unmarried woman), 100g (man) without seizure; excess requires valuation/will.",
  },
  {
    id: "faq-ca-legal-representation",
    category: "TAX_REGULARIZATION",
    question: "What is the legal role of a Chartered Accountant or tax lawyer when responding to tax scrutiny notices?",
    answer:
      "Under Section 288 of the Income Tax Act, an assessee is statutorily entitled to appoint an Authorized Representative (such as a practicing Chartered Accountant holding a valid Certificate of Practice from ICAI or a qualified legal practitioner enrolled with a State Bar Council) to represent them before tax authorities. The CA or advocate files a Power of Attorney (Form 35 / Letter of Authority) on the e-Filing portal. Professional representation ensures that responses under Section 142(1), 143(2), or 148A are framed in strict accordance with statutory limitations, evidentiary rules, and binding judicial precedents, protecting the taxpayer from arbitrary best-judgment assessments.",
    statutoryCitation: "Income Tax Act 1961, Section 288 read with Income Tax Rules 1962, Rule 50 to 66",
    keyRuleSummary: "Section 288 authorizes CAs and advocates to represent assessees via Form 35 on the e-Filing portal.",
  },
];
