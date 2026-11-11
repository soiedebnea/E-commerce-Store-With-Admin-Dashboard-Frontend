import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Stars from "../components/Stars";
import Reviews from "../components/Reviews";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadProduct = () => api.get(`/products/${id}`).then(({ data }) => setProduct(data)).catch(() => setProduct(null));

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAdd = async () => {
    if (!user) return navigate("/login");
    setBusy(true);
    setMessage("");
    try {
      await addToCart(product._id, quantity);
      setMessage("Added to cart.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart.");
    } finally {
      setBusy(false);
    }
  };

  if (!product) return <div className="container page">Loading…</div>;

  return (
    <div className="container page">
      <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", padding: "2rem" }}>
        <div className="product-thumb" style={{ height: "280px", borderRadius: "6px" }}>
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : product.category}
        </div>
        <div>
          <div className="product-category">{product.brand || product.category}</div>
          <h1>{product.name}</h1>
          <p style={{ margin: "0 0 0.75rem" }}><Stars value={product.ratingAvg || 0} count={product.ratingCount || 0} /></p>
          <p style={{ color: "var(--ink-soft)" }}>{product.description}</p>
          <div className="product-price" style={{ fontSize: "1.6rem", margin: "1rem 0" }}>
            ${product.price.toFixed(2)}
          </div>
          <div className="product-stock" style={{ marginBottom: "1rem" }}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </div>

          {product.stock > 0 && (
            <div className="qty-control" style={{ marginBottom: "1rem" }}>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
          )}

          <button className="btn btn-primary" disabled={busy || product.stock === 0} onClick={handleAdd}>
            {product.stock === 0 ? "Out of stock" : "Add to cart"}
          </button>
          <button
            className="btn btn-outline"
            style={{ marginLeft: "0.6rem" }}
            onClick={() => (user ? toggle(product._id) : navigate("/login"))}
          >
            {has(product._id) ? "♥ Saved" : "♡ Save for later"}
          </button>
          {message && <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>{message}</p>}
        </div>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <Reviews productId={product._id} onChange={loadProduct} />
      </div>
    </div>
  );
}