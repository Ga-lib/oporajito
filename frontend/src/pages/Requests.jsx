import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import AppHeader from "../components/AppHeader";
import ReviewModal from "../components/ReviewModal";
import "./Requests.css";

export default function Requests() {
  const { user } = useAuth();
  const {
    requests,
    acceptSwapRequest,
    declineSwapRequest,
    completeSwapRequest,
    submitReview
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("incoming");
  const [reviewModalRequest, setReviewModalRequest] = useState(null);

  const currentUserId = user?.id || "user-current";

  const incomingRequests = requests.filter((r) => r.to_user_id === currentUserId);
  const outgoingRequests = requests.filter((r) => r.from_user_id === currentUserId);

  const displayList = activeTab === "incoming" ? incomingRequests : outgoingRequests;

  const handleReviewSubmit = (reviewData) => {
    submitReview(reviewData);
  };

  return (
    <div className="requests-page">
      <AppHeader title="Skill Requests" />

      <div className="requests-content container-desktop">
        {/* Tab Switcher */}
        <div className="requests-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "incoming"}
            className={`tab-btn ${activeTab === "incoming" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("incoming")}
          >
            <span>Incoming</span>
            <span className="tab-count-badge">{incomingRequests.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "outgoing"}
            className={`tab-btn ${activeTab === "outgoing" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("outgoing")}
          >
            <span>Outgoing</span>
            <span className="tab-count-badge">{outgoingRequests.length}</span>
          </button>
        </div>

        {displayList.length === 0 ? (
          <div className="empty-box">
            <span className="empty-icon">
              {activeTab === "incoming" ? "📥" : "📤"}
            </span>
            <h3 className="empty-title">
              No {activeTab} requests yet
            </h3>
            <p className="empty-desc">
              {activeTab === "incoming"
                ? "When nearby neighbors want to learn what you teach, their swap invitations will appear here."
                : "Explore skilled neighbors on Home and request a skill swap to start learning!"}
            </p>
            {activeTab === "outgoing" && (
              <button className="primary-btn" onClick={() => navigate("/home")} style={{ width: "auto" }}>
                Find Neighbors to Swap With
              </button>
            )}
          </div>
        ) : (
          <div className="requests-list">
            {displayList.map((req) => {
              const isIncoming = activeTab === "incoming";
              const partnerName = isIncoming ? req.from_user_name : req.to_user_name;
              const partnerAvatar = isIncoming ? req.from_user_avatar : req.to_user_avatar;
              const partnerArea = isIncoming ? req.from_user_area : req.to_user_area;

              return (
                <div key={req.id} className="request-card rounded-card">
                  <div className="request-card-header">
                    <div className="requester-info">
                      <span className="requester-avatar">{partnerAvatar}</span>
                      <div>
                        <h4 className="requester-name">{partnerName}</h4>
                        <span className="requester-area">{partnerArea}</span>
                      </div>
                    </div>
                    <span className={`badge badge--${req.status}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="swap-details-box">
                    <div className="swap-detail-item">
                      <span className="swap-label">Wants to learn:</span>
                      <span className="skill-chip skill-chip--want">{req.skill}</span>
                    </div>
                    {req.offered_skill && (
                      <div className="swap-detail-item">
                        <span className="swap-label">Teaches in return:</span>
                        <span className="skill-chip skill-chip--teach">{req.offered_skill}</span>
                      </div>
                    )}
                  </div>

                  {req.message && (
                    <p className="request-message-quote">"{req.message}"</p>
                  )}

                  <div className="request-footer">
                    <span className="request-date">{req.created_at}</span>

                    <div className="request-actions">
                      {/* Incoming Pending Actions */}
                      {isIncoming && req.status === "pending" && (
                        <>
                          <button
                            className="outline-btn decline-btn"
                            onClick={() => declineSwapRequest(req.id)}
                          >
                            Decline
                          </button>
                          <button
                            className="primary-btn accept-btn"
                            onClick={() => acceptSwapRequest(req.id)}
                          >
                            Accept Swap
                          </button>
                        </>
                      )}

                      {/* Accepted Actions */}
                      {req.status === "accepted" && (
                        <>
                          <button
                            className="outline-btn"
                            onClick={() => navigate("/chat")}
                          >
                            Open Chat
                          </button>
                          <button
                            className="secondary-btn"
                            onClick={() => completeSwapRequest(req.id)}
                          >
                            Mark Completed
                          </button>
                        </>
                      )}

                      {/* Completed Actions */}
                      {req.status === "completed" && (
                        <button
                          className="secondary-btn review-trigger-btn"
                          onClick={() => setReviewModalRequest(req)}
                        >
                          ★ Leave a Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewModalRequest)}
        request={reviewModalRequest}
        onClose={() => setReviewModalRequest(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
