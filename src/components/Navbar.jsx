import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">ShopEase</Link>
        <nav className="nav-links">
          <Link to="/">Shop</Link>
          <Link to="/tickets">Tickets</Link>
          {user && (
            <Link to="/cart">
              Cart{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}
          {user && <Link to="/wishlist">Wishlist</Link>}
          {user && <Link to="/orders">My Orders</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          {user ? (
            <button onClick={handleLogout}>Log out</button>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}