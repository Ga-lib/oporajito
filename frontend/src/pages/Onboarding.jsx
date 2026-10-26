import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { all64Districts, popularSkillTags, avatarOptions } from "../data/bangladeshDistricts";
import "./Onboarding.css";

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [district, setDistrict] = useState(user?.district || "Dhaka");
  const [area, setArea] = useState(user?.area || "");
  const [avatar, setAvatar] = useState(user?.avatar || "🧑🏽‍💻");
  const [bio, setBio] = useState(user?.bio || "");

  const [teaches, setTeaches] = useState(user?.teaches?.length ? user.teaches : ["Spoken English"]);
  const [teachInput, setTeachInput] = useState("");

  const [wants, setWants] = useState(user?.wants?.length ? user.wants : ["Coding & Web Dev"]);
  const [wantInput, setWantInput] = useState("");

  const [error, setError] = useState("");

  const addTeachSkill = (skill) => {
    const s = skill.trim();
    if (s && !teaches.includes(s)) {
      setTeaches([...teaches, s]);
    }
    setTeachInput("");
  };

  const removeTeachSkill = (skill) => {
    setTeaches(teaches.filter((t) => t !== skill));
  };

  const addWantSkill = (skill) => {
    const s = skill.trim();
    if (s && !wants.includes(s)) {
      setWants([...wants, s]);
    }
    setWantInput("");
  };

  const removeWantSkill = (skill) => {
    setWants(wants.filter((w) => w !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!area.trim()) {
      setError("Please enter your local neighborhood/area (e.g. Mirpur, Dhanmondi, GEC)");
      return;
    }
    if (teaches.length === 0) {
      setError("Please add at least one skill you can teach");
      return;
    }
    if (wants.length === 0) {
      setError("Please add at least one skill you want to learn");
      return;
    }

    try {
      await completeOnboarding({
        name: name.trim(),
        district,
        area: area.trim(),
        avatar,
        bio: bio.trim() || `Neighbor in ${area}, ${district}. Excited to swap skills!`,
        teaches,
        wants
      });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <span className="step-tag">Step 2 of 2: Your Neighborhood Profile</span>
        <h1 className="onboarding-title">Welcome to Oporajito!</h1>
        <p className="onboarding-sub">
          Tell your neighbors what you can teach and what you are eager to learn.
        </p>
      </div>

      <div className="stitch-divider" />

      <form onSubmit={handleSubmit} className="onboarding-form">
        {/* Avatar Selection */}
        <div className="form-group">
          <label className="form-label">Choose your neighborhood avatar</label>
          <div className="avatar-picker-row">
            {avatarOptions.map((opt) => (
              <button
                key={opt.emoji}
                type="button"
                className={`avatar-choice-btn ${avatar === opt.emoji ? "avatar-choice-btn--active" : ""}`}
                onClick={() => setAvatar(opt.emoji)}
                title={opt.label}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="user-name">Your Full Name</label>
          <input
            id="user-name"
            className="input-field"
            type="text"
            placeholder="e.g. Rafiq Islam or Nusrat Jahan"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            required
          />
        </div>

        {/* Location: District and Area */}
        <div className="location-row">
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="user-district">District (64 districts)</label>
            <select
              id="user-district"
              className="select-field"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {all64Districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label className="form-label" htmlFor="user-area">Neighborhood / Area</label>
            <input
              id="user-area"
              className="input-field"
              type="text"
              placeholder="e.g. Mirpur 10, Kazipara"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Skills I Can Teach */}
        <div className="form-group">
          <label className="form-label">Skills I Can Teach (Offers)</label>
          <div className="chip-input-container">
            <div className="chip-list">
              {teaches.map((skill) => (
                <span key={skill} className="skill-chip skill-chip--teach">
                  {skill}
                  <button type="button" onClick={() => removeTeachSkill(skill)} aria-label={`Remove ${skill}`}>✕</button>
                </span>
              ))}
            </div>
            <div className="chip-input-row">
              <input
                type="text"
                placeholder="Type a skill and press Enter..."
                value={teachInput}
                onChange={(e) => setTeachInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTeachSkill(teachInput);
                  }
                }}
              />
              <button
                type="button"
                className="add-skill-btn"
                onClick={() => addTeachSkill(teachInput)}
              >
                + Add
              </button>
            </div>
          </div>
          <div className="quick-suggestions-row">
            <span className="quick-label">Suggestions:</span>
            {popularSkillTags.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                className="quick-suggestion-chip"
                onClick={() => addTeachSkill(s)}
              >
                +{s}
              </button>
            ))}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="form-group">
          <label className="form-label">Skills I Want to Learn (Requests)</label>
          <div className="chip-input-container">
            <div className="chip-list">
              {wants.map((skill) => (
                <span key={skill} className="skill-chip skill-chip--want">
                  {skill}
                  <button type="button" onClick={() => removeWantSkill(skill)} aria-label={`Remove ${skill}`}>✕</button>
                </span>
              ))}
            </div>
            <div className="chip-input-row">
              <input
                type="text"
                placeholder="Type what you want to learn..."
                value={wantInput}
                onChange={(e) => setWantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addWantSkill(wantInput);
                  }
                }}
              />
              <button
                type="button"
                className="add-skill-btn"
                onClick={() => addWantSkill(wantInput)}
              >
                + Add
              </button>
            </div>
          </div>
          <div className="quick-suggestions-row">
            <span className="quick-label">Suggestions:</span>
            {popularSkillTags.slice(4, 8).map((s) => (
              <button
                key={s}
                type="button"
                className="quick-suggestion-chip"
                onClick={() => addWantSkill(s)}
              >
                +{s}
              </button>
            ))}
          </div>
        </div>

        {/* Short Bio */}
        <div className="form-group">
          <label className="form-label" htmlFor="user-bio">Short Bio / Introduction</label>
          <textarea
            id="user-bio"
            className="textarea-field"
            rows={3}
            placeholder="Introduce yourself to nearby neighbors..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="primary-btn complete-btn">
          Complete Profile & Enter Oporajito 🚀
        </button>
      </form>
    </div>
  );
}
