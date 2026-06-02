"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AdminNotificationDropdown } from "./components/notification-dropdown";
import { ThemeToggle } from "./theme-toggle";

type NavItem = {
  icon: string;
  label: string;
  href: string;
  badge?: "NEW";
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Core Operations",
    items: [
      { icon: "/tailadmin-icons/grid.svg", label: "Dashboard", href: "/admin/dashboard" },
      { icon: "/tailadmin-icons/user-line.svg", label: "Clients", href: "/admin/clients" },
      { icon: "/tailadmin-icons/group.svg", label: "Groups Manager", href: "#" },
      { icon: "/tailadmin-icons/box-cube.svg", label: "Branches", href: "#" },
      { icon: "/tailadmin-icons/user-circle.svg", label: "Branch Manager", href: "#" }
    ]
  },
  {
    title: "Finance",
    items: [
      { icon: "/tailadmin-icons/dollar-line.svg", label: "Accounting", href: "#" },
      { icon: "/tailadmin-icons/box.svg", label: "Savings", href: "#" },
      { icon: "/tailadmin-icons/dollar-line.svg", label: "Loans", href: "/admin/loans" },
      { icon: "/tailadmin-icons/file.svg", label: "Payroll", href: "#" },
      { icon: "/tailadmin-icons/arrow-down.svg", label: "Expenses", href: "#" },
      { icon: "/tailadmin-icons/arrow-up.svg", label: "Income", href: "#" },
      { icon: "/tailadmin-icons/pie-chart.svg", label: "Shares", href: "#" },
      { icon: "/tailadmin-icons/box-line.svg", label: "Assets", href: "#" }
    ]
  },
  {
    title: "Administration",
    items: [
      { icon: "/tailadmin-icons/user-circle.svg", label: "Users", href: "#" },
      { icon: "/tailadmin-icons/list.svg", label: "Custom Fields", href: "#" },
      { icon: "/tailadmin-icons/plug-in.svg", label: "Manage Modules", href: "/admin/modules" },
      { icon: "/tailadmin-icons/task.svg", label: "Settings", href: "#" },
      { icon: "/tailadmin-icons/list.svg", label: "Manage Menu", href: "/admin/menu-manager" },
      { icon: "/tailadmin-icons/shooting-star.svg", label: "Themes", href: "/admin/theme-manager" },
      { icon: "/tailadmin-icons/time.svg", label: "Activity Logs", href: "#" }
    ]
  },
  {
    title: "Channels & Insights",
    items: [
      { icon: "/tailadmin-icons/mail-line.svg", label: "Communication", href: "#" },
      { icon: "/tailadmin-icons/table.svg", label: "Reports", href: "#" },
      { icon: "/tailadmin-icons/task-icon.svg", label: "Channel Config", href: "#", badge: "NEW" },
      { icon: "/tailadmin-icons/check-circle.svg", label: "Platform Health", href: "#" }
    ]
  }
];

function ProfileIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11.0991 7.52507C11.0991 8.02213 11.5021 8.42507 11.9991 8.42507H12.0001C12.4972 8.42507 12.9001 8.02213 12.9001 7.52507C12.9001 7.02802 12.4972 6.62507 12.0001 6.62507H11.9991C11.5021 6.62507 11.0991 7.02802 11.0991 7.52507ZM12.0001 17.3714C11.5859 17.3714 11.2501 17.0356 11.2501 16.6214V10.9449C11.2501 10.5307 11.5859 10.1949 12.0001 10.1949C12.4143 10.1949 12.7501 10.5307 12.7501 10.9449V16.6214C12.7501 17.0356 12.4143 17.3714 12.0001 17.3714Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497V14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497V5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501H14.3507V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609H18.5007C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609V18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484H16.0007C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484H5.81528L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AdminShell({
  children,
  displayName,
  email
}: {
  children: ReactNode;
  displayName: string;
  email: string;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Core Operations": true,
    Finance: true,
    Administration: true,
    "Channels & Insights": true
  });

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [displayName]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("admin-command-search")?.focus();
      }

      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function toggleGroup(title: string) {
    setOpenGroups((current) => ({ ...current, [title]: !current[title] }));
  }

  return (
    <div className={`tailadmin-shell ${isCollapsed ? "is-collapsed" : ""} ${isCollapsed && isSidebarHovered ? "is-hovered" : ""}`}>
      <button
        className={`tailadmin-backdrop ${isMobileOpen ? "is-visible" : ""}`}
        type="button"
        aria-label="Close navigation"
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`tailadmin-sidebar ${isMobileOpen ? "is-open" : ""}`}
        aria-label="Admin navigation"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="tailadmin-brand">
          <Link href="/admin/dashboard" className="tailadmin-logo" aria-label="SACCO Admin dashboard">
            <span className="tailadmin-logo-mark">
              KSL
            </span>
            <span className="tailadmin-logo-text">
              <strong>Kenya Sacco LTD</strong>
            </span>
          </Link>
        </div>

        <nav className="tailadmin-nav">
          {navGroups.map((group) => (
            <section className="tailadmin-nav-group" key={group.title}>
              <button className="tailadmin-nav-heading" type="button" onClick={() => toggleGroup(group.title)}>
                <span>{group.title}</span>
                <img className="tailadmin-heading-dots" src="/tailadmin-icons/horizontal-dots.svg" alt="" aria-hidden="true" />
              </button>
              <div className={`tailadmin-nav-items ${openGroups[group.title] ? "is-open" : ""}`}>
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={`${group.title}-${item.label}`}
                      href={item.href}
                      className={`tailadmin-nav-item ${active ? "is-active" : ""}`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="tailadmin-nav-icon">
                        <img src={item.icon} alt="" aria-hidden="true" />
                      </span>
                      <span className="tailadmin-nav-label">{item.label}</span>
                      {item.badge && <span className="tailadmin-new-badge">{item.badge}</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>

      <div className="tailadmin-main">
        <header className="tailadmin-header">
          <div className="tailadmin-header-left">
            <button
              className="tailadmin-icon-button"
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setIsCollapsed((current) => !current)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <button
              className="tailadmin-icon-button mobile-only"
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsMobileOpen(true)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <label className="tailadmin-search" htmlFor="admin-command-search">
              <span aria-hidden="true">⌕</span>
              <input id="admin-command-search" placeholder="Search members, loans, branches..." />
              <kbd>⌘ K</kbd>
            </label>
          </div>

          <div className="tailadmin-header-actions">
            <ThemeToggle />
            <AdminNotificationDropdown />
            <div className="tailadmin-dropdown-wrap" ref={profileRef}>
              <button
                className="tailadmin-profile"
                type="button"
                onClick={() => {
                  setProfileOpen((current) => !current);
                }}
              >
                <span className="tailadmin-avatar">{initials}</span>
                <span className="tailadmin-profile-text">
                  <strong>{displayName}</strong>
                </span>
                <span className="tailadmin-profile-caret">⌄</span>
              </button>
              {profileOpen && (
                <div className="tailadmin-dropdown profile">
                  <div className="tailadmin-profile-menu-header">
                    <span className="tailadmin-avatar">{initials}</span>
                    <span>
                      <strong>{displayName}</strong>
                      {email && <small>{email}</small>}
                    </span>
                  </div>
                  <Link href="#">
                    <ProfileIcon />
                    <span>Profile settings</span>
                  </Link>
                  <Link href="#">
                    <HealthIcon />
                    <span>Platform health</span>
                  </Link>
                  <a href="/auth/logout">
                    <SignOutIcon />
                    <span>Logout</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="tailadmin-content">{children}</section>
      </div>
    </div>
  );
}
