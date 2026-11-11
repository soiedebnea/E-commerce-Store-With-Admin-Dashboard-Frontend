import React from "react";

export default function Stars({ value = 0, count }) {
  const filled = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(filled)}
      <span className="stars-empty">{"★".repeat(5 - filled)}</span>
      {count !== undefined && (
        <span className="stars-count">
          {" "}{value > 0 ? value.toFixed(1) : "No reviews"}{count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </span>
  );
}