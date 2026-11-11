import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import StatusBadge from "../components/StatusBadge";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my").then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container page">Loading…</div>;

  return (
    <div className="container page">
      <div className="page-head">
        <h1>My orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state card" style={{ padding: "3rem" }}>No orders yet.</div>
      ) : (
        orders.map((order) => (
          <div className="card order-card" key={order._id}>
            <div className="order-card-head">
              <div>
                <strong>Order #{order._id.slice(-8)}</strong>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <StatusBadge status={order.paymentStatus} />
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>
            {order.items.map((item, idx) => (
              <div className="order-item-row" key={idx}>
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginTop: "0.5rem" }}>Paid with: {order.paymentMethod.replace(/_/g, " ")}</div>
            {order.paymentStatus !== "paid" && order.paymentMethod !== "cash_on_delivery" && order.orderStatus !== "cancelled" && (
              <Link to={`/payment/${order._id}`} className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem" }}>Complete payment</Link>
            )}
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}