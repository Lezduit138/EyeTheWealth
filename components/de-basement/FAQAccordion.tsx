// ETW — De-Basement FAQ Accordion Component
// Client-side accessible accordion with category filtering and statutory citations.

"use client";

import React, { useState } from "react";
import { FAQItem } from "@/data/de-basement/types";

interface FAQAccordionProps {
  faqs: FAQItem[];
  showCategoryFilter?: boolean;
}

export function FAQAccordion({ faqs, showCategoryFilter = true }: FAQAccordionProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ["ALL", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = selectedCategory === "ALL" || f.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.statutoryCitation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="my-10">
      <div className="border-b-2 border-black pb-3 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black uppercase px-2 py-0.5 bg-black text-white">
            COMPLIANCE Q&amp;A
          </span>
          <h3 className="text-base font-black uppercase tracking-wider text-black m-0">
            FREQUENTLY ASKED QUESTIONS
          </h3>
        </div>
        <span className="text-xs font-mono text-neutral-600">
          Showing {filteredFaqs.length} of {faqs.length} entries
        </span>
      </div>

      {showCategoryFilter && (
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-mono uppercase px-3 py-1 font-bold border transition-colors ${
                  selectedCategory === cat
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-neutral-300 hover:border-black"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div>
            <input
              type="text"
              placeholder="Search compliance questions, statutory sections, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="etw-input text-xs w-full p-2.5 border-2 border-black bg-white"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredFaqs.map((faq) => {
          const isOpen = !!openIds[faq.id];
          return (
            <div
              key={faq.id}
              className="border-2 border-black bg-white transition-all"
              style={{ boxShadow: isOpen ? "3px 3px 0px #000" : "2px 2px 0px #000" }}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full text-left p-4 md:p-5 flex items-start justify-between gap-4 bg-transparent border-none cursor-pointer group"
                aria-expanded={isOpen}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#f0f0f0] border border-neutral-300 text-neutral-700">
                      {faq.category.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500 font-bold">
                      {faq.statutoryCitation}
                    </span>
                  </div>
                  <h4 className="text-sm md:text-base font-black text-black group-hover:underline m-0 leading-snug">
                    {faq.question}
                  </h4>
                </div>
                <span className="font-mono text-base font-black shrink-0 w-6 h-6 border-2 border-black flex items-center justify-center bg-black text-white">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="p-4 md:p-5 pt-0 border-t border-neutral-200">
                  <p className="text-xs md:text-sm text-neutral-800 leading-relaxed mb-4 font-sans">
                    {faq.answer}
                  </p>
                  <div className="bg-[#f7f7f7] border-l-4 border-black p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold uppercase text-black">Statutory Rule:</span>
                      <span className="font-mono text-neutral-800">{faq.keyRuleSummary}</span>
                    </div>
                    {faq.officialReferenceUrl && (
                      <a
                        href={faq.officialReferenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] underline font-bold text-black"
                      >
                        Official Reference ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
