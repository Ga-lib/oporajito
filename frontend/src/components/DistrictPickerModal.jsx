import React, { useState, useMemo } from "react";
import { bangladeshDivisions, all64Districts } from "../data/bangladeshDistricts";
import "./DistrictPickerModal.css";

export default function DistrictPickerModal({
  isOpen,
  currentDistrict,
  onSelectDistrict,
  onClose
}) {
  const [search, setSearch] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");

  const divisionsList = useMemo(() => ["All", ...bangladeshDivisions.map((d) => d.name)], []);

  const filteredDistricts = useMemo(() => {
    let pool = all64Districts;
    if (selectedDivision !== "All") {
      const divObj = bangladeshDivisions.find((d) => d.name === selectedDivision);
      pool = divObj ? divObj.districts : all64Districts;
    }

    if (!search.trim()) return pool;
    return pool.filter((d) => d.toLowerCase().includes(search.trim().toLowerCase()));
  }, [search, selectedDivision]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bottom-sheet district-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle" />

        <div className="sheet-header">
          <div>
            <h2 className="sheet-title">Select District</h2>
            <p className="sheet-subtitle">Find skill-swappers across all 64 districts</p>
          </div>
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="district-search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--ink-soft)" strokeWidth="2" />
            <path d="m21 21-3.5-3.5" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search district (e.g. Bogura, Sylhet)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Division Filter Chips */}
        <div className="division-chips-row">
          {divisionsList.map((div) => (
            <button
              key={div}
              className={`division-chip ${selectedDivision === div ? "division-chip--active" : ""}`}
              onClick={() => setSelectedDivision(div)}
            >
              {div}
            </button>
          ))}
        </div>

        <div className="district-grid">
          {filteredDistricts.length === 0 ? (
            <p className="no-district-match">No districts found matching "{search}"</p>
          ) : (
            filteredDistricts.map((d) => {
              const isSelected = currentDistrict === d;
              return (
                <button
                  key={d}
                  className={`district-item-btn ${isSelected ? "district-item-btn--selected" : ""}`}
                  onClick={() => {
                    onSelectDistrict(d);
                    onClose();
                  }}
                >
                  <span className="district-name">{d}</span>
                  {isSelected && <span className="district-check">✓</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
