import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, subtotal, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state card" style={{ padding: "3rem" }}>
          <h2>Your cart is empty</h2>
          <p>Browse the store and add something you like.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Your cart</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        <div className="card">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div className="cart-row" key={item._id}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {product.imageUrl && <img src={product.imageUrl} alt="" className="cart-thumb" />}
                  <div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-category">{product.category}</div>
                  </div>
                </div>
                <div className="qty-control">
                  <button onClick={() => updateItem(item._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item._id, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <div>${(product.price * item.quantity).toFixed(2)}</div>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(item._id)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <div className="card cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: "1rem" }} onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}