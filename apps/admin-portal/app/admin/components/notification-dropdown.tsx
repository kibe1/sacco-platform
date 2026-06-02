"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const notifications = [
  {
    actor: "Credit Officer",
    message: "submitted a loan approval request",
    subject: "Member Loan Review",
    category: "Loan",
    time: "5 min ago",
    online: true
  },
  {
    actor: "Branch Manager",
    message: "approved a member profile update",
    subject: "KYC Verification",
    category: "Member",
    time: "8 min ago",
    online: true
  },
  {
    actor: "Finance Desk",
    message: "flagged a reconciliation item",
    subject: "Payment Matching",
    category: "Finance",
    time: "15 min ago",
    online: true
  },
  {
    actor: "System Monitor",
    message: "reported delayed processing",
    subject: "Channel Queue",
    category: "Platform",
    time: "1 hr ago",
    online: false
  }
];

export function AdminNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleClick() {
    setIsOpen((current) => !current);
    setNotifying(false);
  }

  return (
    <div className="ta-notification-root" ref={dropdownRef}>
      <button
        className="dropdown-toggle ta-notification-button"
        onClick={handleClick}
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        {notifying && (
          <span className="ta-notification-dot">
            <span />
          </span>
        )}
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="ta-notification-panel">
          <div className="ta-notification-header">
            <h5>Notification</h5>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <ul className="ta-notification-list">
            {notifications.map((notification) => (
              <li key={`${notification.actor}-${notification.time}`}>
                <Link href="#" className="ta-notification-item" onClick={() => setIsOpen(false)}>
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
                    <small>
                      {notification.category}
                      <b />
                      {notification.time}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link href="#" className="ta-view-notifications" onClick={() => setIsOpen(false)}>
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
