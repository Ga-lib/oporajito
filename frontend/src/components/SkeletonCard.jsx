import React from "react";

export default function SkeletonCard() {
  return (
    <div className="rounded-card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div className="skeleton skeleton-circle" style={{ width: 48, height: 48, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="skeleton skeleton-text" style={{ width: "60%" }} />
        <div className="skeleton skeleton-text" style={{ width: "40%", height: 11 }} />
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <div className="skeleton" style={{ width: 65, height: 20, borderRadius: 100 }} />
          <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 100 }} />
        </div>
      </div>
    </div>
  );
}
