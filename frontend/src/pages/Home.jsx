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
        {/* Personalized Welcome Banner */}
        <div className="home-welcome">
          <div className="welcome-text">
            <span className="welcome-greeting">Assalamu Alaikum,</span>
            <h2 className="welcome-name">
              {user?.name ? user.name.split(" ")[0] : "Neighbor"} <span>👋🏽</span>
            </h2>
          </div>
          <div className="current-user-avatar-badge" aria-hidden="true">
            {user?.avatar || "🧑🏽‍💻"}
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar" role="search">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="var(--ink-soft)" strokeWidth="2.2" />
            <path d="m21 21-3.5-3.5" stroke="var(--ink-soft)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search skill (e.g. Guitar, Python, IELTS)..."
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

        {/* Skill Tag Filters */}
        <div className="tag-scroll-row" role="region" aria-label="Skill tags">
          {popularSkillTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              className={`tag-pill ${activeTag === tag ? "tag-pill--active" : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
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

        {/* "People who teach what you want to learn" Shelf */}
        {recommendations.length > 0 && !query && !activeTag && (
          <section className="recommendations-section" aria-label="Recommended neighbors">
            <div className="section-header-row">
              <span className="section-label">🎯 Matches For You</span>
              <span className="section-sub">Teaches what you want to learn</span>
            </div>

            <div className="recommendations-carousel">
              {recommendations.map((person) => (
                <div key={person.id} className="recommendation-card">
                  <div className="rec-avatar">{person.avatar}</div>
                  <span className="rec-name">{person.name}</span>
                  <span className="rec-area">{person.area}</span>
                  <div className="rec-skill-chip">
                    {person.teaches.find((s) =>
                      user?.wants?.some((w) => s.toLowerCase().includes(w.toLowerCase()))
                    ) || person.teaches[0]}
                  </div>
                  <button
                    className="rec-request-btn"
                    onClick={() => setSelectedNeighborForRequest(person)}
                  >
                    Request
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="stitch-divider" />

        {/* Main Feed Section */}
        <div className="feed-header">
          <h3 className="section-label">
            {filteredNeighbors.length} Skilled Neighbor{filteredNeighbors.length !== 1 ? "s" : ""} in {currentDistrict}
          </h3>
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
              <h4 className="empty-title">No matching neighbors found</h4>
              <p className="empty-desc">
                No neighbors in {currentDistrict} match your current filter. Try searching a different skill or picking another district!
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
