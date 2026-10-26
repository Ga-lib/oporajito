import React, { useState } from "react";
import "./BlockReportModal.css";

export default function BlockReportModal({
  isOpen,
  mode = "report", // 'report' or 'block'
  targetUser,
  onClose,
  onBlock,
  onReport
}) {
  const [reason, setReason] = useState("inappropriate");
  const [details, setDetails] = useState("");

  if (!isOpen || !targetUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "block") {
      onBlock(targetUser.id);
    } else {
      onReport({
        userId: targetUser.id,
        reason,
        details: details.trim()
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bottom-sheet safety-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="sheet-header">
          <div>
            <h2 className="sheet-title">
              {mode === "block" ? `Block ${targetUser.name}?` : `Report ${targetUser.name}`}
            </h2>
            <p className="sheet-subtitle">
              {mode === "block"
                ? "They will not be able to message you or request swaps."
                : "Help maintain a trustworthy neighborhood skill exchange."}
            </p>
          </div>
          <button className="sheet-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="safety-form">
          {mode === "report" && (
            <>
              <div className="form-group">
                <label className="form-label">Reason for reporting</label>
                <select
                  className="select-field"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="inappropriate">Inappropriate or offensive behavior</option>
                  <option value="commercial">Demanding money / Commercial promotion</option>
                  <option value="scam">Fake profile or misleading skills</option>
                  <option value="harassment">Harassment or unwanted contact</option>
                  <option value="other">Other safety concern</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Additional details</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  placeholder="Provide context for community moderators..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
            </>
          )}

          {mode === "block" && (
            <div className="block-warning-box">
              <span className="block-icon">⚠️</span>
              <p>
                Blocking <strong>{targetUser.name}</strong> will hide their profile from your search results,
                cancel any ongoing requests, and silence existing chats.
              </p>
            </div>
          )}

          <div className="sheet-actions">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={mode === "block" ? "danger-btn" : "primary-btn"}
            >
              {mode === "block" ? "Confirm Block" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
