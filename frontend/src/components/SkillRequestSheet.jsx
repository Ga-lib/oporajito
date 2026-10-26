import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./SkillRequestSheet.css";

export default function SkillRequestSheet({
  isOpen,
  neighbor,
  onClose,
  onSubmit
}) {
  const { user } = useAuth();

  const [selectedSkill, setSelectedSkill] = useState(() => neighbor?.teaches?.[0] || "");
  const [offeredSkill, setOfferedSkill] = useState(() => user?.teaches?.[0] || "");
  const [message, setMessage] = useState(
    `Assalamu Alaikum ${neighbor?.name?.split(" ")[0]}! I'd love to learn from you.`
  );

  if (!isOpen || !neighbor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSkill) return;

    onSubmit({
      toNeighbor: neighbor,
      skill: selectedSkill,
      offeredSkill: offeredSkill || "Community skill share",
      message: message.trim()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bottom-sheet request-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="sheet-header">
          <div className="request-neighbor-summary">
            <span className="sheet-avatar">{neighbor.avatar}</span>
            <div>
              <h2 className="sheet-title">Request Skill Swap</h2>
              <p className="request-neighbor-name">with {neighbor.name} ({neighbor.area})</p>
            </div>
          </div>
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label className="form-label">1. What skill do you want to learn?</label>
            <div className="skill-radio-group">
              {neighbor.teaches.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  className={`skill-pick-btn ${selectedSkill === skill ? "skill-pick-btn--active" : ""}`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <span className="skill-pick-bullet">{selectedSkill === skill ? "●" : "○"}</span>
                  <span>{skill}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">2. What can you teach in exchange?</label>
            {user?.teaches && user.teaches.length > 0 ? (
              <select
                className="select-field"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
              >
                {user.teaches.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="Open to suggestion">Open to anything they need</option>
              </select>
            ) : (
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Basic Guitar, English, Cooking..."
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">3. Friendly greeting / note</label>
            <textarea
              className="textarea-field"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and propose when/where to meet..."
              maxLength={250}
            />
            <span className="char-count">{message.length}/250</span>
          </div>

          <div className="privacy-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--green-deep)" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="var(--green-deep)" strokeWidth="2" />
            </svg>
            <span>Phone numbers remain hidden. You can chat safely in-app once accepted.</span>
          </div>

          <div className="sheet-actions">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={!selectedSkill || !message.trim()}
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
