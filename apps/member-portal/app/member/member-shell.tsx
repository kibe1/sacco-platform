"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MemberHeaderActions } from "./member-header-actions";

const navItems = [
  ["Dashboard", "/member/dashboard", "/tailadmin-icons/grid.svg"],
  ["Savings", "/member/savings", "/tailadmin-icons/box.svg"],
  ["Loans", "/member/loans", "/tailadmin-icons/dollar-line.svg"],
  ["Wallet", "/member/wallet", "/tailadmin-icons/box-cube.svg"],
  ["Statements", "/member/statements", "/tailadmin-icons/docs.svg"],
  ["Profile", "/member/profile", "/tailadmin-icons/user-circle.svg"],
  ["Support", "/member/support", "/tailadmin-icons/info.svg"]
];

export function MemberShell({
  children,
  displayName,
  email,
  initials
}: {
  children: ReactNode;
  displayName: string;
  email: string;
  initials: string;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("member-command-search")?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`member-shell ${isCollapsed ? "is-collapsed" : ""} ${isCollapsed && isSidebarHovered ? "is-hovered" : ""}`}>
      <button
        className={`member-backdrop ${isMobileOpen ? "is-visible" : ""}`}
        type="button"
        aria-label="Close navigation"
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`member-sidebar ${isMobileOpen ? "is-open" : ""}`}
        aria-label="Member navigation"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="member-brand">
          <span className="member-logo-mark">KSL</span>
          <strong>Kenya Sacco LTD</strong>
        </div>
        <nav aria-label="Member navigation">
          <p>Member Services</p>
          {navItems.map(([label, href, icon]) => {
            const isActive = pathname === href;

            return (
              <Link
                className={isActive ? "is-active" : ""}
                href={href}
                key={href}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="member-nav-icon">
                  <img src={icon} alt="" aria-hidden="true" />
                </span>
                <span className="member-nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="member-main">
        <header className="member-topbar">
          <div className="member-header-left">
            <button
              className="member-icon-button"
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setIsCollapsed((current) => !current)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <button
              className="member-icon-button mobile-only"
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsMobileOpen(true)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <label className="member-search" htmlFor="member-command-search">
              <span aria-hidden="true">⌕</span>
              <input id="member-command-search" placeholder="Search savings, loans, statements..." />
              <kbd>⌘ K</kbd>
            </label>
          </div>
          <MemberHeaderActions displayName={displayName} email={email} initials={initials} />
        </header>
        <section className="member-content">{children}</section>
      </div>
    </div>
  );
}
