import React from "react";
import { useEffect, useState } from "react";
import api from "../../api/api";

const emptyForm = { name: "", category: "", price: "", stock: "", brand: "", description: "", imageUrl: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = () => {
    api.get("/products", { params: { limit: 100 } }).then(({ data }) => setProducts(data.products));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post("/upload", body);
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      brand: p.brand || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3>{editingId ? "Edit product" : "Add a new product"}</h3>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-field">
              <label>Name</label>
              <input required value={form.name} onChange={handleChange("name")} />
            </div>
            <div className="form-field">
              <label>Category</label>
              <input required value={form.category} onChange={handleChange("category")} />
            </div>
            <div className="form-field">
              <label>Price ($)</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={handleChange("price")} />
            </div>
            <div className="form-field">
              <label>Stock</label>
              <input required type="number" min="0" value={form.stock} onChange={handleChange("stock")} />
            </div>
            <div className="form-field">
              <label>Brand</label>
              <input value={form.brand} onChange={handleChange("brand")} />
            </div>
            <div className="form-field">
              <label>Image (upload a file or paste a URL)</label>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleUpload} disabled={uploading} />
              <input placeholder="https://…" value={form.imageUrl} onChange={handleChange("imageUrl")} />
              {uploading && <small>Uploading…</small>}
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="admin-preview" />}
            </div>
          </div>
          <div className="form-field">
            <label>Description</label>
            <input value={form.description} onChange={handleChange("description")} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" type="submit">
              {editingId ? "Save changes" : "Add product"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}