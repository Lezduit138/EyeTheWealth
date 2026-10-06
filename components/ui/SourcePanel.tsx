"use client";

// ETW — Expandable Source Panel Component
// Shows: value, source, year/date, definition, source URL, evidence

import React, { useState } from "react";

interface SourcePanelProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SourcePanel({
  title = "Source & Methodology",
  children,
  defaultOpen = false,
  className = "",
}: SourcePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`etw-source-panel ${className}`}>
      <button
        className="etw-source-panel-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>
          {isOpen ? "▾" : "▸"}&nbsp;&nbsp;{title}
        </span>
        <span className="etw-label">{isOpen ? "COLLAPSE" : "EXPAND"}</span>
      </button>
      {isOpen && (
        <div className="etw-source-panel-content" role="region">
          {children}
        </div>
      )}
    </div>
  );
}

interface SourceRowProps {
  label: string;
  value: React.ReactNode;
}

export function SourceRow({ label, value }: SourceRowProps) {
  return (
    <div className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
      <span
        className="etw-label flex-shrink-0 w-32"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {value ?? <span className="etw-not-disclosed">Not publicly disclosed</span>}
      </span>
    </div>
  );
}

// Convenience: full source detail block
interface SourceDetailProps {
  value?: React.ReactNode;
  unit?: string;
  year?: number | string;
  sourceName?: string;
  sourceUrl?: string;
  definition?: string;
  methodology?: string;
  collectionDate?: string;
  verificationStatus?: string;
  notes?: string;
}

export function SourceDetail({
  value,
  unit,
  year,
  sourceName,
  sourceUrl,
  definition,
  methodology,
  collectionDate,
  verificationStatus,
  notes,
}: SourceDetailProps) {
  return (
    <div>
      {value !== undefined && (
        <SourceRow label="VALUE" value={`${value}${unit ? ` ${unit}` : ""}`} />
      )}
      {year && <SourceRow label="YEAR" value={year} />}
      {sourceName && (
        <SourceRow
          label="SOURCE"
          value={
            sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {sourceName} ↗
              </a>
            ) : (
              sourceName
            )
          }
        />
      )}
      {definition && <SourceRow label="DEFINITION" value={definition} />}
      {methodology && <SourceRow label="METHODOLOGY" value={methodology} />}
      {collectionDate && <SourceRow label="RETRIEVED" value={collectionDate} />}
      {verificationStatus && <SourceRow label="STATUS" value={verificationStatus} />}
      {notes && <SourceRow label="NOTES" value={notes} />}
    </div>
  );
}
