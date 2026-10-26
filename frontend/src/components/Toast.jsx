import React from "react";
import "./Toast.css";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className={`app-toast app-toast--${toast.type || "success"}`} role="alert">
      <div className="toast-content">
        <span className="toast-icon">
          {toast.type === "info" ? "ℹ️" : toast.type === "error" ? "⚠️" : "✓"}
        </span>
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Dismiss toast">
        ✕
      </button>
    </div>
  );
}
