"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const notifications = [
  {
    actor: "Savings Desk",
    message: "posted your monthly contribution",
    subject: "Savings Account",
    category: "Savings",
    time: "5 min ago",
    online: true
  },
  {
    actor: "Credit Desk",
    message: "updated repayment status",
    subject: "Loan Account",
    category: "Loan",
    time: "12 min ago",
    online: true
  },
  {
    actor: "Member Services",
    message: "received your service request",
    subject: "Support Ticket",
    category: "Support",
    time: "25 min ago",
    online: false
  }
];

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM7.75 6.25a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM10 11.25c-3.15 0-5.75 1.77-5.75 4.05 0 .69.56 1.2 1.22 1.2h9.06c.66 0 1.22-.51 1.22-1.2 0-2.28-2.6-4.05-5.75-4.05Zm-4.18 3.75c.32-1.17 2.02-2.25 4.18-2.25s3.86 1.08 4.18 2.25H5.82Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM4 10a6 6 0 1 1 12 0 6 6 0 0 1-12 0Zm6-.75a.75.75 0 0 0-.75.75v3.25a.75.75 0 0 0 1.5 0V10a.75.75 0 0 0-.75-.75Zm0-2.75a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.28 4.22a.75.75 0 0 1 0 1.06L4.56 9H12a.75.75 0 0 1 0 1.5H4.56l3.72 3.72a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0ZM10.75 4A.75.75 0 0 1 11.5 3.25h3.25A2.25 2.25 0 0 1 17 5.5v8.75a2.25 2.25 0 0 1-2.25 2.25H11.5a.75.75 0 0 1 0-1.5h3.25a.75.75 0 0 0 .75-.75V5.5a.75.75 0 0 0-.75-.75H11.5a.75.75 0 0 1-.75-.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.75 2.292C10.75 1.878 10.414 1.542 10 1.542s-.75.336-.75.75v.544A6.376 6.376 0 0 0 3.625 9.167v5.292h-.292a.75.75 0 0 0 0 1.5h13.334a.75.75 0 0 0 0-1.5h-.292V9.167a6.376 6.376 0 0 0-5.625-6.331v-.544Zm4.125 12.167V9.167a4.875 4.875 0 1 0-9.75 0v5.292h9.75ZM8 17.708a.75.75 0 0 0 .75.75h2.5a.75.75 0 0 0 0-1.5h-2.5a.75.75 0 0 0-.75.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MemberHeaderActions({
  displayName,
  email,
  initials
}: {
  displayName: string;
  email: string;
  initials: string;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="tailadmin-header-actions">
      <ThemeToggle />
      <div className="ta-notification-root" ref={notificationsRef}>
        <button
          className="ta-notification-button"
          onClick={() => {
            setNotificationsOpen((current) => !current);
            setNotifying(false);
          }}
          type="button"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
        >
          {notifying && <span className="ta-notification-dot"><span /></span>}
          <BellIcon />
        </button>
        {notificationsOpen && (
          <div className="ta-notification-panel">
            <div className="ta-notification-header">
              <h5>Notification</h5>
              <button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">
                <img src="/tailadmin-icons/close-line.svg" alt="" aria-hidden="true" />
              </button>
            </div>
            <ul className="ta-notification-list">
              {notifications.map((notification) => (
                <li key={`${notification.actor}-${notification.time}`}>
                  <Link href="#" className="ta-notification-item" onClick={() => setNotificationsOpen(false)}>
                    <span className="ta-notification-avatar">
                      <span className="ta-notification-initial" aria-hidden="true">
                        {notification.actor
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("")}
                      </span>
                      <span className={notification.online ? "online" : "offline"} />
                    </span>
                    <span className="ta-notification-copy">
                      <span>
                        <strong>{notification.actor}</strong> {notification.message}{" "}
                        <strong>{notification.subject}</strong>
                      </span>
                      <small>{notification.category}<b />{notification.time}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="#" className="ta-view-notifications" onClick={() => setNotificationsOpen(false)}>
              View All Notifications
            </Link>
          </div>
        )}
      </div>

      <div className="tailadmin-dropdown-wrap" ref={profileRef}>
        <button
          className="tailadmin-profile"
          type="button"
          onClick={() => setProfileOpen((current) => !current)}
          aria-expanded={profileOpen}
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
            <Link href="/member/profile" onClick={() => setProfileOpen(false)}>
              <ProfileIcon />
              <span>Profile settings</span>
            </Link>
            <Link href="/member/support" onClick={() => setProfileOpen(false)}>
              <SupportIcon />
              <span>Support</span>
            </Link>
            <a href="/auth/logout">
              <SignOutIcon />
              <span>Logout</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
