// ETW — De-Basement Comparison Table Component
// Renders structured comparison matrices using ETW strict monochrome styles.

import React from "react";

interface ComparisonTableProps {
  title: string;
  description?: string;
  headers: string[];
  rows: Record<string, string | number | boolean>[];
}

export function ComparisonTable({ title, description, headers, rows }: ComparisonTableProps) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="border-2 border-black my-8 bg-white" style={{ boxShadow: "3px 3px 0px #000" }}>
      <div className="bg-black text-white p-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-white m-0">{title}</h3>
        {description && <p className="text-xs text-neutral-300 mt-1 mb-0 leading-normal">{description}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="etw-table w-full text-left border-collapse" style={{ minWidth: "640px" }}>
          <thead>
            <tr className="bg-[#f0f0f0] border-b-2 border-black">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="p-3 text-xs font-black uppercase tracking-wider text-black border-r border-neutral-300 last:border-r-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const values = Object.values(row);
              return (
                <tr
                  key={rIdx}
                  className={`border-b border-neutral-300 hover:bg-[#fafafa] transition-colors ${
                    rIdx % 2 === 1 ? "bg-[#fcfcfc]" : "bg-white"
                  }`}
                >
                  {values.map((val: unknown, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-3 text-xs leading-relaxed text-neutral-900 border-r border-neutral-200 last:border-r-0 ${
                        cIdx === 0 ? "font-bold text-black bg-[#f7f7f7]" : ""
                      }`}
                    >
                      {String(val)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
