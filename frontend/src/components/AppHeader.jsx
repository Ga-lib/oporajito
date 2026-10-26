import React from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import "./AppHeader.css";

export default function AppHeader({
  title,
  showBack = false,
  showDistrictPill = false,
  currentDistrict = "Dhaka",
  onOpenDistrictPicker
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadNotificationsCount, pendingRequestsCount, unreadMessagesCount, theme, toggleTheme } = useApp();

  return (
    <header className="app-top-header">
      <div className="header-inner container-desktop">
        {/* Left Side: Brand or Back button */}
        <div className="header-left">
          {showBack ? (
            <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="back-btn-text">Back</span>
            </button>
          ) : (
            <div className="brand-badge-mini" onClick={() => navigate("/home")}>
              <div className="brand-dot-box">
                <span className="brand-mark-char">অ</span>
              </div>
              <div className="brand-text-group">
                <span className="brand-name-mini">Oporajito</span>
                <span className="brand-subtitle-desktop">অপরাজিত • Skill Sharing Bangladesh</span>
              </div>
            </div>
          )}

          {title && <h1 className="header-title-mobile">{title}</h1>}
        </div>

        {/* Desktop Center: Navigation Links */}
        <nav className="desktop-nav-links" aria-label="Desktop primary navigation">
          <NavLink
            to="/home"
            className={({ isActive }) => `desktop-nav-link ${isActive ? "desktop-nav-link--active" : ""}`}
          >
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/requests"
            className={({ isActive }) => `desktop-nav-link ${isActive ? "desktop-nav-link--active" : ""}`}
          >
            <span>Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="desktop-badge">{pendingRequestsCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) => `desktop-nav-link ${isActive ? "desktop-nav-link--active" : ""}`}
          >
            <span>Chats</span>
            {unreadMessagesCount > 0 && (
              <span className="desktop-badge">{unreadMessagesCount}</span>
            )}
          </NavLink>
        </nav>

        {/* Right Side: District Selector, Notifications, Profile (Desktop) */}
        <div className="header-right">
          {showDistrictPill && (
            <button
              className="district-header-pill"
              onClick={onOpenDistrictPicker}
              aria-label={`Current district: ${currentDistrict}. Tap to change district`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s7-6.6 7-12A7 7 0 0 0 5 10c0 5.4 7 12 7 12Z" stroke="var(--green-deep)" strokeWidth="2.5" />
                <circle cx="12" cy="10" r="2.5" stroke="var(--green-deep)" strokeWidth="2" />
              </svg>
              <span>{currentDistrict}</span>
              <span className="pill-arrow">▾</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="var(--marigold)" strokeWidth="2" fill="var(--marigold)" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="var(--marigold)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Notifications Icon with Badge */}
          <button
            className="notif-bell-btn"
            onClick={() => navigate("/notifications")}
            aria-label={`Notifications, ${unreadNotificationsCount} unread`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="var(--ink)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="var(--ink)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span className="notif-badge">{unreadNotificationsCount}</span>
            )}
          </button>

          {/* Desktop User Profile Button */}
          <button
            className="desktop-profile-btn"
            onClick={() => navigate("/profile")}
            aria-label="My Profile"
          >
            <span className="desktop-profile-avatar">{user?.avatar || "🧑🏽‍💻"}</span>
            <span className="desktop-profile-name">
              {user?.name ? user.name.split(" ")[0] : "Profile"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
