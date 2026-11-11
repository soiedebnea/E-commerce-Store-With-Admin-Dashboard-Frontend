import React from "react";
import { useState } from "react";
import AdminStats from "../components/admin/AdminStats";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminTickets from "../components/admin/AdminTickets";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "tickets", label: "Tickets" },
  { id: "orders", label: "Orders" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Admin dashboard</h1>
        <p>Manage your product catalog and track orders and payment status.</p>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <AdminStats />}
      {tab === "products" && <AdminProducts />}
      {tab === "tickets" && <AdminTickets />}
      {tab === "orders" && <AdminOrders />}
    </div>
  );
}