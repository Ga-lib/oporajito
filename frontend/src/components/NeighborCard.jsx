import React from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import "./NeighborCard.css";

export default function NeighborCard({ person, onRequest }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Prevent navigation if the user clicked the Request button
    if (e.target.closest(".request-btn")) return;
    navigate(`/profile/${person.id}`);
  };

  const swapsCount = person.swaps_completed ?? 0;

  return (
    <div
      className="neighbor-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick(e);
      }}
      aria-label={`View ${person.name}'s profile, teaches ${person.teaches.join(", ")}`}
    >
      <div className="neighbor-avatar-wrap">
        <div className="neighbor-avatar" aria-hidden="true">
          {person.avatar || "🧑🏽"}
        </div>
        <div className="neighbor-verified-check" title="Verified Neighbor" aria-label="Verified neighbor">
          ✓
        </div>
      </div>

      <div className="neighbor-info">
        <div className="neighbor-top">
          <div className="neighbor-name-row">
            <span className="neighbor-name">{person.name}</span>
            {swapsCount > 0 && (
              <span className="neighbor-swaps-badge">{swapsCount} swaps</span>
            )}
          </div>
          <span className="neighbor-distance">{person.distanceKm || "1.2"} km</span>
        </div>

        <div className="neighbor-area">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s7-6.6 7-12A7 7 0 0 0 5 10c0 5.4 7 12 7 12Z" stroke="var(--ink-soft)" strokeWidth="2" />
            <circle cx="12" cy="10" r="2.5" stroke="var(--ink-soft)" strokeWidth="2" />
          </svg>
          <span>{person.area}{person.district ? `, ${person.district}` : ""}</span>
        </div>

        <div className="neighbor-rating-row">
          <StarRating rating={person.rating_avg ?? person.rating ?? 5.0} reviews={person.rating_count ?? person.reviews ?? 0} />
        </div>

        {/* Teaches section */}
        <div className="neighbor-skills-section">
          <span className="skills-group-label">TEACHES</span>
          <div className="neighbor-skills">
            {person.teaches.slice(0, 3).map((skill) => (
              <span className="skill-chip skill-chip--teach" key={skill}>
                {skill}
              </span>
            ))}
            {person.teaches.length > 3 && (
              <span className="skill-chip-more">+{person.teaches.length - 3}</span>
            )}
          </div>
        </div>

        {/* Wants section if present */}
        {person.wants && person.wants.length > 0 && (
          <div className="neighbor-skills-section neighbor-skills-section--wants">
            <span className="skills-group-label skills-group-label--wants">LOOKING FOR</span>
            <div className="neighbor-skills">
              {person.wants.slice(0, 2).map((skill) => (
                <span className="skill-chip skill-chip--want" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="neighbor-actions">
        <button
          className="request-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRequest?.(person);
          }}
          aria-label={`Request skill swap from ${person.name}`}
        >
          <span>Swap</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
