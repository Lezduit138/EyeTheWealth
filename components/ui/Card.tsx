// ETW — Card Component (bordered, no shadow, square corners)

import React from "react";
import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({ children, className = "", dark = false, padding = "md" }: CardProps) {
  const padClass = { sm: "p-4", md: "p-6", lg: "p-8" }[padding];
  const base = dark ? "etw-card-dark" : "etw-card";
  return (
    <div className={`${base} ${padClass} ${className}`}>
      {children}
    </div>
  );
}

// Clickable module card (landing page / nav cards)
interface ModuleCardProps {
  href: string;
  title: string;
  subtitle?: string;
  description: string;
  cta?: string;
  className?: string;
}

export function ModuleCard({
  href,
  title,
  subtitle,
  description,
  cta = "→ ENTER",
  className = "",
}: ModuleCardProps) {
  return (
    <Link href={href} className={`etw-module-card ${className}`} aria-label={`Enter ${title} module`}>
      <div>
        <div className="etw-label mb-2" style={{ color: "var(--color-text-muted)" }}>
          MODULE
        </div>
        <h2
          className="font-black tracking-tight"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1 }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-1"
            style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <hr className="etw-divider" />
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
        {description}
      </p>
      <div className="mt-auto">
        <span
          className="font-bold tracking-widest"
          style={{ fontSize: "0.75rem", letterSpacing: "0.15em" }}
        >
          {cta}
        </span>
      </div>
    </Link>
  );
}

// Sample data warning card
interface SampleDataBannerProps {
  message?: string;
  className?: string;
}

export function SampleDataBanner({
  message = "SAMPLE DATA — NOT REAL. This information is placeholder data for development purposes only.",
  className = "",
}: SampleDataBannerProps) {
  return (
    <div className={`etw-sample-banner ${className}`} role="alert" aria-live="polite">
      ⚠ {message}
    </div>
  );
}
