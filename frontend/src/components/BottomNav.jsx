import React from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./BottomNav.css";

export default function BottomNav() {
  const { pendingRequestsCount, unreadMessagesCount } = useApp();

  const navItems = [
    {
      to: "/home",
      label: "Home",
      badge: 0,
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 11.5 12 4l8 7.5"
            stroke={active ? "var(--green-deep)" : "var(--ink-soft)"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10v9h12v-9"
            stroke={active ? "var(--green-deep)" : "var(--ink-soft)"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    {
      to: "/requests",
      label: "Requests",
      badge: pendingRequestsCount,
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"
            stroke={active ? "var(--green-deep)" : "var(--ink-soft)"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    {
      to: "/chat",
      label: "Chats",
      badge: unreadMessagesCount,
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 5h16v11H8l-4 4z"
            stroke={active ? "var(--green-deep)" : "var(--ink-soft)"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    {
      to: "/profile",
      label: "Profile",
      badge: 0,
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="8"
            r="3.5"
            stroke={active ? "var(--green-deep)" : "var(--ink-soft)"}
            strokeWidth="2.2"
          />
          <path
            d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5"
            stroke={active ? "var(--green-deep)" : "var(--ink-soft)"}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      )
    }
  ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <div className="nav-icon-container">
                {item.icon(isActive)}
                {item.badge > 0 && <span className="nav-item-badge">{item.badge}</span>}
              </div>
              <span className="nav-item-label">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
