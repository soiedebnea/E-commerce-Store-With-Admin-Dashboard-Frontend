import React from "react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : location.state?.from || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <div className="card form-box">
        <h1>Welcome back</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          <div className="form-field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy} type="submit">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="form-note">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="form-note" style={{ fontSize: "0.8rem" }}>
          Admin demo login: admin@example.com / Admin@123 (after running the seed script)
        </p>
      </div>
    </div>
  );
}