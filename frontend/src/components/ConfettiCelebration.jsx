import React from "react";
import { useApp } from "../context/AppContext";
import "./ConfettiCelebration.css";

const COLORS = ["#0B5E42", "#F5A623", "#C4603F", "#2ECC71", "#FFD584", "#3498DB"];

export default function ConfettiCelebration() {
  const { confettiActive } = useApp();

  if (!confettiActive) return null;

  const pieces = Array.from({ length: 36 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.4}s`,
    animationDuration: `${1.4 + Math.random() * 0.9}s`,
    backgroundColor: COLORS[i % COLORS.length],
    transform: `rotate(${Math.random() * 360}deg)`,
    size: 7 + Math.random() * 8
  }));

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.backgroundColor,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
            transform: p.transform
          }}
        />
      ))}
    </div>
  );
}
