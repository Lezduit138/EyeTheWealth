// ETW — Reusable Status/Verification Badge Component

import React from "react";

export type VerificationStatus =
  | "OFFICIAL"
  | "VERIFIED"
  | "UNVERIFIED"
  | "ESTIMATED"
  | "NOT_DISCLOSED"
  | "SAMPLE"
  | "CONFIRMED_RESPONDING"
  | "OPERATING_NEARBY"
  | "DOCUMENTED"
  | "REPORTED_MEDIA"
  | "ILLUSTRATIVE";

const BADGE_CONFIG: Record<
  VerificationStatus,
  { label: string; className: string; icon: string }
> = {
  OFFICIAL: {
    label: "Official",
    className: "etw-badge etw-badge-official",
    icon: "○",
  },
  VERIFIED: {
    label: "Verified",
    className: "etw-badge etw-badge-verified",
    icon: "✓",
  },
  UNVERIFIED: {
    label: "Unverified",
    className: "etw-badge etw-badge-unverified",
    icon: "?",
  },
  ESTIMATED: {
    label: "Estimated",
    className: "etw-badge etw-badge-estimated",
    icon: "~",
  },
  NOT_DISCLOSED: {
    label: "Not publicly disclosed",
    className: "etw-badge etw-badge-not-disclosed",
    icon: "—",
  },
  SAMPLE: {
    label: "Sample Data",
    className: "etw-badge etw-badge-sample",
    icon: "⚠",
  },
  CONFIRMED_RESPONDING: {
    label: "Confirmed responding",
    className: "etw-badge etw-badge-verified",
    icon: "✓",
  },
  OPERATING_NEARBY: {
    label: "Operating nearby",
    className: "etw-badge etw-badge-unverified",
    icon: "○",
  },
  DOCUMENTED: {
    label: "Documented",
    className: "etw-badge etw-badge-official",
    icon: "●",
  },
  REPORTED_MEDIA: {
    label: "Reported by media",
    className: "etw-badge etw-badge-unverified",
    icon: "◎",
  },
  ILLUSTRATIVE: {
    label: "Illustrative (hypothetical)",
    className: "etw-badge etw-badge-sample",
    icon: "⚠",
  },
};

interface StatusBadgeProps {
  status: VerificationStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const config = BADGE_CONFIG[status] ?? BADGE_CONFIG["UNVERIFIED"];
  return (
    <span className={`${config.className} ${className}`} role="img" aria-label={config.label}>
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      {config.label}
    </span>
  );
}

// Source classification badge for NGO records
export type SourceClassification =
  | "OFFICIAL_GOVT"
  | "PUBLIC_FILING"
  | "NGO_ANNUAL_REPORT"
  | "CSR_DISCLOSURE"
  | "FCRA_DISCLOSURE"
  | "AUDITED_STATEMENT"
  | "NGO_WEBSITE"
  | "VERIFIED_PUBLIC";

const SOURCE_CLASSIFICATION_LABELS: Record<SourceClassification, string> = {
  OFFICIAL_GOVT: "Official government record",
  PUBLIC_FILING: "Public filing",
  NGO_ANNUAL_REPORT: "NGO annual report",
  CSR_DISCLOSURE: "CSR disclosure",
  FCRA_DISCLOSURE: "Foreign contribution disclosure",
  AUDITED_STATEMENT: "Audited financial statement",
  NGO_WEBSITE: "NGO website",
  VERIFIED_PUBLIC: "Verified public source",
};

interface SourceBadgeProps {
  classification: SourceClassification;
  sourceUrl?: string;
  sourceName?: string;
  className?: string;
}

export function SourceBadge({
  classification,
  sourceUrl,
  sourceName,
  className = "",
}: SourceBadgeProps) {
  const label = SOURCE_CLASSIFICATION_LABELS[classification] ?? classification;
  const content = (
    <span className={`etw-badge etw-badge-official ${className}`}>
      {label}
      {sourceName && ` · ${sourceName}`}
    </span>
  );

  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline hover:opacity-70"
        aria-label={`Source: ${label}${sourceName ? ` from ${sourceName}` : ""} (opens in new tab)`}
      >
        {content}
        <span className="etw-badge etw-badge-official ml-1">↗</span>
      </a>
    );
  }
  return content;
}
