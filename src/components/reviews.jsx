import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Stars from "./Stars";

export default function Reviews({ productId, onChange }) {
  const { user } = useAuth();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get(`/products/${productId}/reviews`).then(({ data }) => setData(data)).catch(() => {});

  useEffect(() => {
    load();
  }, [productId]);

  const mine = user && data.reviews.find((r) => r.user?._id === user.id);

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment || "");
    }
  }, [mine?._id]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      await load();
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your review");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this review?")) return;
    await api.delete(`/products/${productId}/reviews/${id}`);
    if (mine && mine._id === id) { setRating(5); setComment(""); }
    await load();
    onChange && onChange();
  };

  return (
    <div className="card reviews">
      <h3>Customer reviews</h3>
      <p><Stars value={data.average} count={data.count} /></p>

      {user ? (
        <form onSubmit={submit} className="review-form">
          <strong>{mine ? "Edit your review" : "Write a review"}</strong>
          {error && <p className="form-error">{error}</p>}
          <div className="rating-input" role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} className={n <= rating ? "on" : ""} onClick={() => setRating(n)} aria-label={`${n} stars`}>★</button>
            ))}
          </div>
          <textarea rows={3} maxLength={1000} placeholder="Share what you thought (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn btn-secondary btn-sm" type="submit" disabled={busy}>{mine ? "Update review" : "Submit review"}</button>
        </form>
      ) : (
        <p><Link to="/login"><u>Log in</u></Link> to write a review.</p>
      )}

      {data.reviews.map((r) => (
        <div className="review" key={r._id}>
          <div><Stars value={r.rating} /> <strong>{r.user?.name || "Customer"}</strong>
            {r.verifiedPurchase && <span className="badge badge-paid" style={{ marginLeft: "0.5rem" }}>Verified purchase</span>}
          </div>
          {r.comment && <p>{r.comment}</p>}
          <small>{new Date(r.createdAt).toLocaleDateString()}</small>
          {user && (r.user?._id === user.id || user.role === "admin") && (
            <button className="btn btn-danger btn-sm" style={{ marginLeft: "0.75rem" }} onClick={() => remove(r._id)}>Delete</button>
          )}
        </div>
      ))}
      {data.count === 0 && <p style={{ color: "var(--ink-soft)" }}>No reviews yet. Be the first!</p>}
    </div>
  );
}