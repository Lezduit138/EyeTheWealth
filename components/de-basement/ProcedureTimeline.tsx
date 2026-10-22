// ETW — De-Basement Step-by-Step Procedure Timeline Component
// Visualizes lawful procedures with required documentation, statutory rules, and pitfalls.

import React from "react";
import { StepProcedureItem } from "@/data/de-basement/types";

interface ProcedureTimelineProps {
  title?: string;
  steps: StepProcedureItem[];
}

export function ProcedureTimeline({ title = "STEP-BY-STEP LAWFUL PROCEDURE", steps }: ProcedureTimelineProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-10">
      <div className="flex items-center gap-3 border-b-2 border-black pb-3 mb-6">
        <span className="font-mono text-xs font-black uppercase px-2 py-0.5 bg-black text-white">
          PROCEDURAL ROADMAP
        </span>
        <h3 className="text-base font-black uppercase tracking-wider text-black m-0">{title}</h3>
      </div>

      <div className="space-y-6">
        {steps.map((st) => (
          <div
            key={st.stepNumber}
            className="border-2 border-black bg-white p-5 md:p-6 transition-all"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            {/* Header row */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-300 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center font-black text-sm bg-black text-white shrink-0 font-mono">
                  {st.stepNumber}
                </span>
                <h4 className="text-sm md:text-base font-black uppercase tracking-wide text-black m-0">
                  {st.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
                <span className="px-2 py-0.5 border border-neutral-400 font-bold">
                  {st.timeframe}
                </span>
              </div>
            </div>

            {/* Applicable law */}
            <div className="mb-3 text-xs">
              <span className="font-mono font-bold uppercase text-neutral-600 mr-2">Governing Statute:</span>
              <span className="font-bold text-black bg-[#f0f0f0] px-2 py-0.5 border border-neutral-300">
                {st.applicableLaw}
              </span>
            </div>

            {/* Action required */}
            <div className="mb-4 text-xs md:text-sm text-neutral-800 leading-relaxed font-sans">
              <p className="m-0">{st.actionRequired}</p>
            </div>

            {/* Required documents list */}
            {st.requiredDocuments && st.requiredDocuments.length > 0 && (
              <div className="mb-4 bg-[#f8f8f8] border-l-4 border-black p-3">
                <p className="font-mono text-xs font-bold uppercase text-black mb-2">
                  Mandatory Evidentiary Documentation:
                </p>
                <ul className="list-disc pl-5 m-0 space-y-1 text-xs text-neutral-800">
                  {st.requiredDocuments.map((doc, dIdx) => (
                    <li key={dIdx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer row: Costs & Pitfalls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-200 text-xs">
              {st.potentialCostsOrPenalties && (
                <div>
                  <span className="font-mono font-bold uppercase text-neutral-600 block mb-0.5">
                    Statutory Cost / Tax Surcharge:
                  </span>
                  <span className="text-neutral-900 font-bold">{st.potentialCostsOrPenalties}</span>
                </div>
              )}
              {st.commonMistakesOrRisks && (
                <div>
                  <span className="font-mono font-bold uppercase text-neutral-700 block mb-0.5">
                    Critical Pitfall to Avoid:
                  </span>
                  <span className="text-neutral-800">{st.commonMistakesOrRisks}</span>
                </div>
              )}
            </div>

            {/* Official resource link */}
            {st.officialResource && (
              <div className="mt-3 text-right">
                <span className="text-[11px] font-mono text-neutral-500">
                  Resource: {st.officialResource}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
