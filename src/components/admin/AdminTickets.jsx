import React, { useEffect, useState } from "react";
import api from "../../api/api";

const empty = { country: "", mode: "airline", company: "", from: "", to: "", departureTime: "", arrivalTime: "", travelClass: "Economy", price: "", stock: "40" };

export default function AdminTickets() {
  const [countries, setCountries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const loadTickets = () => api.get("/products", { params: { kind: "ticket", limit: 200 } }).then(({ data }) => setTickets(data.products));

  useEffect(() => {
    api.get("/travel/countries").then(({ data }) => setCountries(data));
    loadTickets();
  }, []);

  useEffect(() => {
    if (!form.country) return setCompanies([]);
    api.get("/travel/companies", { params: { country: form.country, mode: form.mode } }).then(({ data }) => setCompanies(data));
  }, [form.country, form.mode]);

  const set = (f) => (e) => setForm((x) => ({ ...x, [f]: e.target.value, ...(f === "country" || f === "mode" ? { company: "" } : {}) }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const companyName = companies.find((c) => c._id === form.company)?.name || "";
    try {
      await api.post("/products", {
        kind: "ticket",
        name: `${companyName}: ${form.from} to ${form.to}`,
        category: "Ticket",
        brand: companyName,
        country: form.country, company: form.company, mode: form.mode,
        from: form.from, to: form.to,
        departureTime: form.departureTime, arrivalTime: form.arrivalTime, travelClass: form.travelClass,
        price: Number(form.price), stock: Number(form.stock),
      });
      setForm({ ...empty, country: form.country, mode: form.mode, company: form.company });
      loadTickets();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save ticket");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this ticket?")) return;
    await api.delete(`/products/${id}`);
    loadTickets();
  };

  return (
    <div>
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3>Add a ticket</h3>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <div className="form-field"><label>Country</label>
              <select required value={form.country} onChange={set("country")}>
                <option value="">Select…</option>
                {countries.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select></div>
            <div className="form-field"><label>Transport</label>
              <select value={form.mode} onChange={set("mode")}>
                <option value="airline">Airline</option><option value="bus">Bus</option><option value="train">Train</option>
              </select></div>
            <div className="form-field"><label>Company</label>
              <select required value={form.company} onChange={set("company")}>
                <option value="">Select…</option>
                {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select></div>
            <div className="form-field"><label>From</label><input required value={form.from} onChange={set("from")} /></div>
            <div className="form-field"><label>To</label><input required value={form.to} onChange={set("to")} /></div>
            <div className="form-field"><label>Class</label><input value={form.travelClass} onChange={set("travelClass")} /></div>
            <div className="form-field"><label>Departure (e.g. 08:30)</label><input required value={form.departureTime} onChange={set("departureTime")} /></div>
            <div className="form-field"><label>Arrival (e.g. 11:00)</label><input required value={form.arrivalTime} onChange={set("arrivalTime")} /></div>
            <div className="form-field"><label>Price ($)</label><input required type="number" min="0" step="0.01" value={form.price} onChange={set("price")} /></div>
            <div className="form-field"><label>Seats</label><input required type="number" min="0" value={form.stock} onChange={set("stock")} /></div>
          </div>
          <button className="btn btn-primary" type="submit">Add ticket</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Ticket</th><th>Mode</th><th>Departs</th><th>Price</th><th>Seats</th><th></th></tr></thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id}>
                <td>{t.name}</td><td>{t.mode}</td><td>{t.departureTime}</td><td>${t.price.toFixed(2)}</td><td>{t.stock}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => remove(t._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}