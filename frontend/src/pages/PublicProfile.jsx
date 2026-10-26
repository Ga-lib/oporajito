import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { usersApi, reviewsApi } from "../api";
import StarRating from "../components/StarRating";
import AppHeader from "../components/AppHeader";
import SkillRequestSheet from "../components/SkillRequestSheet";
import BlockReportModal from "../components/BlockReportModal";
import "./PublicProfile.css";

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { neighbors, sendSwapRequest, blockUser, reportUser } = useApp();

  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false);
  const [safetyModal, setSafetyModal] = useState({ isOpen: false, mode: "report" });
  const [profile, setProfile] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);

  const neighbor = neighbors.find((n) => n.id === id) || neighbors[0];

  // Fetch remote public profile & reviews from MongoDB
  useEffect(() => {
    if (!id) return;
    usersApi.getUser(id)
      .then((data) => {
        if (data && data.id) setProfile(data);
      })
      .catch((e) => console.info("Using cached profile:", e.message));

    reviewsApi.getUserReviews(id)
      .then((data) => {
        if (data && data.reviews) setReviewsList(data.reviews);
      })
      .catch((e) => console.info("Using cached reviews:", e.message));
  }, [id]);

  const activeNeighbor = profile || neighbor;
  const activeReviews = reviewsList.length > 0 ? reviewsList : (activeNeighbor?.reviews || []);

  if (!activeNeighbor) {
    return (
      <div className="public-profile-page">
        <AppHeader title="Profile" showBack={true} />
        <div className="empty-box">
          <p>Neighbor not found.</p>
          <button className="outline-btn" onClick={() => navigate("/home")}>Return to Home</button>
        </div>
      </div>
    );
  }

  const handleRequestSubmit = (data) => {
    sendSwapRequest(data);
  };

  const handleBlockConfirm = (userId) => {
    blockUser(userId);
    navigate("/home");
  };

  const handleReportConfirm = (data) => {
    reportUser(data);
  };

  return (
    <div className="public-profile-page">
      <AppHeader title={activeNeighbor.name} showBack={true} />

      <div className="public-profile-container container-narrow">
        <div className="public-profile-banner" />

        <div className="public-profile-content">
        <div className="public-profile-avatar-row">
          <div className="public-avatar">{activeNeighbor.avatar}</div>
          <button
            className="primary-btn public-request-trigger-btn"
            onClick={() => setIsRequestSheetOpen(true)}
          >
            Request Swap 🤝
          </button>
        </div>

        <div className="public-profile-headline">
          <h1 className="public-name">{activeNeighbor.name}</h1>
          <p className="public-location">
            📍 {activeNeighbor.area}, {activeNeighbor.district || "Dhaka"}
          </p>
          <div className="public-rating-row">
            <StarRating
              rating={activeNeighbor.rating_avg || 5.0}
              reviews={activeReviews.length || activeNeighbor.rating_count || 0}
              size={15}
            />
          </div>
        </div>

        <div className="stitch-divider" />

        {/* Bio */}
        <div className="public-block">
          <h2 className="block-title">About Neighbor</h2>
          <p className="public-bio">{activeNeighbor.bio || "Passionate neighbor ready to share skills!"}</p>
        </div>

        {/* Skills Offered */}
        <div className="public-block">
          <h2 className="block-title">Skills They Teach (Offers)</h2>
          <div className="chip-group">
            {activeNeighbor.teaches?.map((skill) => (
              <span key={skill} className="skill-chip skill-chip--teach">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skills Desired */}
        {activeNeighbor.wants && activeNeighbor.wants.length > 0 && (
          <div className="public-block">
            <h2 className="block-title">Skills They Want to Learn</h2>
            <div className="chip-group">
              {activeNeighbor.wants.map((skill) => (
                <span key={skill} className="skill-chip skill-chip--want">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="public-block">
          <div className="block-title-row">
            <h2 className="block-title">
              Community Reviews ({activeReviews.length})
            </h2>
          </div>

          {!activeReviews || activeReviews.length === 0 ? (
            <p className="no-reviews-note">No reviews yet. Be the first to swap skills and review!</p>
          ) : (
            <div className="public-reviews-list">
              {activeReviews.map((rev) => (
                <div key={rev.id} className="public-review-card">
                  <div className="review-top">
                    <div className="reviewer-identity">
                      <span className="reviewer-avatar">{rev.reviewer_avatar}</span>
                      <span className="reviewer-name">{rev.reviewer_name}</span>
                    </div>
                    <StarRating rating={rev.rating} size={12} />
                  </div>
                  <p className="public-review-text">"{rev.comment}"</p>
                  <span className="review-time-stamp">{rev.created_at}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety & Moderation Actions */}
        <div className="public-safety-actions">
          <button
            className="safety-action-btn"
            onClick={() => setSafetyModal({ isOpen: true, mode: "report" })}
          >
            🚩 Report User
          </button>
          <span className="safety-dot">•</span>
          <button
            className="safety-action-btn safety-action-btn--block"
            onClick={() => setSafetyModal({ isOpen: true, mode: "block" })}
          >
            🚫 Block User
          </button>
        </div>
      </div>
      </div>

      {/* Skill Request Sheet Modal */}
      <SkillRequestSheet
        isOpen={isRequestSheetOpen}
        neighbor={activeNeighbor}
        onClose={() => setIsRequestSheetOpen(false)}
        onSubmit={handleRequestSubmit}
      />

      {/* Block / Report Safety Modal */}
      <BlockReportModal
        isOpen={safetyModal.isOpen}
        mode={safetyModal.mode}
        targetUser={activeNeighbor}
        onClose={() => setSafetyModal({ isOpen: false, mode: "report" })}
        onBlock={handleBlockConfirm}
        onReport={handleReportConfirm}
      />
    </div>
  );
}
