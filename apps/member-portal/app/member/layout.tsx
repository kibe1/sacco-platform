import type { ReactNode } from "react";
import { getCurrentUser } from "../lib/session";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  ["Dashboard", "/member/dashboard"],
  ["Savings", "/member/savings"],
  ["Loans", "/member/loans"],
  ["Wallet", "/member/wallet"],
  ["Statements", "/member/statements"],
  ["Profile", "/member/profile"],
  ["Support", "/member/support"]
];

export default async function MemberLayout({ children }: Readonly<{ children: ReactNode }>) {
  const currentUser = await getCurrentUser();
  const displayName = currentUser?.profile.displayName ?? "Member User";
  const tenantLabel = currentUser?.profile.tenantId ?? "local-sacco";

  return (
    <div className="member-shell">
      <aside className="member-sidebar">
        <div className="member-brand">
          <strong>Member Portal</strong>
          <span>KENYA SACCO LTD</span>
        </div>
        <div className="member-user">
          <span className="avatar" />
          <div>
            <strong>{displayName}</strong>
            <span>{tenantLabel}</span>
          </div>
        </div>
        <nav aria-label="Member navigation">
          {navItems.map(([label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="member-main">
        <header className="member-topbar">
          <span className="topbar-label">Self Service</span>
          <div className="member-search">Search contributions, loans, statements</div>
          <div className="topbar-actions">
            <span className="notification-pill">0 alerts</span>
            <ThemeToggle />
            <a className="logout-link" href="/auth/logout">
              Logout
            </a>
          </div>
        </header>
        <section className="member-content">{children}</section>
      </div>
    </div>
  );
}
