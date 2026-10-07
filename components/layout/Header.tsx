"use client";

// ETW — Global Header with navigation

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// Only non-module nav links — module cards are on the home page
const NAV_LINKS = [
  { href: "/methodology", label: "METHODOLOGY" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;
  const isAdmin = role === "ADMIN" || role === "EDITOR";

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
          aria-label="ETW — Eye The Wealth, home"
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
            const isActive = pathname.startsWith(link.href);
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
                  padding: "0 0.75rem",
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

          {/* Auth area */}
          <div style={{ marginLeft: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {status === "loading" ? (
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>•••</span>
            ) : user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      color: "var(--color-text-muted)",
                      padding: "0 0.5rem",
                      height: "56px",
                      display: "flex",
                      alignItems: "center",
                      borderBottom: pathname.startsWith("/admin") ? "3px solid #000" : "3px solid transparent",
                    }}
                  >
                    ADMIN
                  </Link>
                )}
                <Link
                  href="/account"
                  aria-label={`Account: ${user.name || user.email}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    background: "#000",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "0.75rem",
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                    flexShrink: 0,
                  }}
                  title={`${user.name || user.email} (${role})`}
                >
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: "2px solid #000",
                  padding: "0.375rem 0.875rem",
                  color: "#000",
                  transition: "background 0.15s, color 0.15s",
                }}
                className="etw-btn"
              >
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
          {menuOpen ? "✕" : "☰"}
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
          {[
            { href: "/methodology", label: "METHODOLOGY" },
          ].map((link) => {
            const isActive = pathname.startsWith(link.href);
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

          {/* Mobile auth */}
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "1rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color: "var(--color-text-muted)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  ADMIN DASHBOARD
                </Link>
              )}
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  color: "#000",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                MY ACCOUNT ({user.name || user.email})
              </Link>
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "1rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "1rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                color: "#000",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              SIGN IN
            </Link>
          )}
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
