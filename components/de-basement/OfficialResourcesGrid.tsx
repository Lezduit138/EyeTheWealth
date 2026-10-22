// ETW — De-Basement Official Resources & Regulatory Portals Grid Component
// Verified government links with statutory classifications.

import React from "react";
import { OfficialDirectoryEntry } from "@/data/de-basement/types";

interface OfficialResourcesGridProps {
  resources: OfficialDirectoryEntry[];
}

export function OfficialResourcesGrid({ resources }: OfficialResourcesGridProps) {
  if (!resources || resources.length === 0) return null;

  return (
    <div className="my-10">
      <div className="border-b-2 border-black pb-3 mb-6">
        <span className="font-mono text-xs font-black uppercase px-2 py-0.5 bg-black text-white mr-3">
          REGULATORY DIRECTORY
        </span>
        <h3 className="text-base font-black uppercase tracking-wider text-black m-0 inline">
          OFFICIAL LEGISLATION &amp; GOVERNMENT PORTALS
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, idx) => (
          <div
            key={idx}
            className="border-2 border-black bg-white p-5 flex flex-col justify-between"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-neutral-300 pb-2 mb-3">
                <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-[#f0f0f0] border border-neutral-400 text-black">
                  {res.category.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] font-mono text-neutral-600 font-bold">
                  {res.applicableAct}
                </span>
              </div>

              <h4 className="text-sm md:text-base font-black uppercase tracking-tight text-black m-0 mb-1">
                {res.title}
              </h4>
              <p className="text-[11px] font-mono font-bold text-neutral-600 mb-3">
                Authority: {res.authority}
              </p>

              <p className="text-xs text-neutral-800 leading-relaxed mb-4 font-sans">
                {res.description}
              </p>

              <div className="bg-[#f8f8f8] border-l-2 border-black p-2 mb-4 text-[11px]">
                <span className="font-mono font-bold uppercase text-black block mb-0.5">
                  Statutory Services:
                </span>
                <span className="text-neutral-700">{res.primaryService}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-xs">
              <span className="font-mono text-neutral-500 text-[10px]">VERIFIED DOMAIN</span>
              <a
                href={res.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="etw-btn text-xs px-3 py-1.5 font-bold uppercase"
              >
                ACCESS PORTAL ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
