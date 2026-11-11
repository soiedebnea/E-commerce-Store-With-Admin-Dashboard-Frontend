import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { items } = useWishlist();
  return (
    <div className="container page">
      <div className="page-head">
        <h1>Your wishlist</h1>
        <p>Products you saved for later. Tap the heart to remove one.</p>
      </div>
      {items.length === 0 ? (
        <div className="empty-state card" style={{ padding: "3rem" }}>
          <p>Nothing saved yet.</p>
          <Link to="/" className="btn btn-primary">Browse the shop</Link>
        </div>
      ) : (
        <div className="grid-products">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}