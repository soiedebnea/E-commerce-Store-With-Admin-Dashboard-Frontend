import React from "react";
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p>Loading stats…</p>;

  const cards = [
    { label: "Total revenue (paid)", value: `$${stats.totalRevenue.toFixed(2)}` },
    { label: "Total orders", value: stats.totalOrders },
    { label: "Paid orders", value: stats.paidOrders },
    { label: "Pending payments", value: stats.pendingOrders },
    { label: "Failed payments", value: stats.failedOrders },
    { label: "Products", value: stats.productCount },
    { label: "Low stock (≤5)", value: stats.lowStockProducts },
    { label: "Customers", value: stats.userCount },
  ];

  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div className="card stat-card" key={c.label}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}