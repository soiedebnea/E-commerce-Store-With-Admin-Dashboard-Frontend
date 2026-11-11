import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const METHOD_LABELS = {
  card: "Credit / Debit card (Stripe)",
  sslcommerz: "SSLCommerz (cards, bKash, Nagad, internet banking)",
  bkash: "bKash",
  cash_on_delivery: "Cash on delivery",
  test_payment: "Test payment (demo only, no real money)",
};
const METHOD_ORDER = ["card", "sslcommerz", "bkash", "cash_on_delivery", "test_payment"];

export default function Checkout() {
  const { user } = useAuth();
  const { cart, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || "");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [methods, setMethods] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/payments/config").then(({ data }) => {
      const available = METHOD_ORDER.filter((m) => data[m]);
      setMethods(available);
      setPaymentMethod((cur) => cur || available[0] || "");
    }).catch(() => setError("Could not load payment options. Is the backend running?"));
  }, []);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container page">
        <p>Your cart is empty. <a href="/">Go shopping</a></p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data: order } = await api.post("/orders", {
        paymentMethod,
        contactEmail: user.email,
        shippingAddress: { fullName, addressLine, city, postalCode, country, phone },
      });
      await refreshCart();
      navigate(`/payment/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Checkout</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        <form className="card" style={{ padding: "1.5rem" }} onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          <h3>Shipping address</h3>
          <div className="form-field">
            <label>Full name</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Address</label>
            <input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-field">
              <label>City</label>
              <input required value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Postal code</label>
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-field">
              <label>Country</label>
              <input required value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input required={paymentMethod === "sslcommerz"} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <h3 style={{ marginTop: "1.5rem" }}>Payment method</h3>
          <div className="form-field">
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {methods.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
            </select>
            {paymentMethod === "sslcommerz" && <div className="method-note">A phone number is required for SSLCommerz.</div>}
            {paymentMethod === "test_payment" && <div className="method-note">Marks the order as paid without charging anything. Disabled in production.</div>}
          </div>

          <button className="btn btn-primary btn-block" disabled={busy || !paymentMethod} type="submit">
            {busy ? "Placing order…" : "Place order"}
          </button>
        </form>

        <div className="card cart-summary">
          <h3>Order summary</h3>
          {cart.items.map((item) => (
            <div className="summary-row" key={item._id}>
              <span>{item.product?.name} × {item.quantity}</span>
              <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}