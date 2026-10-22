// ETW — De-Basement Article Content Body Component
// Comprehensive, exhaustive statutory commentary for all 8 knowledge domains.
// Adheres strictly to ETW design rules: monochrome, crisp borders, high contrast.

import React from "react";

interface ArticleContentBodyProps {
  slug: string;
}

export function ArticleContentBody({ slug }: ArticleContentBodyProps) {
  switch (slug) {
    case "understanding-black-money-and-money-laundering":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              1. Statutory Definitions: Black Money, Undeclared Income &amp; Proceeds of Crime
            </h3>
            <p>
              In public discourse, the term <strong>&ldquo;black money&rdquo;</strong> is widely used as a colloquial catch-all for any financial asset that has escaped taxation or oversight. However, under Indian law, the legal system applies precise statutory distinctions across different enactments.
            </p>
            <p>
              <strong>Undeclared Income</strong> refers to legitimate earnings derived from lawful trade, profession, employment, or capital appreciation that have not been disclosed to tax authorities in accordance with the mandatory filing requirements of <strong>Section 139 of the Income Tax Act, 1961</strong>. The source of these funds is fundamentally legal; the non-compliance lies in the omission of reporting or delayed filing. Under Sections 68, 69, 69A, 69B, and 69C, the Assessing Officer is empowered to classify such amounts as unexplained cash credits, unexplained investments, unexplained money, or unexplained expenditure.
            </p>
            <p>
              By contrast, <strong>Proceeds of Crime</strong> is a strictly defined criminal law term under <strong>Section 2(1)(u) of the Prevention of Money Laundering Act, 2002 (PMLA)</strong>. It denotes any property derived or obtained, directly or indirectly, by any person as a result of criminal activity relating to a scheduled offense listed in the PMLA Schedule (such as cheating under Section 420 IPC, corruption under the Prevention of Corruption Act, forgery, extortion, or narcotics trafficking). Money laundering, as defined under Section 3 of PMLA, is the process of projecting, claiming, or concealing tainted property derived from a predicate crime as untainted wealth.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              2. The Fallacy of Legitimization: Why Banking Transfers Do Not Cure Illicit Funds
            </h3>
            <p>
              A widespread misconception among non-compliant taxpayers is that depositing unaccounted cash into a bank account, routing funds through a loan, receiving an alleged gift via cheque, or making an overseas wire transfer automatically &ldquo;regularizes&rdquo; or legitimizes the money.
            </p>
            <p>
              This notion is completely refuted by established Indian jurisprudence. In the landmark Supreme Court decision in <em>Commissioner of Income Tax v. P. Mohanakala (2007) 291 ITR 278</em>, the Apex Court established that the mere fact that money entered an assessee&rsquo;s hands through banking channels (such as bank drafts, cheques, or international wire remittances) does NOT satisfy the statutory burden of proof under Section 68. The Court ruled that the assessee must satisfy the tripartite test:
            </p>
            <div className="bg-[#f8f8f8] border-l-4 border-black p-4 space-y-2 text-xs md:text-sm">
              <p className="font-bold uppercase text-black m-0">The Tripartite Evidentiary Standard (Section 68):</p>
              <p className="m-0"><strong>1. Identity of the Creditor / Donor:</strong> Conclusive official proof of the counterparty (PAN, passport, address verification).</p>
              <p className="m-0"><strong>2. Capacity / Creditworthiness:</strong> Independent evidence (ITRs, audited balance sheets, bank records) demonstrating that the counterparty possessed the lawful financial means to provide the funds.</p>
              <p className="m-0"><strong>3. Genuineness of the Transaction:</strong> Commercial reality, natural love and affection, or lawful contractual consideration explaining why the transfer occurred.</p>
            </div>
            <p>
              If the taxpayer fails to substantiate any one of these three prongs, the Assessing Officer is statutorily mandated to treat the funds as unexplained cash credit, irrespective of whether the transaction passed through a bank account.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              3. Investigative Architecture: How Authorities Detect Suspicious Transactions
            </h3>
            <p>
              The Indian financial intelligence ecosystem operates through integrated automated databases that cross-reference banking, direct tax, corporate, and real estate registers:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li>
                <strong>Financial Intelligence Unit – India (FIU-IND):</strong> Established under the Ministry of Finance, FIU-IND receives millions of electronic reports annually from reporting entities (banks, NBFCs, stockbrokers, real estate intermediaries). These include Cash Transaction Reports (CTR) for cash dealings exceeding Rs 10 Lakhs, Suspicious Transaction Reports (STR) triggered by behavioral red flags, and Cross-Border Wire Transfer Reports (CBWTR).
              </li>
              <li>
                <strong>Project Insight (CBDT):</strong> The Income Tax Department&rsquo;s big-data analytics platform creates a comprehensive 360-degree financial profile of every PAN holder. It aggregates data from the Centralized Information Management System (CIMS), GSTN e-way bills and returns, MCA21 corporate filings, and the Annual Information Statement (AIS).
              </li>
              <li>
                <strong>Automated Red Flags:</strong> Unreported property purchases, high-value credit card spending, cash deposits exceeding Rule 114E thresholds, and sudden surges in trading volume automatically trigger automated verification notices under Section 133(6) or CASS scrutiny notices under Section 143(2).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              4. Relevant Indian Legislation &amp; Penal Consequences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="border border-black p-4 bg-white">
                <h4 className="font-mono font-black uppercase mb-1">Section 115BBE (Income Tax Act)</h4>
                <p className="m-0 text-neutral-700">
                  Levies a flat base tax of 60% + 25% surcharge + 4% cess, resulting in an effective tax rate of <strong>78%</strong> on unexplained credits, money, or investments. No basic exemption, no deductions under Chapter VI-A, and zero loss set-off are allowed.
                </p>
              </div>
              <div className="border border-black p-4 bg-white">
                <h4 className="font-mono font-black uppercase mb-1">PMLA 2002 (Money Laundering)</h4>
                <p className="m-0 text-neutral-700">
                  Sections 3 &amp; 4 prescribe rigorous imprisonment for 3 to 7 years (extendable to 10 years for NDPS offenses) plus unlimited fines. Section 5 allows the provisional attachment of tainted property, while Section 24 places the reverse burden of proof on the accused.
                </p>
              </div>
              <div className="border border-black p-4 bg-white">
                <h4 className="font-mono font-black uppercase mb-1">Black Money Act, 2015</h4>
                <p className="m-0 text-neutral-700">
                  Applies to undisclosed foreign assets and bank accounts. Levies a flat 30% tax plus a 90% mandatory penalty (total <strong>120%</strong>), accompanied by rigorous criminal imprisonment from 3 to 10 years.
                </p>
              </div>
              <div className="border border-black p-4 bg-white">
                <h4 className="font-mono font-black uppercase mb-1">Benami Transactions Act, 1988/2016</h4>
                <p className="m-0 text-neutral-700">
                  Prohibits holding assets in the name of a fictitious person or third party where consideration is paid by someone else. Prescribes confiscation of property without compensation, rigorous imprisonment up to 7 years, and a fine of 25% of the fair market value.
                </p>
              </div>
            </div>
          </section>
        </div>
      );

    case "legal-procedures-for-undeclared-income":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              1. Return Correction Mechanisms: Section 139 Hierarchy
            </h3>
            <p>
              The Income Tax Act, 1961 provides a strict statutory hierarchy for filing and revising tax returns. Understanding where your case falls on this timeline is the first step in regularizing omitted income:
            </p>
            <div className="border-2 border-black p-4 bg-[#fbfbfb] space-y-3 text-xs md:text-sm">
              <div>
                <p className="font-mono font-black uppercase text-black m-0">A. Original Return — Section 139(1)</p>
                <p className="m-0 text-neutral-700">
                  Must be filed on or before July 31 following the financial year (for non-audit individuals) or October 31 (for corporate/audited taxpayers). Allows carry-forward of business and capital losses.
                </p>
              </div>
              <div className="border-t border-neutral-300 pt-2">
                <p className="font-mono font-black uppercase text-black m-0">B. Belated Return — Section 139(4)</p>
                <p className="m-0 text-neutral-700">
                  Permitted up to December 31 of the Assessment Year. Requires payment of late filing fees under Section 234F (Rs 5,000; or Rs 1,000 if total income is below Rs 5 Lakhs) and forfeits the right to carry forward certain business losses.
                </p>
              </div>
              <div className="border-t border-neutral-300 pt-2">
                <p className="font-mono font-black uppercase text-black m-0">C. Revised Return — Section 139(5)</p>
                <p className="m-0 text-neutral-700">
                  If any omission or wrong statement is discovered in an original or belated return, it can be revised on or before December 31 of the relevant Assessment Year. Replaces the original return ab initio.
                </p>
              </div>
              <div className="border-t border-neutral-300 pt-2 bg-[#f0f0f0] p-3 border-l-4 border-black">
                <p className="font-mono font-black uppercase text-black m-0">
                  D. Updated Return (ITR-U) — Section 139(8A) [Central Regularization Route]
                </p>
                <p className="m-0 text-neutral-800 mt-1">
                  Introduced by Finance Act 2022 to provide taxpayers an opportunity to voluntarily report previously omitted or under-reported income within <strong>24 months</strong> from the end of the relevant Assessment Year, upon payment of statutory additional tax under Section 140B.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              2. Detailed Statutory Conditions for Filing Form ITR-U
            </h3>
            <p>
              Filing an Updated Return under Section 139(8A) is governed by stringent statutory rules. It is NOT an unconditional right:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="border-2 border-black p-4 bg-white">
                <h4 className="font-mono font-black uppercase text-black mb-2">Permissible Reasons (Rule 12AC):</h4>
                <ul className="list-disc pl-4 space-y-1 text-neutral-800 m-0">
                  <li>Return previously not filed (missed return)</li>
                  <li>Income not reported correctly in earlier return</li>
                  <li>Wrong head of income chosen</li>
                  <li>Reduction of carried forward loss</li>
                  <li>Reduction of unabsorbed depreciation</li>
                  <li>Reduction of tax credit under Section 115JB/115JC</li>
                </ul>
              </div>
              <div className="border-2 border-black p-4 bg-[#fdfdfd]">
                <h4 className="font-mono font-black uppercase text-black mb-2">Statutory Prohibitions (Barred Cases):</h4>
                <ul className="list-disc pl-4 space-y-1 text-neutral-800 m-0">
                  <li>Cannot be filed if it results in a loss or increases an existing loss</li>
                  <li>Cannot claim a refund or increase an existing refund</li>
                  <li>Cannot reduce total tax liability from previous returns</li>
                  <li>Strictly barred if a search under Sec 132 or survey under Sec 133A has been conducted</li>
                  <li>Strictly barred if a notice under Section 148 has already been issued for that year</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              3. Section 140B Tax Calculation Formula
            </h3>
            <p>
              Under Section 140B(1), the taxpayer must compute the total tax on the updated income, add statutory interest under Sections 234A, 234B, and 234C, and then apply the additional tax surcharge:
            </p>
            <div className="bg-black text-white p-5 font-mono text-xs md:text-sm space-y-2">
              <p className="m-0 text-neutral-300"># Statutory Formula under Section 140B:</p>
              <p className="m-0 font-bold text-white">
                Total Payable = [Net Additional Tax + Interest (234A + 234B + 234C)] + Additional Tax
              </p>
              <p className="m-0 text-neutral-300 pt-2">
                Where Additional Tax =<br />
                • <strong>25%</strong> of [Tax + Interest] if filed within 12 months from end of AY.<br />
                • <strong>50%</strong> of [Tax + Interest] if filed between 12 and 24 months from end of AY.
              </p>
            </div>
            <p className="text-xs text-neutral-600">
              Note: Proof of 100% payment via Challan ITNS 280 under Minor Head 115 must be entered in Part B-AT of Form ITR-U before uploading.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              4. Reassessment Regime: Section 148 &amp; Section 148A Notice Procedures
            </h3>
            <p>
              If the Income Tax Department identifies omitted income through its automated systems before the taxpayer voluntarily files, the case enters the reassessment regime under Sections 148 and 148A (as overhauled by Finance Acts 2021 and 2024):
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm">
              <li>
                <strong>Section 148A(a) Inquiry:</strong> The Assessing Officer conducts preliminary inquiries regarding information suggesting escaped income.
              </li>
              <li>
                <strong>Section 148A(b) Show-Cause Notice:</strong> The AO serves a notice providing the specific information and material in their possession, granting the assessee an opportunity to show cause within a timeframe of not less than 7 days and not exceeding 30 days.
              </li>
              <li>
                <strong>Assessee Rebuttal:</strong> The taxpayer must submit an electronic reply through the e-Filing portal, reconciling flagged transactions with bank statements and legal proofs.
              </li>
              <li>
                <strong>Section 148A(d) Order:</strong> The AO considers the reply and passes a reasoned order deciding whether it is a fit case to issue a notice under Section 148.
              </li>
              <li>
                <strong>Statutory Limitation Windows (Section 149):</strong> Normal reassessment notices cannot be issued after <strong>3 years</strong> from the end of the relevant Assessment Year. Reopening can be extended up to <strong>10 years</strong> ONLY if the AO possesses tangible evidence that escaped income represented in the form of an asset exceeds <strong>Rs 50 Lakhs</strong>, and has obtained prior sanction from the Principal Chief Commissioner or specified higher authority.
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              5. Ordinary Return Correction vs. Special Statutory Disclosure Schemes
            </h3>
            <p>
              It is vital to distinguish between normal statutory return filing and past ad-hoc disclosure schemes:
            </p>
            <p>
              In past decades, the Government of India occasionally promulgated temporary statutory disclosure schemes, such as the Voluntary Disclosure of Income Scheme (VDIS, 1997), the Income Declaration Scheme (IDS, 2016), and the Pradhan Mantri Garib Kalyan Yojana (PMGKY, 2016). These schemes offered immunity from prosecution and penalty in exchange for paying a specified tax rate.
            </p>
            <div className="border-2 border-black p-4 bg-[#fff] text-xs md:text-sm font-sans space-y-2">
              <p className="font-bold uppercase text-black m-0">Critical Statutory Clarification:</p>
              <p className="m-0 text-neutral-800">
                <strong>Every historical amnesty scheme has expired. There is currently NO general amnesty or immunity scheme in force in India.</strong>
              </p>
              <p className="m-0 text-neutral-700">
                The Updated Return (ITR-U) under Section 139(8A) is an ongoing statutory mechanism that requires payment of full tax plus substantial penalties (25% or 50% additional tax). It does NOT grant immunity from PMLA, Benami, or IPC prosecutions if the underlying funds originated from criminal activity.
              </p>
            </div>
          </section>
        </div>
      );

    case "legal-financial-transactions-and-evidence":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              1. Statutory Restrictions on Cash Transactions
            </h3>
            <p>
              Indian tax law incorporates several strict anti-cash provisions to enforce banking audit trails:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li>
                <strong>Section 269SS:</strong> Prohibits taking or accepting any loan, deposit, or specified sum of <strong>Rs 20,000 or more</strong> in cash. Contravention attracts an equal penalty of 100% of the loan amount under Section 271D.
              </li>
              <li>
                <strong>Section 269T:</strong> Prohibits repaying any loan, deposit, or specified advance of <strong>Rs 20,000 or more</strong> in cash. Contravention attracts a 100% penalty under Section 271E.
              </li>
              <li>
                <strong>Section 269ST:</strong> Prohibits receiving an amount of <strong>Rs 2,00,000 or more</strong> in cash: (a) in aggregate from a person in a day, (b) in respect of a single transaction, or (c) in respect of transactions relating to one event or occasion from a person. Violations trigger a 100% penalty under Section 271DA.
              </li>
              <li>
                <strong>Section 194N:</strong> Banks must deduct 2% TDS on cash withdrawals exceeding Rs 1 Crore (or Rs 20 Lakhs for non-filers of returns).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              2. Taxation of Gifts &amp; Inheritance: Section 56(2)(x)
            </h3>
            <p>
              Under Section 56(2)(x), any sum of money or property received without consideration (or for inadequate consideration) exceeding Rs 50,000 is taxable in the hands of the recipient under &ldquo;Income from Other Sources&rdquo;, subject to specific statutory exemptions:
            </p>
            <div className="border border-black p-4 bg-[#f8f8f8] space-y-2 text-xs md:text-sm">
              <p className="font-mono font-bold uppercase text-black m-0">Statutorily Exempt Occasions / Sources:</p>
              <p className="m-0">• Received from a defined <strong>Relative</strong> (spouse, brother, sister, lineal ascendant/descendant).</p>
              <p className="m-0">• Received on the occasion of the <strong>marriage</strong> of the individual.</p>
              <p className="m-0">• Received under a <strong>will or by way of inheritance</strong>.</p>
              <p className="m-0">• Received in contemplation of death of the donor.</p>
              <p className="m-0">• Received from any trust or institution registered under Section 12AB or Section 10(23C).</p>
            </div>
            <p className="text-xs text-neutral-700">
              Crucial Caveat: Receiving a gift from a non-relative exceeding Rs 50,000 makes the ENTIRE amount taxable, not just the excess.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              3. Real Estate Transactions &amp; Circle Rates: Section 50C &amp; Section 43CA
            </h3>
            <p>
              In property transfers, direct tax law prevents undervaluation through statutory circle rate comparison:
            </p>
            <p>
              Under <strong>Section 50C</strong> (for capital assets) and <strong>Section 43CA</strong> (for land/building held as stock-in-trade), if the declared agreement value is less than the Stamp Duty Valuation (Circle Rate) adopted by the state revenue authority, the circle rate is legally adopted as the full value of consideration for computing capital gains.
            </p>
            <p>
              <strong>Safe Harbor Tolerance:</strong> The law provides a 10% safe harbor margin. If the circle rate does not exceed 110% of the agreement consideration, the actual declared consideration is accepted. Furthermore, under <strong>Section 194-IA</strong>, the buyer must deduct 1% TDS on the total sale consideration or circle rate (whichever is higher) for all property purchases of Rs 50 Lakhs or more.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              4. The Danger of Sham Arrangements: Why Bogus Techniques Fail
            </h3>
            <p>
              Tax authorities routinely prosecute accommodation entries and sham arrangements under Section 68 and criminal statutes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
              <div className="border border-neutral-400 p-3 bg-white">
                <span className="font-mono font-bold text-black uppercase block mb-1">Fake Invoices (Bogus Billing)</span>
                <p className="m-0 text-neutral-700">
                  Generating circular invoices without actual physical movement of goods to claim input tax credits or inflate business expenses. Leads to GST cancellation, arrest, and income tax disallowance under Section 69C.
                </p>
              </div>
              <div className="border border-neutral-400 p-3 bg-white">
                <span className="font-mono font-bold text-black uppercase block mb-1">Nominee / Benami Holdings</span>
                <p className="m-0 text-neutral-700">
                  Purchasing land, shares, or bank deposits in the name of drivers, employees, or relatives. Section 24 of the Benami Act leads to asset confiscation and up to 7 years rigorous imprisonment.
                </p>
              </div>
              <div className="border border-neutral-400 p-3 bg-white">
                <span className="font-mono font-bold text-black uppercase block mb-1">Accommodation Unsecured Loans</span>
                <p className="m-0 text-neutral-700">
                  Paying cash to an entry operator who deposits it into shell companies and returns it as &ldquo;unsecured loans&rdquo; via RTGS. Investigated by SFIO and ED under Section 68 and PMLA.
                </p>
              </div>
            </div>
          </section>
        </div>
      );

    case "banking-regulations-kyc-and-loan-compliance":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              1. The RBI Know Your Customer (KYC) Architecture
            </h3>
            <p>
              All banking institutions in India are governed by the <strong>Reserve Bank of India Master Direction – Know Your Customer (KYC) Direction, 2016 (updated continuously)</strong>. The Master Direction enforces mandatory Customer Due Diligence (CDD), Ongoing Due Diligence (ODD), and Enhanced Due Diligence (EDD) for high-net-worth accounts, politically exposed persons (PEPs), and complex cross-border trusts.
            </p>
            <p>
              Banks are legally mandated to verify: (1) Official Valid Documents (OVDs) including PAN, Aadhaar, Passport, or Voter ID; (2) Source of Wealth (SoW) and Source of Funds (SoF); (3) Beneficial Ownership (BO) down to natural persons possessing 10% or more ownership or control under Rule 9 of the PML (Maintenance of Records) Rules.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              2. SFT Reporting Matrix: How Banks Transmit Data to Tax Authorities
            </h3>
            <p>
              Under <strong>Section 285BA of the Income Tax Act read with Rule 114E</strong>, banking institutions must electronically upload annual Statements of Financial Transactions (SFT) to the CBDT Insight portal:
            </p>
            <div className="overflow-x-auto">
              <table className="etw-table w-full text-xs">
                <thead>
                  <tr className="bg-[#f0f0f0] border-b-2 border-black">
                    <th className="p-3 text-black">SFT Code</th>
                    <th className="p-3 text-black">Nature of Transaction</th>
                    <th className="p-3 text-black">Statutory Reporting Threshold</th>
                    <th className="p-3 text-black">Primary Objective</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-300">
                    <td className="p-3 font-mono font-bold">SFT-003</td>
                    <td className="p-3">Cash payment for bank drafts / pay orders</td>
                    <td className="p-3 font-mono">Aggregating to Rs 10 Lakh or more in a FY</td>
                    <td className="p-3">Detecting cash hoarding via demand drafts</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="p-3 font-mono font-bold">SFT-004</td>
                    <td className="p-3">Cash deposits in savings accounts</td>
                    <td className="p-3 font-mono">Aggregating to Rs 10 Lakh or more in a FY</td>
                    <td className="p-3">Cross-referencing declared income in ITR</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="p-3 font-mono font-bold">SFT-005</td>
                    <td className="p-3">Cash deposits / withdrawals in current accounts</td>
                    <td className="p-3 font-mono">Aggregating to Rs 50 Lakh or more in a FY</td>
                    <td className="p-3">Verifying business turnover with GST filings</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="p-3 font-mono font-bold">SFT-006</td>
                    <td className="p-3">Time deposits (fixed deposits)</td>
                    <td className="p-3 font-mono">Aggregating to Rs 10 Lakh or more in a FY</td>
                    <td className="p-3">Tracking interest income and capital base</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="p-3 font-mono font-bold">SFT-007</td>
                    <td className="p-3">Credit card settlements</td>
                    <td className="p-3 font-mono">Rs 1 Lakh in cash OR Rs 10 Lakh via banking</td>
                    <td className="p-3">High-value lifestyle spending vs. ITR disparity</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              3. The Myth of Loan Regularization
            </h3>
            <p>
              It is legally impossible to &ldquo;wash&rdquo; or regularize illicit wealth by obtaining a bank loan:
            </p>
            <p>
              A loan is an enforceable debt liability, not an income regularizer. When an individual takes a bank loan, the disbursed funds are legally encumbered. The lender and enforcement agencies monitor how the loan is serviced. If loan EMIs are repaid using unaccounted cash or circular shell transfers, the bank’s transaction monitoring systems automatically flag an STR.
            </p>
            <p>
              Furthermore, securing a bank loan by submitting inflated or falsified financial statements constitutes criminal cheating under <strong>Section 420 IPC / Section 318 Bharatiya Nyaya Sanhita (BNS)</strong>. If a borrower defaults, public sector banks trigger forensic audits, SARFAESI attachment, and referral to the CBI and Enforcement Directorate.
            </p>
          </section>
        </div>
      );

    case "ngos-charitable-donations-and-tax-deductions":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              1. The Legal Framework of Non-Profit Organizations in India
            </h3>
            <p>
              Charitable organizations in India are established under three primary legal structures:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li><strong>Public Charitable Trusts:</strong> Governed by the Indian Trusts Act, 1882 or state-specific trust legislation (such as the Maharashtra Public Trusts Act, 1950, administered by the Charity Commissioner).</li>
              <li><strong>Societies:</strong> Registered under the Societies Registration Act, 1860 with the Registrar of Societies.</li>
              <li><strong>Section 8 Non-Profit Companies:</strong> Incorporated under Section 8 of the Companies Act, 2013, regulated by the Ministry of Corporate Affairs (MCA).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              2. Income Tax Registration: Section 12AB, 80G &amp; Form 10BD/10BE
            </h3>
            <p>
              Tax deductions for donors and exemptions for trusts are strictly contingent upon dual registration under the Income Tax Act:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="border border-black p-4 bg-white">
                <h4 className="font-mono font-black uppercase mb-1">Section 12AB Re-Registration</h4>
                <p className="m-0 text-neutral-700">
                  Introduced by Finance Act 2020. All existing trusts were required to re-register and obtain a 5-year provisional or final registration. Confers income tax exemption to the NGO on its charitable receipts.
                </p>
              </div>
              <div className="border border-black p-4 bg-white">
                <h4 className="font-mono font-black uppercase mb-1">Section 80G Approval &amp; Form 10BD</h4>
                <p className="m-0 text-neutral-700">
                  Allows donors to claim a 50% or 100% deduction. Under Rule 18AB, the NGO must file an electronic statement of donations in <strong>Form 10BD</strong> by May 31. The donor must obtain a system-generated <strong>Form 10BE</strong> certificate containing the unique reference number. Without Form 10BE, no 80G deduction is allowed.
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-700">
              Cash Limit: Section 80G(5D) explicitly states that no deduction shall be allowed in respect of any donation exceeding <strong>Rs 2,000</strong> unless such sum is paid by any mode other than cash.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              3. Foreign Contribution Regulation Act (FCRA) 2020 Amendments
            </h3>
            <p>
              Foreign funding to Indian NGOs is strictly governed by the Ministry of Home Affairs under FCRA 2010. The landmark 2020 amendments introduced strict structural barriers:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
              <li><strong>Mandatory SBI Account:</strong> All foreign contributions must strictly be received in a designated primary FCRA account with the <strong>State Bank of India, New Delhi Main Branch (Parliament Street)</strong>.</li>
              <li><strong>Prohibition on Sub-Granting:</strong> Section 7 strictly bans an FCRA-registered NGO from transferring foreign funds to any other NGO, even if the recipient is also FCRA-registered.</li>
              <li><strong>Administrative Cap:</strong> Administrative expenditure funded by foreign contributions is capped at a strict <strong>20%</strong> (reduced from 50%).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              4. Verified Public Charitable Organizations (Verified Public Records)
            </h3>
            <div className="space-y-3 text-xs md:text-sm">
              <div className="border border-neutral-300 p-3 bg-white">
                <p className="font-bold text-black m-0">Tata Memorial Centre / Sir Dorabji Tata Trust</p>
                <p className="text-neutral-600 m-0 text-xs">Registration: Bombay Public Trust No. E-1126(B) • Mumbai, Maharashtra</p>
                <p className="text-neutral-700 m-0 mt-1">Official Portal: <a href="https://tmc.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold">tmc.gov.in</a></p>
              </div>
              <div className="border border-neutral-300 p-3 bg-white">
                <p className="font-bold text-black m-0">Give Foundation (GiveIndia)</p>
                <p className="text-neutral-600 m-0 text-xs">Section 8 Company • CIN: U85310MH2000NPL125324 • Mumbai, Maharashtra</p>
                <p className="text-neutral-700 m-0 mt-1">Official Portal: <a href="https://give.do" target="_blank" rel="noopener noreferrer" className="underline font-bold">give.do</a></p>
              </div>
              <div className="border border-neutral-300 p-3 bg-white">
                <p className="font-bold text-black m-0">The Akshaya Patra Foundation</p>
                <p className="text-neutral-600 m-0 text-xs">Public Trust Reg. No. 467/2001-02 • Bengaluru, Karnataka</p>
                <p className="text-neutral-700 m-0 mt-1">Official Portal: <a href="https://akshayapatra.org" target="_blank" rel="noopener noreferrer" className="underline font-bold">akshayapatra.org</a></p>
              </div>
            </div>
          </section>
        </div>
      );

    case "international-remittances-and-cryptocurrency-tax":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              1. Outward Foreign Remittances: The RBI LRS Framework
            </h3>
            <p>
              Under the <strong>Liberalised Remittance Scheme (LRS)</strong> administered by the Reserve Bank of India, resident individuals can remit up to <strong>USD 250,000</strong> per financial year (April to March) for permissible capital and current account transactions.
            </p>
            <p>
              Permissible transactions include: overseas education, travel, medical treatment, gift remittances to relatives, purchasing immovable property abroad, and investing in foreign shares. The transfer must be routed strictly through an <strong>Authorized Dealer Category-I (AD-I) Bank</strong> using Form A2. Remittances are not permitted for buying lottery tickets, sweepstakes, margins for foreign currency trading, or transfers to non-compliant FATF jurisdictions.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              2. Tax Collected at Source (TCS) under Section 206C(1G)
            </h3>
            <p>
              Under Section 206C(1G) of the Income Tax Act, the remitting bank collects TCS on outward remittances:
            </p>
            <div className="border-2 border-black p-4 bg-white text-xs md:text-sm space-y-2">
              <p className="m-0">• <strong>Overseas Tour Program Packages:</strong> 5% TCS on amounts up to Rs 7 Lakhs; <strong>20% TCS</strong> on amounts exceeding Rs 7 Lakhs per individual per financial year.</p>
              <p className="m-0">• <strong>Education Remittances (Funded by Loan):</strong> 0.5% TCS on amounts exceeding Rs 7 Lakhs.</p>
              <p className="m-0">• <strong>Education / Medical Treatment (Self-Funded):</strong> 5% TCS on amounts exceeding Rs 7 Lakhs.</p>
              <p className="m-0">• <strong>General Remittances (Gifts, Investments, Property):</strong> <strong>20% TCS</strong> on all amounts exceeding the Rs 7 Lakhs aggregate threshold.</p>
            </div>
            <p className="text-xs text-neutral-600">
              Note: TCS is not an additional tax expense; it is credited directly to the remitter&rsquo;s PAN in Form 26AS/AIS and can be adjusted against income tax payable or claimed as a refund in the annual ITR.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              3. India ↔ UAE Remittance Corridors &amp; CBUAE AML Compliance
            </h3>
            <p>
              The India-UAE financial corridor is heavily regulated under both Indian FEMA rules and UAE financial laws:
            </p>
            <p>
              In the UAE, cross-border remittances are overseen by the <strong>Central Bank of the UAE (CBUAE)</strong> and the <strong>Executive Office for AML/CFT</strong> under <em>Federal Decree-Law No. (20) of 2018 on Anti-Money Laundering</em>. Licensed exchange houses and banks must report all suspicious transactions through the <strong>goAML portal</strong>.
            </p>
            <p>
              Under the <strong>Comprehensive Economic Partnership Agreement (CEPA)</strong> and the integration of India&rsquo;s UPI with the UAE&rsquo;s Jaywan and AANI payment systems, legitimate low-cost retail remittances are facilitated through official banking rails. Any resort to unofficial hawala networks constitutes a severe offense under FEMA Section 13 (penalties up to 3x the sum) and PMLA Section 3.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              4. Virtual Digital Assets (VDA) &amp; Cryptocurrency Taxation
            </h3>
            <p>
              Finance Act 2022 inserted a comprehensive taxation code for Virtual Digital Assets (cryptocurrency, tokens, NFTs) under <strong>Section 2(47A)</strong> of the Income Tax Act:
            </p>
            <div className="bg-[#fafafa] border-2 border-black p-5 space-y-3 text-xs md:text-sm">
              <div className="border-b border-neutral-300 pb-2">
                <span className="font-mono font-bold text-black uppercase block">Flat 30% Tax Rate (Section 115BBH)</span>
                <p className="m-0 text-neutral-800">
                  Income from transfer of any VDA is taxed at a flat 30% (+ 4% cess = <strong>31.2%</strong>). No basic exemption limit applies to VDA gains.
                </p>
              </div>
              <div className="border-b border-neutral-300 pb-2">
                <span className="font-mono font-bold text-black uppercase block">Zero Expense Deductions &amp; Loss Ring-Fencing</span>
                <p className="m-0 text-neutral-800">
                  No deduction is allowed for any expenditure other than the direct <strong>cost of acquisition</strong>. Mining electricity, hardware depreciation, internet bills, and exchange trading fees CANNOT be deducted. Crucially, a loss from one crypto coin (e.g. BTC) CANNOT be set off against gains from another coin (e.g. ETH), nor against any other income head, and cannot be carried forward.
                </p>
              </div>
              <div>
                <span className="font-mono font-bold text-black uppercase block">1% Tax Deducted at Source (Section 194S)</span>
                <p className="m-0 text-neutral-800">
                  Every buyer or crypto exchange facilitating a transfer must deduct 1% TDS on consideration exceeding Rs 50,000 (or Rs 10,000 for specified individuals) to create an unbroken transaction audit trail.
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-700">
              FIU-IND Mandate: All domestic and offshore crypto exchanges operating in India are legally mandated to register with FIU-IND as reporting entities. Unregistered foreign exchanges have had their domains blocked by MeitY for PMLA non-compliance.
            </p>
          </section>
        </div>
      );

    case "documented-case-studies-and-judicial-precedents":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              Supreme Court &amp; Appellate Jurisprudence on Financial Crimes
            </h3>
            <p>
              Indian courts have consistently dismantled artificial legal structures designed to disguise illicit wealth or evade direct taxes.
              The doctrine of <em>&ldquo;substance over form&rdquo;</em> and the rule of <em>&ldquo;human probabilities&rdquo;</em> established in <em>Sumati Dayal v. CIT (1995)</em> and <em>McDowell and Co. Ltd. v. Commercial Tax Officer (1985)</em> allow tax authorities and courts to look behind the facade of contracts and banking entries to assess real economic facts.
            </p>
            <p>
              Below are five verified case studies documenting how Indian courts and enforcement agencies adjudicated major financial infractions.
            </p>
          </section>
        </div>
      );

    case "tax-notices-scrutiny-and-appeal-procedures":
      return (
        <div className="space-y-8 text-neutral-900 leading-relaxed font-sans text-sm md:text-base">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              1. Direct Tax Notice Taxonomy: Purpose &amp; Deadlines
            </h3>
            <div className="space-y-3 text-xs md:text-sm">
              <div className="border border-black p-4 bg-white">
                <span className="font-mono font-bold uppercase text-black block mb-1">Section 133(6) — Calling for Information</span>
                <p className="m-0 text-neutral-700">
                  Issued during preliminary inquiry or verification. Requires the recipient to produce specific transaction documents or confirm payments made to third parties. Failure to comply attracts a statutory penalty of Rs 500 per day under Section 272A.
                </p>
              </div>
              <div className="border border-black p-4 bg-white">
                <span className="font-mono font-bold uppercase text-black block mb-1">Section 142(1) — Inquiry Before Assessment</span>
                <p className="m-0 text-neutral-700">
                  Directs the assessee to file a return (if not filed) or furnish accounts, books, assets and liabilities statements in writing. Non-compliance enables the Assessing Officer to proceed to a Best Judgment Assessment under Section 144.
                </p>
              </div>
              <div className="border border-black p-4 bg-white">
                <span className="font-mono font-bold uppercase text-black block mb-1">Section 143(2) — Scrutiny Notice (CASS)</span>
                <p className="m-0 text-neutral-700">
                  Issued where a return has been filed and the AO considers it necessary to verify the correctness of the return. Must be served within <strong>3 months</strong> from the end of the financial year in which the return was furnished.
                </p>
              </div>
              <div className="border border-black p-4 bg-white">
                <span className="font-mono font-bold uppercase text-black block mb-1">Section 148 / 148A — Reassessment for Escaped Income</span>
                <p className="m-0 text-neutral-700">
                  Mandates a preliminary inquiry under 148A(a), a show-cause notice under 148A(b), an order under 148A(d), and formal reopening under 148. Subject to 3-year and 10-year limitation rules under Section 149.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              2. The Statutory Appellate Hierarchy (Chapter XX)
            </h3>
            <p>
              If an adverse assessment order is passed, the Income Tax Act provides an orderly statutory appellate ladder:
            </p>
            <div className="border-2 border-black p-5 bg-[#fbfbfb] space-y-3 text-xs md:text-sm">
              <div>
                <p className="font-mono font-black uppercase text-black m-0">Stage 1: Commissioner of Income Tax (Appeals) — Section 246A</p>
                <p className="m-0 text-neutral-700">
                  First appellate authority. Appeals are filed online via Form 35 within 30 days of receipt of assessment order under the Faceless Appeal Scheme. CIT(A) has power to confirm, reduce, enhance, or annul the assessment.
                </p>
              </div>
              <div className="border-t border-neutral-300 pt-2">
                <p className="font-mono font-black uppercase text-black m-0">Stage 2: Income Tax Appellate Tribunal (ITAT) — Section 253</p>
                <p className="m-0 text-neutral-700">
                  The final fact-finding authority. Appeals are filed in Form 36 within 60 days. Benches consist of one Judicial Member and one Accountant Member.
                </p>
              </div>
              <div className="border-t border-neutral-300 pt-2">
                <p className="font-mono font-black uppercase text-black m-0">Stage 3: High Court — Section 260A</p>
                <p className="m-0 text-neutral-700">
                  Appeal lies to the respective State High Court within 120 days ONLY on a <strong>Substantial Question of Law</strong>. Pure questions of fact resolved by the ITAT cannot be challenged before the High Court.
                </p>
              </div>
              <div className="border-t border-neutral-300 pt-2">
                <p className="font-mono font-black uppercase text-black m-0">Stage 4: Supreme Court of India — Section 261</p>
                <p className="m-0 text-neutral-700">
                  Appeal by certificate granted by High Court under Section 261 or via Special Leave Petition (SLP) under Article 136 of the Constitution of India. Ruling constitutes the binding law of the land under Article 141.
                </p>
              </div>
            </div>
          </section>
        </div>
      );

    default:
      return null;
  }
}
