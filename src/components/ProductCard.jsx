import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import Stars from "./Stars";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const liked = has(product._id);

  const onHeart = () => {
    if (!user) return navigate("/login");
    toggle(product._id);
  };

  return (
    <div className="card product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-thumb">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : product.category}
        </div>
        <div className="product-body">
          <div className="product-category">{product.brand || product.category}</div>
          <div className="product-name">{product.name}</div>
          {product.ratingCount > 0 && <Stars value={product.ratingAvg} count={product.ratingCount} />}
          <div className="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </div>
          <div className="product-price">${product.price.toFixed(2)}</div>
        </div>
      </Link>
      <button className={`heart ${liked ? "on" : ""}`} onClick={onHeart} aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}>
        {liked ? "♥" : "♡"}
      </button>
    </div>
  );
}