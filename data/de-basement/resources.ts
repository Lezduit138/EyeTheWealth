// ETW — De-Basement Official Resources & Regulatory Directory
// Verified government portals, statutory portals, and official regulatory registries

import type { OfficialDirectoryEntry } from "./types.ts";

export const OFFICIAL_REGULATORY_RESOURCES: OfficialDirectoryEntry[] = [
  {
    title: "Income Tax Department e-Filing Portal",
    category: "INCOME_TAX",
    authority: "Central Board of Direct Taxes (CBDT), Ministry of Finance, Government of India",
    description:
      "The official portal for electronic filing of Income Tax Returns (ITR-1 through ITR-7, and ITR-U), viewing Annual Information Statement (AIS), Taxpayer Information Summary (TIS), Form 26AS, submitting responses to notices under Section 133(6), 142(1), 148A, and e-Proceedings.",
    officialUrl: "https://www.incometax.gov.in/iec/foportal/",
    applicableAct: "Income Tax Act, 1961",
    primaryService: "Return filing, ITR-U submission, AIS reconciliation, and faceless notice responses",
  },
  {
    title: "Reserve Bank of India (RBI) Regulations & Master Directions",
    category: "BANKING_RBI",
    authority: "Reserve Bank of India (Central Bank)",
    description:
      "Authoritative repository of Master Directions on Know Your Customer (KYC), Liberalised Remittance Scheme (LRS), Foreign Exchange Management Act (FEMA) transfer limits, and banking compliance directives for Scheduled Commercial Banks.",
    officialUrl: "https://www.rbi.org.in",
    applicableAct: "Reserve Bank of India Act 1934 & FEMA 1999",
    primaryService: "KYC Master Direction (RBI/DBR/2015-16/18) and LRS Outward Remittance Guidelines",
  },
  {
    title: "Financial Intelligence Unit – India (FIU-IND)",
    category: "FINANCIAL_INTELLIGENCE",
    authority: "Department of Revenue, Ministry of Finance, Government of India",
    description:
      "The central national agency responsible for receiving, processing, analyzing and disseminating information relating to suspect financial transactions, Cash Transaction Reports (CTRs), Suspicious Transaction Reports (STRs), and regulating reporting entities under PMLA.",
    officialUrl: "https://fiuindia.gov.in",
    applicableAct: "Prevention of Money Laundering Act, 2002 (PMLA)",
    primaryService: "PMLA compliance directives, VDA Service Provider registration, and AML reporting standards",
  },
  {
    title: "Directorate of Enforcement (ED)",
    category: "FINANCIAL_INTELLIGENCE",
    authority: "Department of Revenue, Ministry of Finance, Government of India",
    description:
      "Law enforcement agency and economic intelligence agency responsible for enforcing economic laws and fighting economic crime in India, primarily enforcing PMLA, FEMA, and the Fugitive Economic Offenders Act 2018.",
    officialUrl: "https://enforcementdirectorate.gov.in",
    applicableAct: "PMLA 2002, FEMA 1999, FEOA 2018",
    primaryService: "Statutory asset attachment, financial fraud investigation, and prosecution of money laundering",
  },
  {
    title: "Ministry of Corporate Affairs (MCA21 Portal)",
    category: "CORPORATE_AFFAIRS",
    authority: "Ministry of Corporate Affairs, Government of India",
    description:
      "Public registry of incorporated companies, LLPs, registered charges, financial balance sheets, Significant Beneficial Ownership (SBO) filings under Section 90 of Companies Act, and disqualified directors list.",
    officialUrl: "https://www.mca.gov.in/content/mca/global/en/home.html",
    applicableAct: "Companies Act, 2013 & Limited Liability Partnership Act, 2008",
    primaryService: "Company master data, annual filings inspection, charge satisfaction, and SBO disclosure",
  },
  {
    title: "NITI Aayog NGO Darpan Portal",
    category: "INCOME_TAX",
    authority: "NITI Aayog, Government of India",
    description:
      "Central database of Voluntary Organizations (VOs) and Non-Governmental Organizations (NGOs) operating in India, providing Darpan Unique IDs, FCRA registration links, and key management disclosures.",
    officialUrl: "https://ngodarpan.gov.in",
    applicableAct: "Societies Registration Act 1860 / Indian Trusts Act 1882",
    primaryService: "Verification of NGO registration, PAN linkage, and sector of operation",
  },
  {
    title: "Central Bank of the UAE (CBUAE) Anti-Money Laundering Framework",
    category: "UAE_REGULATORY",
    authority: "Central Bank of the UAE & National AML/CFT Executive Office",
    description:
      "Official regulatory guidelines governing cross-border remittances, exchange house operations, goAML transaction monitoring, and anti-money laundering standards in the United Arab Emirates.",
    officialUrl: "https://www.centralbank.ae/en/anti-money-laundering/",
    applicableAct: "Federal Decree-Law No. (20) of 2018 on AML/CFT (UAE)",
    primaryService: "Cross-border remittance compliance, exchange house licensing, and AML/CFT supervision",
  },
  {
    title: "Income Tax Appellate Tribunal (ITAT) Official Portal",
    category: "JUDICIAL",
    authority: "Ministry of Law and Justice, Government of India",
    description:
      "The final fact-finding authority in the Indian direct tax administration structure. Provides published judicial decisions, tribunal orders, and cause lists for direct tax appeals under Section 253.",
    officialUrl: "https://itat.gov.in",
    applicableAct: "Income Tax Act, 1961 (Chapter XX)",
    primaryService: "Judicial orders, search case precedents, and Section 68/115BBE tribunal judgments",
  },
];
