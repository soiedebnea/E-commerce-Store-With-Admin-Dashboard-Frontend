import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container page">
      <div className="empty-state">
        <h2>Page not found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Back to shop</Link>
      </div>
    </div>
  );
}