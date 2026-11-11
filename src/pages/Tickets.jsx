import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const MODES = [
  { id: "airline", label: "Airline", icon: "✈️" },
  { id: "bus", label: "Bus", icon: "🚌" },
  { id: "train", label: "Train", icon: "🚆" },
];

export default function Tickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(null);
  const [companies, setCompanies] = useState([]); // all companies of the chosen country
  const [mode, setMode] = useState("");
  const [company, setCompany] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [seats, setSeats] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/travel/countries").then(({ data }) => setCountries(data)).catch(() => setError("Could not load countries. Is the backend running?"));
  }, []);

  const pickCountry = async (c) => {
    setCountry(c); setMode(""); setCompany(null); setTickets([]); setMessage("");
    const { data } = await api.get("/travel/companies", { params: { country: c._id } });
    setCompanies(data);
  };

  const pickMode = (m) => { setMode(m); setCompany(null); setTickets([]); setMessage(""); };

  const pickCompany = async (c) => {
    setCompany(c); setMessage("");
    const { data } = await api.get("/products", { params: { kind: "ticket", company: c._id, limit: 50 } });
    setTickets(data.products);
  };

  const reset = (step) => {
    if (step === "country") { setCountry(null); setCompanies([]); }
    setMode(""); setCompany(null); setTickets([]); setMessage("");
  };

  const handleAdd = async (t) => {
    if (!user) return navigate("/login");
    try {
      await addToCart(t._id, Number(seats[t._id] || 1));
      setMessage(`Added to cart: ${t.name}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add ticket");
    }
  };

  const availableModes = MODES.filter((m) => companies.some((c) => c.mode === m.id));
  const modeCompanies = companies.filter((c) => c.mode === mode);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Book tickets</h1>
        <p>Choose a country, then airline, bus or train, then the operator, then your ticket.</p>
      </div>

      <div className="crumbs">
        <button className={!country ? "crumb active" : "crumb"} onClick={() => reset("country")}>1. Country{country ? `: ${country.name}` : ""}</button>
        <button className={country && !mode ? "crumb active" : "crumb"} disabled={!country} onClick={() => reset("mode")}>2. Transport{mode ? `: ${mode}` : ""}</button>
        <button className={mode && !company ? "crumb active" : "crumb"} disabled={!mode} onClick={() => { setCompany(null); setTickets([]); }}>3. Company{company ? `: ${company.name}` : ""}</button>
        <span className={company ? "crumb active" : "crumb"}>4. Tickets</span>
      </div>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="notice">{message}</p>}

      {!country && (
        <div className="option-grid">
          {countries.map((c) => (
            <button key={c._id} className="card option-card" onClick={() => pickCountry(c)}>
              <span className="option-icon">{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {country && !mode && (
        <div className="option-grid">
          {availableModes.map((m) => (
            <button key={m.id} className="card option-card" onClick={() => pickMode(m.id)}>
              <span className="option-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {mode && !company && (
        <div className="option-grid">
          {modeCompanies.map((c) => (
            <button key={c._id} className="card option-card" onClick={() => pickCompany(c)}>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {company && (
        <div className="card">
          <table>
            <thead>
              <tr><th>Route</th><th>Departs</th><th>Arrives</th><th>Class</th><th>Seats left</th><th>Price</th><th>Seats</th><th></th></tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>{t.from} → {t.to}</td>
                  <td>{t.departureTime}</td>
                  <td>{t.arrivalTime}</td>
                  <td>{t.travelClass}</td>
                  <td>{t.stock}</td>
                  <td>${t.price.toFixed(2)}</td>
                  <td>
                    <input type="number" min="1" max={t.stock} value={seats[t._id] || 1} style={{ width: "64px" }}
                      onChange={(e) => setSeats((s) => ({ ...s, [t._id]: e.target.value }))} />
                  </td>
                  <td><button className="btn btn-primary btn-sm" disabled={t.stock === 0} onClick={() => handleAdd(t)}>{t.stock === 0 ? "Sold out" : "Add to cart"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && <div className="empty-state">No tickets for this company yet.</div>}
        </div>
      )}
    </div>
  );
}