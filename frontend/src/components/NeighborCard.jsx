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
      <div className="neighbor-avatar" aria-hidden="true">
        {person.avatar}
      </div>

      <div className="neighbor-info">
        <div className="neighbor-top">
          <span className="neighbor-name">{person.name}</span>
          <span className="neighbor-distance">{person.distanceKm} km</span>
        </div>

        <div className="neighbor-area">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginRight: 3, verticalAlign: -1 }}>
            <path d="M12 22s7-6.6 7-12A7 7 0 0 0 5 10c0 5.4 7 12 7 12Z" stroke="var(--ink-soft)" strokeWidth="2" />
            <circle cx="12" cy="10" r="2.5" stroke="var(--ink-soft)" strokeWidth="2" />
          </svg>
          {person.area}
        </div>

        <div className="neighbor-rating-row">
          <StarRating rating={person.rating_avg ?? person.rating ?? 5.0} reviews={person.rating_count ?? person.reviews ?? 0} />
        </div>

        <div className="neighbor-skills">
          {person.teaches.map((skill) => (
            <span className="skill-chip skill-chip--teach" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <button
        className="request-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRequest?.(person);
        }}
        aria-label={`Request skill swap from ${person.name}`}
      >
        Request
      </button>
    </div>
  );
}
