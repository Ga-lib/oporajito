import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { usersApi } from "../api";
import AppHeader from "../components/AppHeader";
import NeighborCard from "../components/NeighborCard";
import SkillRequestSheet from "../components/SkillRequestSheet";
import DistrictPickerModal from "../components/DistrictPickerModal";
import { popularSkillTags } from "../data/bangladeshDistricts";
import "./Home.css";

const quickDistricts = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal"];

export default function Home() {
  const { user } = useAuth();
  const { neighbors, sendSwapRequest } = useApp();

  const [query, setQuery] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState(user?.district || "Dhaka");
  const [activeTag, setActiveTag] = useState(null);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [selectedNeighborForRequest, setSelectedNeighborForRequest] = useState(null);
  const [backendMatches, setBackendMatches] = useState([]);

  // Query personalized mutual skill matches from backend
  useEffect(() => {
    if (!user || !user.id) return;
    usersApi.getMatches(10)
      .then((matches) => {
        if (Array.isArray(matches) && matches.length > 0) {
          setBackendMatches(matches);
        }
      })
      .catch((e) => {
        console.warn("Could not load backend matches, using local filter:", e.message);
      });
  }, [user]);

  // Suggested people who teach what current user wants to learn
  const recommendations = useMemo(() => {
    if (backendMatches && backendMatches.length > 0) {
      return backendMatches;
    }
    if (!user?.wants || user.wants.length === 0) return [];
    return neighbors.filter((n) => {
      // Must not be the current user
      if (n.id === user?.id) return false;
      // Must teach at least one skill that the user wants
      return n.teaches.some((skill) =>
        user.wants.some((wanted) =>
          skill.toLowerCase().includes(wanted.toLowerCase()) ||
          wanted.toLowerCase().includes(skill.toLowerCase())
        )
      );
    });
  }, [neighbors, user, backendMatches]);

  // Filtered list of neighbors
  const filteredNeighbors = useMemo(() => {
    return neighbors.filter((n) => {
      // Exclude current user from browse
      if (n.id === user?.id) return false;

      // Filter by district if selected
      const matchesDistrict =
        !currentDistrict || n.district?.toLowerCase() === currentDistrict.toLowerCase() ||
        n.area?.toLowerCase().includes(currentDistrict.toLowerCase());

      // Filter by query (name or teaches)
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        n.name.toLowerCase().includes(q) ||
        n.area.toLowerCase().includes(q) ||
        n.teaches.some((s) => s.toLowerCase().includes(q));

      // Filter by tag
      const matchesTag =
        !activeTag || n.teaches.some((s) => s.toLowerCase().includes(activeTag.toLowerCase()));

      return matchesDistrict && matchesQuery && matchesTag;
    });
  }, [neighbors, user, currentDistrict, query, activeTag]);

  const handleRequestSubmit = (requestData) => {
    sendSwapRequest(requestData);
  };

  const handleResetFilters = () => {
    setQuery("");
    setActiveTag(null);
    setCurrentDistrict("Dhaka");
  };

  return (
    <div className="home-page">
      <AppHeader
        showDistrictPill={true}
        currentDistrict={currentDistrict}
        onOpenDistrictPicker={() => setIsDistrictModalOpen(true)}
      />

      <div className="home-content container-desktop">
        {/* Modern Hero Showcase Card */}
        <section className="home-hero-card" aria-label="Hyperlocal Skill Sharing Banner">
          <div className="hero-glow-orb hero-glow-orb--left" />
          <div className="hero-glow-orb hero-glow-orb--right" />

          <div className="hero-main-content">
            <div className="hero-badge-pill">
              <span className="hero-flag">🇧🇩</span>
              <span>Hyperlocal Skill Sharing in <strong>{currentDistrict}</strong></span>
              <button
                className="hero-change-district-btn"
                onClick={() => setIsDistrictModalOpen(true)}
              >
                Change
              </button>
            </div>

            <h1 className="hero-title">
              Empowering Bangladesh, <br className="hero-br" />
              <span className="hero-highlight">Neighbor to Neighbor.</span>
            </h1>

            <p className="hero-description">
              Trade programming, music, language, arts, and cooking directly with people in your neighborhood — zero currency, 100% peer-to-peer.
            </p>

            <div className="hero-stats-row">
              <div className="hero-stat-pill">
                <span className="stat-icon">🛡️</span>
                <span>Verified Neighbors</span>
              </div>
              <div className="hero-stat-pill">
                <span className="stat-icon">📍</span>
                <span>64 Districts</span>
              </div>
              <div className="hero-stat-pill">
                <span className="stat-icon">🤝</span>
                <span>Mutual Matchmaking</span>
              </div>
            </div>
          </div>

          <div className="hero-user-snapshot">
            <div className="user-snapshot-card">
              <div className="snapshot-avatar-ring">
                <div className="snapshot-avatar">{user?.avatar || "🧑🏽‍💻"}</div>
                <div className="snapshot-pulse-dot" />
              </div>
              <div className="snapshot-info">
                <span className="snapshot-greeting">Assalamu Alaikum,</span>
                <span className="snapshot-name">{user?.name ? user.name.split(" ")[0] : "Neighbor"} 👋🏽</span>
                <span className="snapshot-location">{user?.area || "Neighborhood"}, {user?.district || "Dhaka"}</span>
              </div>
              <div className="snapshot-skills-preview">
                <span className="snapshot-skill-label">You share:</span>
                <div className="snapshot-skills-tags">
                  {(user?.teaches || ["Coding"]).slice(0, 2).map((s) => (
                    <span key={s} className="snapshot-mini-tag">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Interactive Search Bar */}
        <div className="search-bar" role="search">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="var(--ink-soft)" strokeWidth="2.2" />
            <path d="m21 21-3.5-3.5" stroke="var(--ink-soft)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search skills (e.g. Python, Spoken English, Guitar, Digital Art)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search skills or neighbors"
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Skill Tag Filters Carousel */}
        <div className="tag-scroll-row" role="region" aria-label="Skill tags">
          {popularSkillTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              className={`tag-pill ${activeTag === tag ? "tag-pill--active" : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              <span>{tag}</span>
            </button>
          ))}
        </div>

        {/* Quick District Chips */}
        <div className="district-quick-row" role="region" aria-label="Quick district selection">
          {quickDistricts.map((d) => (
            <button
              key={d}
              className={`district-chip ${currentDistrict === d ? "district-chip--active" : ""}`}
              onClick={() => setCurrentDistrict(d)}
            >
              {d}
            </button>
          ))}
          <button
            className="district-more-btn"
            onClick={() => setIsDistrictModalOpen(true)}
          >
            + All 64 Districts
          </button>
        </div>

        {/* "Matches For You" Carousel */}
        {recommendations.length > 0 && !query && !activeTag && (
          <section className="recommendations-section" aria-label="Recommended neighbors">
            <div className="section-header-row">
              <div className="section-label-group">
                <span className="section-sparkle">✨</span>
                <span className="section-label">Mutual Skill Matches</span>
                <span className="section-badge-counter">{recommendations.length}</span>
              </div>
              <span className="section-sub">Teaches what you are looking to learn</span>
            </div>

            <div className="recommendations-carousel">
              {recommendations.map((person) => (
                <div key={person.id} className="recommendation-card">
                  <div className="rec-match-pill">Mutual Match</div>
                  <div className="rec-avatar-ring">
                    <div className="rec-avatar">{person.avatar || "🧑🏽"}</div>
                  </div>
                  <span className="rec-name">{person.name}</span>
                  <span className="rec-area">{person.area || "Neighborhood"}</span>
                  <div className="rec-skill-chip">
                    {person.teaches.find((s) =>
                      user?.wants?.some((w) => s.toLowerCase().includes(w.toLowerCase()))
                    ) || person.teaches[0]}
                  </div>
                  <button
                    className="rec-request-btn"
                    onClick={() => setSelectedNeighborForRequest(person)}
                  >
                    <span>Swap Skills</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="stitch-divider" />

        {/* Main Feed Section */}
        <div className="feed-header">
          <div className="feed-title-wrap">
            <h2 className="feed-section-heading">
              {filteredNeighbors.length} Skilled Neighbor{filteredNeighbors.length !== 1 ? "s" : ""} in {currentDistrict}
            </h2>
            <span className="feed-section-sub">Ready to exchange knowledge with you</span>
          </div>
          {(query || activeTag) && (
            <button className="clear-filters-link" onClick={handleResetFilters}>
              Reset filters
            </button>
          )}
        </div>

        <div className="neighbor-feed">
          {filteredNeighbors.length === 0 ? (
            <div className="empty-box">
              <span className="empty-icon">🌱</span>
              <h3 className="empty-title">No matching neighbors found</h3>
              <p className="empty-desc">
                No neighbors in {currentDistrict} match your search. Try searching for a different skill or picking another district!
              </p>
              <button className="secondary-btn" onClick={handleResetFilters}>
                View All in {currentDistrict}
              </button>
            </div>
          ) : (
            filteredNeighbors.map((person) => (
              <NeighborCard
                key={person.id}
                person={person}
                onRequest={(p) => setSelectedNeighborForRequest(p)}
              />
            ))
          )}
        </div>
      </div>

      {/* Skill Request Sheet Modal */}
      <SkillRequestSheet
        isOpen={Boolean(selectedNeighborForRequest)}
        neighbor={selectedNeighborForRequest}
        onClose={() => setSelectedNeighborForRequest(null)}
        onSubmit={handleRequestSubmit}
      />

      {/* 64 Districts Selector Modal */}
      <DistrictPickerModal
        isOpen={isDistrictModalOpen}
        currentDistrict={currentDistrict}
        onSelectDistrict={(d) => setCurrentDistrict(d)}
        onClose={() => setIsDistrictModalOpen(false)}
      />
    </div>
  );
}
