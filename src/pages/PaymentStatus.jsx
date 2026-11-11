import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import api from "../api/api";
import StatusBadge from "../components/StatusBadge";

const METHOD_NAMES = {
  card: "Card (Stripe)",
  sslcommerz: "SSLCommerz",
  bkash: "bKash",
  cash_on_delivery: "Cash on delivery",
  test_payment: "Test payment",
};

export default function PaymentStatus() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const result = params.get("result"); // success | failed | cancelled (set when coming back from a gateway)
  const started = useRef(false);

  const [order, setOrder] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | redirecting | done
  const [error, setError] = useState("");

  const startPayment = async () => {
    setError("");
    setPhase("redirecting");
    try {
      const { data } = await api.post(`/payments/${orderId}/start`);
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.paid) setOrder(data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Could not start the payment");
    }
    setPhase("done");
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        let { data: current } = await api.get(`/orders/${orderId}`);
        setOrder(current);

        if (current.paymentStatus === "pending" && result === "success" && current.paymentProvider === "stripe") {
          const { data } = await api.post(`/payments/${orderId}/confirm`);
          current = data;
          setOrder(data);
        }

        const needsPayment = current.paymentStatus === "pending" && current.paymentMethod !== "cash_on_delivery";
        if (needsPayment && !result) return startPayment(); // first visit: go pay
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this order");
      }
      setPhase("done");
    };
    run();
  }, [orderId]);

  if (phase === "loading" || phase === "redirecting") {
    return (
      <div className="container page">
        <div className="card" style={{ maxWidth: "520px", margin: "0 auto", padding: "2.5rem", textAlign: "center" }}>
          <h1>{phase === "redirecting" ? "Taking you to the payment page…" : "Loading…"}</h1>
          <p style={{ color: "var(--ink-soft)" }}>Please don't close this window.</p>
        </div>
      </div>
    );
  }

  const paid = order?.paymentStatus === "paid";
  const cod = order?.paymentMethod === "cash_on_delivery";
  let title = "Payment pending";
  if (paid) title = "Payment successful";
  else if (cod) title = "Order placed";
  else if (result === "cancelled") title = "Payment cancelled";
  else if (order?.paymentStatus === "failed" || result === "failed") title = "Payment failed";
  else if (result === "success") title = "Confirming your payment…";

  return (
    <div className="container page">
      <div className="card" style={{ maxWidth: "520px", margin: "0 auto", padding: "2.5rem", textAlign: "center" }}>
        <h1>{title}</h1>
        {error && <p className="form-error">{error}</p>}
        {order && (
          <>
            <p style={{ marginBottom: "1rem" }}>
              Order <strong>#{order._id.slice(-8)}</strong> — total ${order.totalAmount.toFixed(2)}
              <br />
              <span style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>{METHOD_NAMES[order.paymentMethod] || order.paymentMethod}</span>
            </p>
            <p style={{ marginBottom: "1.25rem" }}>
              Payment: <StatusBadge status={order.paymentStatus} /> &nbsp; Order: <StatusBadge status={order.orderStatus} />
            </p>
            {order.transactionId && (
              <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>Transaction ID: {order.transactionId}</p>
            )}
            {cod && !paid && <p style={{ color: "var(--ink-soft)" }}>Please pay in cash when your order arrives.</p>}
            {result === "success" && !paid && !cod && (
              <p style={{ color: "var(--ink-soft)" }}>
                We're waiting for the payment provider to confirm. Refresh in a moment, or check My Orders.
              </p>
            )}
          </>
        )}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
          {order && !paid && !cod && order.orderStatus !== "cancelled" && (
            <button className="btn btn-primary" onClick={startPayment}>Try payment again</button>
          )}
          <Link to="/orders" className="btn btn-secondary">View my orders</Link>
        </div>
      </div>
    </div>
  );
}