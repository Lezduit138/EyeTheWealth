// ETW — De-Basement Statutory Legal Disclaimer Component
// Strict adherence to ETW design system: monochrome, high contrast, zero colors.

import React from "react";

export function StatutoryDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="border-2 border-black p-4 bg-[#fbfbfb] text-black mb-8"
        role="region"
        aria-label="Statutory Educational Notice"
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono text-xs font-black uppercase px-2 py-0.5 bg-black text-white">
            STATUTORY NOTICE
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            EDUCATIONAL &amp; TRANSPARENCY RESOURCE ONLY
          </span>
        </div>
        <p className="text-xs text-neutral-800 leading-relaxed m-0 font-sans">
          This portal provides public-record educational analysis of Indian direct tax legislation (Income Tax Act 1961),
          PMLA 2002, FEMA 1999, and RBI Master Directions. It does not provide legal, financial, or chartered accountancy advice.
          Taxpayers with undisclosed income must consult a certified Chartered Accountant or legal practitioner under Section 288.
        </p>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-black p-6 md:p-8 bg-white text-black mb-12"
      role="region"
      aria-label="Comprehensive Statutory Notice"
      style={{ boxShadow: "4px 4px 0px #000" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black uppercase px-2.5 py-1 bg-black text-white">
            STATUTORY COMPLIANCE DIRECTIVE
          </span>
          <h2 className="text-sm font-black tracking-widest uppercase m-0">
            TRANSPARENCY &amp; LEGAL INTEGRITY POLICY
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-neutral-600">
          SEC. 288 / IT ACT 1961
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-800 leading-relaxed font-sans">
        <div className="border-l-2 border-neutral-400 pl-4">
          <p className="font-bold text-black uppercase tracking-wider mb-1">1. Educational Scope</p>
          <p className="m-0 text-neutral-700">
            ETW De-Basement operates exclusively as an educational knowledge hub. It analyzes statutory procedures, judicial precedents, and regulatory compliance. It does not solicit clients or provide bespoke advisory services.
          </p>
        </div>
        <div className="border-l-2 border-neutral-400 pl-4">
          <p className="font-bold text-black uppercase tracking-wider mb-1">2. Zero Concealment Guidance</p>
          <p className="m-0 text-neutral-700">
            This platform strictly explains lawful compliance and disclosure. It does not present sham loans, bogus gifts, entry-operator routing, or offshore concealment as legitimate methods.
          </p>
        </div>
        <div className="border-l-2 border-neutral-400 pl-4">
          <p className="font-bold text-black uppercase tracking-wider mb-1">3. Professional Representation</p>
          <p className="m-0 text-neutral-700">
            Addressing unassessed income, search matters, or Section 148 notices requires statutory representation under Section 288 of the Income Tax Act by a practicing Chartered Accountant (ICAI) or Advocate.
          </p>
        </div>
      </div>
    </div>
  );
}
