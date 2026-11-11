import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <div className="card form-box">
        <h1>Create your account</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          <div className="form-field">
            <label>Full name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy} type="submit">
            {busy ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="form-note">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}