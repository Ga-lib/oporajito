import React, { useState } from "react";
import StarRating from "./StarRating";
import "./ReviewModal.css";

export default function ReviewModal({
  isOpen,
  request,
  onClose,
  onSubmit
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onSubmit({
      requestId: request.id,
      revieweeId: request.from_user_id === "user-current" ? request.to_user_id : request.from_user_id,
      rating,
      comment: comment.trim()
    });
    onClose();
  };

  const partnerName =
    request.from_user_id === "user-current" ? request.to_user_name : request.from_user_name;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bottom-sheet review-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="sheet-header">
          <div>
            <h2 className="sheet-title">Leave a Review</h2>
            <p className="sheet-subtitle">Share your skill swap experience with {partnerName}</p>
          </div>
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-select-box">
            <span className="rating-label">How was your learning experience?</span>
            <div className="star-picker-row">
              <StarRating
                rating={rating}
                size={30}
                interactive={true}
                onChange={(newRating) => setRating(newRating)}
              />
            </div>
            <span className="rating-text-feedback">
              {rating === 5 && "Outstanding teacher / learner! ⭐⭐⭐⭐⭐"}
              {rating === 4 && "Very good session! ⭐⭐⭐⭐"}
              {rating === 3 && "Good & helpful ⭐⭐⭐"}
              {rating === 2 && "Fair, room for improvement ⭐⭐"}
              {rating === 1 && "Did not meet expectations ⭐"}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="review-comment">Your feedback / appreciation</label>
            <textarea
              id="review-comment"
              className="textarea-field"
              rows={4}
              placeholder="e.g. Rafiq was super patient and taught me how to write my first HTML code..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="sheet-actions">
            <button type="button" className="outline-btn" onClick={onClose}>
              Later
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={!comment.trim()}
            >
              Post Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
