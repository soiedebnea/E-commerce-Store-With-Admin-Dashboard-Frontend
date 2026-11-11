import React from "react";
import { useEffect, useState } from "react";
import api from "../../api/api";
import StatusBadge from "../StatusBadge";

const ORDER_STATUSES = ["processing", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/orders").then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, field, value) => {
    await api.put(`/orders/${id}/status`, { [field]: value });
    load();
  };

  if (loading) return <p>Loading orders…</p>;

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment status</th>
            <th>Order status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-8)}</td>
              <td>{o.user?.name || "—"}<br /><span style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>{o.user?.email}</span></td>
              <td>${o.totalAmount.toFixed(2)}</td>
              <td>
                <select value={o.paymentStatus} onChange={(e) => updateStatus(o._id, "paymentStatus", e.target.value)}>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {" "}<StatusBadge status={o.paymentStatus} />
              </td>
              <td>
                <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, "orderStatus", e.target.value)}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {" "}<StatusBadge status={o.orderStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <div className="empty-state">No orders yet.</div>}
    </div>
  );
}