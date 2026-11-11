import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentStatus from "./pages/PaymentStatus";
import Orders from "./pages/Orders";
import Tickets from "./pages/Tickets";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/payment/:orderId" element={<RequireAuth><PaymentStatus /></RequireAuth>} />
        <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />

        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}