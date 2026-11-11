import React from "react";
import { useEffect, useState } from "react";
import api from "../api/api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    api
      .get("/products", { params })
      .then(({ data }) => setProducts(data.products))
      .catch(() => setError("Could not load products. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Shop the collection</h1>
        <p>Browse everything in stock — search, filter by category, and add items to your cart.</p>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <div className="empty-state">No products match your search.</div>
      ) : (
        <div className="grid-products">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}