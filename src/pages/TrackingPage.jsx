import React, { useState, useEffect } from "react";
import { Search, Package, MapPin, Calendar, CheckCircle, Clock, Truck, ShieldCheck, SearchCode, Phone } from "lucide-react";
import { apiRequest } from "../utils/api";
import { Cedis } from "../utils/currency";
import { motion, AnimatePresence } from "framer-motion";

const TrackingPage = () => {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoaded(true), 100);

    const searchParams = new URLSearchParams(window.location.search);
    const urlOrderId = searchParams.get("orderId") || searchParams.get("id");
    const urlPhone = searchParams.get("phone");

    if (urlOrderId) setOrderId(urlOrderId);
    if (urlPhone) setPhone(urlPhone);

    if (urlOrderId && urlPhone) {
      const autoTrack = async () => {
        setLoading(true);
        setError("");
        setOrder(null);
        try {
          const res = await apiRequest(`/orders/track?orderId=${encodeURIComponent(urlOrderId)}&phone=${encodeURIComponent(urlPhone)}`);
          if (res.success) {
            setOrder(res.data);
          } else {
            setError(res.message || "Order not found. Please check your details.");
          }
        } catch (err) {
          setError("Unable to connect to server. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      autoTrack();
    }

    return () => clearTimeout(timer);
  }, []);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!orderId || !phone) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await apiRequest(`/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`);
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.message || "Order not found. Please check your details.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { label: "Pending", icon: <Clock size={20} />, color: "#64748b", desc: "Verifying payment..." },
    { label: "Processing", icon: <Package size={20} />, color: "#d97706", desc: "Packaging your order..." },
    { label: "Shipped", icon: <Truck size={20} />, color: "#2563eb", desc: "On its way to you!" },
    { label: "Delivered", icon: <CheckCircle size={20} />, color: "#16a34a", desc: "Enjoy your new glow!" },
  ];

  const getCurrentStepIndex = (status) => {
    const idx = statusSteps.findIndex(s => s.label.toLowerCase() === status.toLowerCase());
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="tracking-page section-padding container" style={{ minHeight: "85vh" }}>
      <div className={`reveal center-text ${isLoaded ? "active" : ""}`} style={{ maxWidth: "700px", margin: "0 auto 4rem", textAlign: "center" }}>
        <h1 className="serif" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>Track Your Glow</h1>
        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Enter your Order ID and Phone to follow your order in real-time.</p>
      </div>

      <div className={`search-card glass reveal shadowed ${isLoaded ? "active" : ""}`} style={{ maxWidth: "500px", margin: "0 auto", padding: "3rem", borderRadius: "28px" }}>
        <form onSubmit={handleTrack}>
          <div className="form-group-premium" style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.8rem", fontWeight: 700, fontSize: "0.9rem" }}>Order ID</label>
            <div style={{ position: "relative" }}>
              <SearchCode size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                required
                placeholder="e.g. VS-1234"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "1.2rem 1rem 1.2rem 3rem",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </div>
          </div>
          <div className="form-group-premium">
            <label style={{ display: "block", marginBottom: "0.8rem", fontWeight: 700, fontSize: "0.9rem" }}>WhatsApp Number</label>
            <div style={{ position: "relative" }}>
              <Phone size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                required
                placeholder="0244374433"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "1.2rem 1rem 1.2rem 3rem",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="cta-button-premium"
            style={{ width: "100%", marginTop: "2rem", borderRadius: "14px", justifyContent: "center", padding: "1.2rem" }}
          >
            {loading ? "Locating..." : "Track My Order"}
          </button>
        </form>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ color: "#ef4444", marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", fontWeight: 600 }}
          >
            {error}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {order && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`results-area reveal ${isLoaded ? "active" : ""}`} 
            style={{ marginTop: "5rem", maxWidth: "900px", margin: "5rem auto 0" }}
          >
            <div className="order-health-card glass shadowed" style={{ padding: "3rem", borderRadius: "32px", border: "1px solid rgba(0, 0, 0, 0.05)" }}>
              <div className="flex justify-between items-center" style={{ marginBottom: "3rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#64748b", fontWeight: 700 }}>Order Tracking</span>
                  <h3 className="serif" style={{ fontSize: "2rem", margin: "0.5rem 0" }}>#{order.orderId}</h3>
                </div>
                <div style={{ textAlign: "right" }}>
                   <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.3rem" }}>Est. Delivery</p>
                   <p style={{ fontWeight: 800, color: "#0A0A0A" }}>{new Date(new Date(order.createdAt).getTime() + 48*60*60*1000).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Visual Stepper */}
              <div className="status-timeline-premium" style={{ position: "relative", display: "flex", justifyContent: "space-between", marginBottom: "4rem", padding: "0 10px" }}>
                 <div style={{ position: "absolute", top: "20px", left: "0", right: "0", height: "2px", background: "#e2e8f0", zIndex: 0 }}></div>
                 <div style={{ 
                   position: "absolute", 
                   top: "20px", 
                   left: "0", 
                   width: `${(getCurrentStepIndex(order.status) / (statusSteps.length - 1)) * 100}%`, 
                   height: "2px", 
                   background: "#0A0A0A", 
                   transition: "all 1s ease",
                   zIndex: 1 
                 }}></div>
                 
                 {statusSteps.map((s, idx) => {
                   const isActive = idx <= getCurrentStepIndex(order.status);
                   const isCurrent = idx === getCurrentStepIndex(order.status);
                   
                   return (
                     <div key={idx} style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "80px" }}>
                        <div style={{ 
                          width: "40px", 
                          height: "40px", 
                          borderRadius: "50%", 
                          background: isActive ? "#0A0A0A" : "white", 
                          color: isActive ? "white" : "#94a3b8",
                          border: isActive ? "none" : "2px solid #e2e8f0",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          boxShadow: isCurrent ? "0 0 20px rgba(0, 0, 0, 0.2)" : "none",
                          transition: "all 0.5s ease"
                        }}>
                          {s.icon}
                        </div>
                        <p style={{ 
                          marginTop: "1rem", 
                          fontSize: "0.75rem", 
                          fontWeight: isActive ? 800 : 500, 
                          color: isActive ? "#0A0A0A" : "#94a3b8",
                          textAlign: "center"
                        }}>{s.label}</p>
                        {isCurrent && (
                          <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            style={{ position: "absolute", top: "70px", width: "150px", fontSize: "0.7rem", color: "#64748b", textAlign: "center" }}
                          >
                            {s.desc}
                          </motion.p>
                        )}
                     </div>
                   )
                 })}
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "3rem", borderTop: "1px solid #f1f5f9", paddingTop: "2.5rem", marginTop: "2rem" }}>
                <div className="info-block">
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "1.5rem", letterSpacing: "0.1em" }}>Delivery Details</p>
                  <div className="flex items-center gap-4" style={{ marginBottom: "1.2rem" }}>
                    <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "12px" }}><MapPin size={20} color="#0A0A0A" /></div>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>Destination</p>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{order.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "12px" }}><Calendar size={20} color="#0A0A0A" /></div>
                    <div>
                       <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>Order Date</p>
                       <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-block">
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "1.5rem", letterSpacing: "0.1em" }}>Package Info</p>
                  <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "20px" }}>
                    {order.items.map((item, idx) => {
                      const spec = [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" • ");
                      return (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.9rem", color: "#1e293b", marginBottom: "0.6rem", fontWeight: 600 }}>
                          <div>
                            <div>{item.name}</div>
                            {spec && <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{spec}</div>}
                          </div>
                          <span style={{ color: "#64748b" }}>x{item.qty}</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, color: "#0A0A0A" }}>
                      <span>Total Paid</span>
                      <span><Cedis value={order.total} decimals={2} /></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="footer-links" style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "2rem" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.8rem" }}>
                    <ShieldCheck size={16} color="#16a34a" /> Verified SSL Secure
                 </div>
                 <a href="/" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0A0A0A", textDecoration: "none" }}>Back to Shop</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackingPage;
