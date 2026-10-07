/* eslint-disable */
"use client";

// ETW â€” Global Header with navigation

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/rover", label: "ROVER" },
  { href: "/contributor", label: "CONTRIBUTOR" },
  { href: "/de-basement", label: "DE BASEMENT" },
  { href: "/methodology", label: "METHODOLOGY" },
];

export function Header({ session }: { session?: any }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      role="banner"
      style={{
        borderBottom: "2px solid #000",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="etw-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
          }}
          aria-label="ETW â€” Eye The Wealth, home"
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: "1.25rem",
              letterSpacing: "-0.03em",
              color: "#000",
            }}
          >
            ETW
          </span>
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            EYE THE WEALTH
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          style={{ display: "flex", gap: "0", alignItems: "center" }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "0 1rem",
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: isActive ? "3px solid #000" : "3px solid transparent",
                  color: isActive ? "#000" : "var(--color-text-muted)",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div style={{ marginLeft: "1rem" }}>
            {session?.user ? (
              <div className="flex gap-4 items-center">
                {["ADMIN", "EDITOR"].includes((session.user as any).role) && (
                  <Link href="/admin" className="text-xs font-bold underline">
                    Admin
                  </Link>
                )}
                <Link href="/account" className="etw-btn text-xs px-3 py-1">
                  {session.user.name || session.user.email?.split("@")[0]} ({((session.user as any).role || "USER").substring(0, 1)})
                </Link>
              </div>
            ) : (
              <Link href="/login" className="etw-btn text-xs px-3 py-1">
                SIGN IN
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            fontSize: "1.5rem",
            lineHeight: 1,
          }}
        >
          {menuOpen ? "âœ•" : "â˜°"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "#fff",
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  color: isActive ? "#000" : "var(--color-text-muted)",
                  borderLeft: isActive ? "3px solid #000" : "3px solid transparent",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </header>
  );
}

