// ETW — De-Basement Document Checklist View Component
// High-clarity checklist for taxpayers preparing documentation.

import React from "react";
import { DocumentChecklist } from "@/data/de-basement/types";

interface ChecklistViewProps {
  checklists: DocumentChecklist[];
}

export function ChecklistView({ checklists }: ChecklistViewProps) {
  if (!checklists || checklists.length === 0) return null;

  return (
    <div className="my-10 space-y-8">
      {checklists.map((cl) => (
        <div
          key={cl.id}
          className="border-2 border-black bg-white p-6"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="font-mono text-xs font-black uppercase px-2 py-0.5 bg-black text-white">
                DOCUMENT CHECKLIST
              </span>
              <span className="text-xs font-mono font-bold text-neutral-600">
                {cl.statutoryReference}
              </span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-black m-0 mt-2">
              {cl.title}
            </h3>
            <p className="text-xs text-neutral-700 font-medium mt-1 mb-0">
              Target Procedure: {cl.targetProcedure}
            </p>
          </div>

          {/* Verification guidance */}
          {cl.verificationGuidance && (
            <div className="bg-[#f5f5f5] border-l-4 border-black p-3 mb-6 text-xs text-neutral-800 leading-relaxed">
              <span className="font-bold text-black uppercase font-mono mr-1">Statutory Guidance:</span>
              {cl.verificationGuidance}
            </div>
          )}

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="etw-table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f0f0f0] border-b-2 border-black">
                  <th className="p-3 font-black uppercase text-black w-8">Req.</th>
                  <th className="p-3 font-black uppercase text-black">Document &amp; Authority</th>
                  <th className="p-3 font-black uppercase text-black">Evidentiary Purpose</th>
                  <th className="p-3 font-black uppercase text-black">Statutory Ground</th>
                </tr>
              </thead>
              <tbody>
                {cl.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-300 hover:bg-[#fafafa]">
                    <td className="p-3 font-mono font-bold text-center">
                      {item.isMandatory ? (
                        <span className="px-1.5 py-0.5 bg-black text-white text-[10px] uppercase">YES</span>
                      ) : (
                        <span className="px-1.5 py-0.5 border border-neutral-400 text-neutral-600 text-[10px] uppercase">
                          OPT
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-black m-0">{item.documentName}</p>
                      <p className="text-[11px] text-neutral-500 m-0 font-mono mt-0.5">
                        Issuer: {item.issuingAuthority}
                      </p>
                      {item.notes && (
                        <p className="text-[11px] text-neutral-600 italic m-0 mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-neutral-800 leading-normal">{item.purpose}</td>
                    <td className="p-3 font-mono text-neutral-700">{item.statutoryRequirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
