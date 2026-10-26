import React from "react";

export default function StarRating({
  rating = 0,
  reviews = null,
  size = 14,
  interactive = false,
  onChange = null
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        cursor: interactive ? "pointer" : "default"
      }}
      aria-label={`Rating ${rating} out of 5 stars`}
    >
      <span style={{ display: "inline-flex", gap: 2 }}>
        {stars.map((starIndex) => {
          const filled = rating >= starIndex;
          const half = !filled && rating >= starIndex - 0.5;

          return (
            <button
              key={starIndex}
              type={interactive ? "button" : undefined}
              onClick={interactive && onChange ? () => onChange(starIndex) : undefined}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: interactive ? "pointer" : "inherit",
                display: "inline-flex",
                lineHeight: 1
              }}
              title={interactive ? `Rate ${starIndex} stars` : undefined}
              disabled={!interactive}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 20 20"
                style={{
                  display: "block",
                  transition: interactive ? "transform 0.15s ease" : "none"
                }}
              >
                <defs>
                  <linearGradient id={`star-half-${starIndex}`}>
                    <stop offset="50%" stopColor="var(--marigold)" />
                    <stop offset="50%" stopColor="var(--line-strong)" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6z"
                  fill={
                    filled
                      ? "var(--marigold)"
                      : half
                      ? `url(#star-half-${starIndex})`
                      : "var(--line-strong)"
                  }
                  stroke={filled || half ? "var(--marigold-deep)" : "transparent"}
                  strokeWidth="0.5"
                />
              </svg>
            </button>
          );
        })}
      </span>

      {!interactive && (
        <span
          style={{
            fontSize: size * 0.9,
            color: "var(--ink-soft)",
            fontWeight: 700,
            lineHeight: 1
          }}
        >
          {Number(rating).toFixed(1)}
          {reviews != null && (
            <span style={{ fontWeight: 500, color: "var(--ink-light)", marginLeft: 2 }}>
              ({reviews})
            </span>
          )}
        </span>
      )}
    </span>
  );
}
