import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { reviewsApi } from "../api";
import StarRating from "../components/StarRating";
import AppHeader from "../components/AppHeader";
import { avatarOptions, popularSkillTags, all64Districts } from "../data/bangladeshDistricts";
import "./Profile.css";

export default function Profile() {
  const { user, updateProfile, logout, resetDemoUser } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [district, setDistrict] = useState(user?.district || "Dhaka");
  const [area, setArea] = useState(user?.area || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "🧑🏽‍💻");
  const [teaches, setTeaches] = useState(user?.teaches || []);
  const [wants, setWants] = useState(user?.wants || []);
  const [reviewsList, setReviewsList] = useState([]);

  // Load reviews from MongoDB for current user
  useEffect(() => {
    if (!user?.id) return;
    reviewsApi.getUserReviews(user.id)
      .then((data) => {
        if (data && data.reviews && data.reviews.length > 0) {
          setReviewsList(data.reviews);
        }
      })
      .catch((e) => {
        console.info("Using cached reviews:", e.message);
      });
  }, [user?.id]);

  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newWantSkill, setNewWantSkill] = useState("");

  const handleSave = () => {
    updateProfile({
      name,
      district,
      area,
      bio,
      avatar,
      teaches,
      wants
    });
    setEditing(false);
    showToast("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const addTeach = (s) => {
    const skill = s.trim();
    if (skill && !teaches.includes(skill)) {
      setTeaches([...teaches, skill]);
      setNewTeachSkill("");
    }
  };

  const removeTeach = (skill) => {
    setTeaches(teaches.filter((t) => t !== skill));
  };

  const addWant = (s) => {
    const skill = s.trim();
    if (skill && !wants.includes(skill)) {
      setWants([...wants, skill]);
      setNewWantSkill("");
    }
  };

  const removeWant = (skill) => {
    setWants(wants.filter((w) => w !== skill));
  };

  return (
    <div className="profile-page">
      <AppHeader title="My Profile" />

      <div className="profile-container container-narrow">
        <div className="profile-banner">
          <div className="banner-pattern" />
        </div>

      <div className="profile-main">
        {/* Avatar & Edit Trigger */}
        <div className="profile-avatar-row">
          <div className="profile-avatar" aria-label="Profile Avatar">
            {avatar}
          </div>
          <button
            className={`edit-toggle-btn ${editing ? "edit-toggle-btn--active" : ""}`}
            onClick={() => {
              if (editing) handleSave();
              else setEditing(true);
            }}
          >
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* Name and Rating */}
        <div className="profile-headline">
          {editing ? (
            <input
              type="text"
              className="input-field profile-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          ) : (
            <h1 className="profile-display-name">{name || "Anonymous Neighbor"}</h1>
          )}

          <div className="profile-rating-badge">
            <StarRating
              rating={user?.rating_avg || 4.8}
              reviews={user?.rating_count || 12}
              size={15}
            />
          </div>
        </div>

        {/* Location & District */}
        {editing ? (
          <div className="profile-edit-location-row">
            <select
              className="select-field"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {all64Districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input
              type="text"
              className="input-field"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area (e.g. Mirpur 10)"
            />
          </div>
        ) : (
          <p className="profile-location">
            📍 {area ? `${area}, ` : ""}{district || "Dhaka"}, Bangladesh
          </p>
        )}

        {/* Avatar Selection in Edit Mode */}
        {editing && (
          <div className="profile-block">
            <h2 className="block-title">Change Avatar</h2>
            <div className="avatar-options-grid">
              {avatarOptions.map((opt) => (
                <button
                  key={opt.emoji}
                  type="button"
                  className={`avatar-pick-mini ${avatar === opt.emoji ? "avatar-pick-mini--selected" : ""}`}
                  onClick={() => setAvatar(opt.emoji)}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="stitch-divider" />

        {/* About / Bio */}
        <div className="profile-block">
          <h2 className="block-title">About Me</h2>
          {editing ? (
            <textarea
              className="textarea-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Write a friendly bio for neighbors..."
            />
          ) : (
            <p className="profile-bio">{bio || "No bio added yet."}</p>
          )}
        </div>

        {/* Skills I Teach */}
        <div className="profile-block">
          <div className="block-title-row">
            <h2 className="block-title">Skills I Teach</h2>
            <span className="skill-count-tag">{teaches.length} Offered</span>
          </div>
          <div className="chip-group">
            {teaches.map((s) => (
              <span key={s} className="skill-chip skill-chip--teach">
                {s}
                {editing && (
                  <button type="button" onClick={() => removeTeach(s)} className="chip-remove-x">✕</button>
                )}
              </span>
            ))}
          </div>
          {editing && (
            <div className="add-chip-row">
              <input
                type="text"
                placeholder="Add skill to teach..."
                value={newTeachSkill}
                onChange={(e) => setNewTeachSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTeach(newTeachSkill))}
              />
              <button type="button" onClick={() => addTeach(newTeachSkill)}>+ Add</button>
            </div>
          )}
        </div>

        {/* Skills I Want to Learn */}
        <div className="profile-block">
          <div className="block-title-row">
            <h2 className="block-title">Skills I Want to Learn</h2>
            <span className="skill-count-tag">{wants.length} Desired</span>
          </div>
          <div className="chip-group">
            {wants.map((s) => (
              <span key={s} className="skill-chip skill-chip--want">
                {s}
                {editing && (
                  <button type="button" onClick={() => removeWant(s)} className="chip-remove-x">✕</button>
                )}
              </span>
            ))}
          </div>
          {editing && (
            <div className="add-chip-row">
              <input
                type="text"
                placeholder="Add skill you want..."
                value={newWantSkill}
                onChange={(e) => setNewWantSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWant(newWantSkill))}
              />
              <button type="button" onClick={() => addWant(newWantSkill)}>+ Add</button>
            </div>
          )}
        </div>

        {/* Recent Reviews Received */}
        <div className="profile-block">
          <h2 className="block-title">Neighbor Reviews ({reviewsList.length > 0 ? reviewsList.length : (user?.rating_count || 0)})</h2>
          <div className="reviews-list">
            {reviewsList.length > 0 ? (
              reviewsList.map((rev) => (
                <div key={rev.id} className="review-item">
                  <div className="review-top">
                    <span className="review-name">{rev.reviewer_avatar || "🧑🏽‍💻"} {rev.reviewer_name}</span>
                    <StarRating rating={rev.rating} size={12} />
                  </div>
                  <p className="review-text">"{rev.comment}"</p>
                  <span className="review-time-stamp" style={{ fontSize: "11px", color: "var(--ink-muted)" }}>{rev.created_at}</span>
                </div>
              ))
            ) : (
              <>
                <div className="review-item">
                  <div className="review-top">
                    <span className="review-name">Nusrat Jahan</span>
                    <StarRating rating={5} size={12} />
                  </div>
                  <p className="review-text">"Rafiq explained web development and basic HTML so clearly. Great first coding lesson!"</p>
                </div>
                <div className="review-item">
                  <div className="review-top">
                    <span className="review-name">Shirin Akter</span>
                    <StarRating rating={4.8} size={12} />
                  </div>
                  <p className="review-text">"Very punctual and patient neighbor. Looking forward to our next weekend swap."</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Demo Controls */}
        <div className="demo-reset-box">
          <span className="demo-reset-label">Developer Controls:</span>
          <button className="ghost-btn" onClick={resetDemoUser}>
            🔄 Reset Demo Profile Data
          </button>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      </div>
    </div>
  );
}
