import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import AppHeader from "../components/AppHeader";
import "./Notifications.css";

export default function Notifications() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationsCount
  } = useApp();
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "request_received":
        return "📥";
      case "request_accepted":
        return "🤝";
      case "new_message":
        return "💬";
      case "review_received":
        return "⭐";
      default:
        return "🔔";
    }
  };

  return (
    <div className="notifications-page">
      <AppHeader title="Notifications" showBack={true} />

      <div className="notifications-content container-narrow">
        <div className="notifications-header-actions">
          <span className="notifications-count">
            {unreadNotificationsCount} unread
          </span>
          {unreadNotificationsCount > 0 && (
            <button
              className="mark-all-read-btn"
              onClick={markAllNotificationsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-box">
            <span className="empty-icon">🔔</span>
            <h3 className="empty-title">No notifications yet</h3>
            <p className="empty-desc">
              When neighbors interact with your skills, swap requests, or messages, you will see notifications here.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-card ${!n.read ? "notification-card--unread" : ""}`}
                onClick={() => handleNotificationClick(n)}
                role="button"
                tabIndex={0}
              >
                <div className="notification-icon-badge">
                  {getNotifIcon(n.type)}
                </div>

                <div className="notification-main">
                  <div className="notification-top">
                    <span className="notification-title">{n.title}</span>
                    <span className="notification-time">{n.created_at}</span>
                  </div>
                  <p className="notification-message">{n.message}</p>
                </div>

                {!n.read && <span className="unread-dot" aria-label="Unread notification" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
