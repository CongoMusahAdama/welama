import React, { useState, useEffect } from "react";
import { Search, Package, MapPin, Calendar, CheckCircle, Clock, Truck, SearchCode } from "lucide-react";
import { apiRequest } from "../utils/api";
import { Cedis } from "../utils/currency";

const STATUS_STEPS = [
  { label: "Pending", icon: Clock },
  { label: "Processing", icon: Package },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: CheckCircle },
];

const TrackingPage = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (idValue) => {
    const id = String(idValue || "").trim();
    if (!id) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await apiRequest(`/orders/track?orderId=${encodeURIComponent(id)}`);
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.message || "Order not found. Please check your Order ID.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(window.location.search);
    const urlOrderId = searchParams.get("orderId") || searchParams.get("id") || "";
    if (urlOrderId) {
      setOrderId(urlOrderId);
      lookup(urlOrderId);
    }
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    lookup(orderId);
  };

  const stepIndex = order
    ? Math.max(0, STATUS_STEPS.findIndex((s) => s.label.toLowerCase() === String(order.status || "").toLowerCase()))
    : 0;
  const cancelled = order && String(order.status).toLowerCase() === "cancelled";

  return (
    <div className="tracking-page section-padding">
      <div className="track-wrap">
        <header className="track-hero">
          <h1>Track your order</h1>
          <p>Enter your order ID to see where it is.</p>
        </header>

        <form className="track-form" onSubmit={handleTrack}>
          <label className="track-field">
            <span>Order ID</span>
            <div className="track-input">
              <SearchCode size={18} />
              <input
                type="text"
                required
                autoComplete="off"
                placeholder="e.g. WLM-ABC123"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
          </label>
          <button type="submit" className="track-submit" disabled={loading}>
            <Search size={18} />
            {loading ? "Checking…" : "Track order"}
          </button>
          {error && <p className="track-error">{error}</p>}
        </form>

        {order && (
          <section className="track-result" aria-live="polite">
            <div className="track-result-top">
              <div>
                <p className="track-kicker">Order</p>
                <h2>#{order.orderId}</h2>
                <p className="track-customer">{order.customer}</p>
              </div>
              <div className="track-badges">
                <span className={`track-badge status-${String(order.status || "pending").toLowerCase()}`}>
                  {order.status || "Pending"}
                </span>
                <span className={`track-badge pay-${String(order.payment || "unpaid").toLowerCase()}`}>
                  {order.payment || "Unpaid"}
                </span>
              </div>
            </div>

            {cancelled ? (
              <p className="track-cancelled">This order was cancelled.</p>
            ) : (
              <ol className="track-steps">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx < stepIndex;
                  const current = idx === stepIndex;
                  return (
                    <li key={step.label} className={`track-step${done ? " is-done" : ""}${current ? " is-current" : ""}`}>
                      <span className="track-step-icon">
                        <Icon size={16} />
                      </span>
                      <span className="track-step-label">{step.label}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="track-meta">
              <div className="track-meta-row">
                <MapPin size={18} />
                <div>
                  <p>Delivery</p>
                  <strong>{order.location || "—"}</strong>
                </div>
              </div>
              <div className="track-meta-row">
                <Calendar size={18} />
                <div>
                  <p>Placed</p>
                  <strong>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </strong>
                </div>
              </div>
            </div>

            <ul className="track-items">
              {(order.items || []).map((item, idx) => {
                const spec = [item.size, item.color].filter(Boolean).join(" · ");
                return (
                  <li key={idx}>
                    <div>
                      <strong>{item.name}</strong>
                      {spec && <span>{spec}</span>}
                    </div>
                    <em>×{item.qty}</em>
                  </li>
                );
              })}
            </ul>
            <div className="track-total">
              <span>Total</span>
              <strong>
                <Cedis value={order.total} decimals={2} />
              </strong>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
