import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, MessageCircle } from "lucide-react";
import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../utils/api";
import { waLink } from "../utils/whatsapp";
import { Cedis, formatCedis } from "../utils/currency";

const CheckoutPage = ({ addOrder }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const deliveryFee = 25;
  const totalWithDelivery = cartTotal + deliveryFee;

  const [paymentMethod, setPaymentMethod] = useState("whatsapp"); // "whatsapp" | "paystack"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    phone: "",
    smsPhone: "",
    email: "",
    location: "",
  });

  // Check for Paystack redirect callback on page load
  useEffect(() => {
    window.scrollTo(0, 0);

    const searchParams = new URLSearchParams(location.search);
    const reference = searchParams.get("reference") || searchParams.get("trxref") || searchParams.get("paystack_ref");
    const isMock = searchParams.get("paystack_mock");
    const mockOrderId = searchParams.get("orderId");

    if (reference || (isMock && mockOrderId)) {
      const verifyPayment = async () => {
        setIsSubmitting(true);
        try {
          const refToVerify = reference || `MOCK_${mockOrderId}`;
          const res = await apiRequest(`/payment/paystack/verify/${encodeURIComponent(refToVerify)}?orderId=${encodeURIComponent(mockOrderId || '')}&mock=${isMock || ''}`);
          if (res.success) {
            clearCart();
            confetti({
              particleCount: 180,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#0A0A0A", "#C9A227", "#ffffff"]
            });

            const order = res.data;
            const orderId = order?.orderId || mockOrderId || 'VS-SUCCESS';
            const trackUrl = `/track?orderId=${orderId}&phone=${encodeURIComponent(order?.phone || '')}`;

            Swal.fire({
              title: "💳 Payment Successful!",
              html: `
                <div style="text-align: center; font-family: inherit;">
                  <p style="font-size: 1rem; color: #16a34a; font-weight: 700; margin-bottom: 0.5rem;">
                    Paystack Transaction Verified!
                  </p>
                  <p style="margin-bottom: 1rem; font-size: 0.95rem;">Order <b>#${orderId}</b> has been paid and confirmed.</p>
                  <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1.5rem;">An mNotify SMS confirmation has been dispatched with your live tracking details.</p>
                  <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
                    <a href="${trackUrl}" style="background: #0A0A0A; color: white; text-decoration: none; border-radius: 12px; padding: 0.9rem 1.75rem; font-weight: 700; font-size: 0.9rem; width: 100%; max-width: 280px; text-align: center;">
                      📦 Track Your Package
                    </a>
                    <a href="/shop" style="background: #f8fafc; color: #334155; border: 1px solid #e2e8f0; text-decoration: none; border-radius: 12px; padding: 0.8rem 1.75rem; font-weight: 700; font-size: 0.85rem; width: 100%; max-width: 280px; text-align: center;">
                      Continue Shopping
                    </a>
                  </div>
                </div>
              `,
              icon: "success",
              showConfirmButton: false,
              allowOutsideClick: false,
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSubmitting(false);
        }
      };

      verifyPayment();
    }
  }, [location.search]);

  const handleOrderSubmission = async (e) => {
    e?.preventDefault?.();
    if (!formData.customer || !formData.phone || !formData.location) {
      Swal.fire("Missing details", "Please fill in your name, WhatsApp number, and delivery address.", "warning");
      return;
    }
    if (paymentMethod === "paystack" && !formData.email) {
      Swal.fire("Email required", "Paystack needs your email to send a receipt.", "warning");
      return;
    }
    setIsSubmitting(true);

    const orderData = {
      customer: formData.customer,
      phone: formData.phone,
      smsPhone: formData.smsPhone || formData.phone,
      email: formData.email,
      location: formData.location,
      items: cartItems.map((i) => ({
        productId: i._id || i.id || null,
        name: i.name,
        image: i.image && !String(i.image).startsWith("blob:") ? i.image : "",
        category: i.category || "Luxury",
        qty: i.qty,
        size: i.selectedSize || i.size || "Standard",
        color: i.selectedColor || "",
      })),
      total: totalWithDelivery,
      paymentScreenshot: null,
      paymentMethod: paymentMethod === "paystack" ? "Paystack (Online)" : "Direct WhatsApp Order",
      payment: paymentMethod === "paystack" ? "Unpaid" : "Unpaid",
      status: "Processing",
    };

    // WhatsApp order — same flow as product details
    if (paymentMethod === "whatsapp") {
      const res = await addOrder({ ...orderData, paymentMethod: "Direct WhatsApp Order" });
      setIsSubmitting(false);
      if (res.success) {
        const order = res.data;
        const itemsList = cartItems
          .map((i) => {
            const spec = [i.selectedSize && `Size: ${i.selectedSize}`, i.selectedColor && `Color: ${i.selectedColor}`].filter(Boolean).join(", ");
            return `• ${i.name}${spec ? ` (${spec})` : ""} x${i.qty}`;
          })
          .join("\n");
        const whatsappMessage =
          `Hi WELAMA! I'd like to order:\n\n${itemsList}\n\n💰 Total: ${formatCedis(totalWithDelivery, 2)}\n\n*Order ID:* ${order.orderId}\n👤 Name: ${formData.customer}\n📞 WhatsApp: ${formData.phone}\n📍 ${formData.location}\n\nPlease confirm availability. Thank you! 🙏`;
        window.open(waLink(whatsappMessage), "_blank");
        clearCart();
        Swal.fire({
          title: "Order Sent! 🎉",
          html: `Your order <strong>${order.orderId}</strong> was created.<br/><br/>We'll confirm on WhatsApp shortly, and you'll get SMS updates on <strong>${formData.smsPhone || formData.phone}</strong>.`,
          icon: "success",
          confirmButtonColor: "#0A0A0A",
        }).then(() => navigate("/"));
      } else {
        Swal.fire("Error", res.message || "Could not place order", "error");
      }
      return;
    }

    // If Paystack selected, initialize transaction first
    if (paymentMethod === "paystack") {
      try {
        // Save pending order first
        const orderRes = await addOrder(orderData);
        if (!orderRes.success) {
          Swal.fire("Error", orderRes.message || "Could not place order", "error");
          setIsSubmitting(false);
          return;
        }

        const paystackRes = await apiRequest("/payment/paystack/initialize", "POST", {
          orderId: orderRes.data.orderId,
          amount: totalWithDelivery,
          customerEmail: formData.email,
          customerName: formData.customer,
          customerPhone: formData.phone,
        });

        if (paystackRes.success && paystackRes.data?.authorization_url) {
          // Redirect to Paystack Checkout URL
          window.location.href = paystackRes.data.authorization_url;
          return;
        } else {
          Swal.fire("Payment Notice", paystackRes.message || "Could not start Paystack checkout.", "warning");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Payment Error", "Failed to communicate with Paystack server.", "error");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page section-padding container" style={{ minHeight: "80vh" }}>
      <div className="checkout-grid">
        <div className="checkout-main-content">
          <form className="form-section glass shadowed" onSubmit={handleOrderSubmission}>
            <h3 className="serif" style={{ fontSize: "1.65rem", marginBottom: "0.5rem" }}>Where should we deliver?</h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Fill in your details below and choose how you would like to pay.
            </p>

            <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "2px solid #e2e8f0", marginBottom: "1.5rem" }}>
              <button
                type="button"
                onClick={() => setPaymentMethod("whatsapp")}
                style={{
                  flex: 1, padding: "0.85rem 1rem", fontWeight: 700, fontSize: "0.75rem",
                  textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                  background: paymentMethod === "whatsapp" ? "#25D366" : "#f8fafc",
                  color: paymentMethod === "whatsapp" ? "white" : "#666",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
                }}
              >
                <MessageCircle size={16} /> WhatsApp Order
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("paystack")}
                style={{
                  flex: 1, padding: "0.85rem 1rem", fontWeight: 700, fontSize: "0.75rem",
                  textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                  background: paymentMethod === "paystack" ? "#0BA4DB" : "#f8fafc",
                  color: paymentMethod === "paystack" ? "white" : "#666",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
                }}
              >
                <CreditCard size={16} /> Pay with Paystack
              </button>
            </div>

            <div className="checkout-form-grid">
              <div className="form-group-premium">
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700 }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ama Serwaa"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                />
              </div>
              <div className="form-group-premium">
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700 }}>WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="055 108 2163"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group-premium">
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700 }}>SMS Number</label>
                <input
                  type="tel"
                  placeholder="Same as WhatsApp if empty"
                  value={formData.smsPhone}
                  onChange={(e) => setFormData({ ...formData, smsPhone: e.target.value })}
                />
              </div>
              {paymentMethod === "paystack" && (
                <div className="form-group-premium">
                  <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700 }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group-premium" style={paymentMethod === "paystack" ? undefined : { gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700 }}>Delivery Address / Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="Accra, East Legon / Near Total Station"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {paymentMethod === "whatsapp" ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="cta-button-premium"
                style={{
                  width: "100%", justifyContent: "center", borderRadius: "8px",
                  background: isSubmitting ? "#aaa" : "#25D366",
                  borderColor: isSubmitting ? "#aaa" : "#25D366",
                  color: "#fff",
                  marginTop: "0.5rem",
                }}
              >
                <MessageCircle size={18} />
                {isSubmitting ? "Preparing..." : "Send Order On WhatsApp"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="cta-button-premium"
                style={{
                  width: "100%", justifyContent: "center", borderRadius: "8px",
                  background: isSubmitting ? "#aaa" : "#0BA4DB",
                  borderColor: isSubmitting ? "#aaa" : "#0BA4DB",
                  color: "#fff",
                  marginTop: "0.5rem",
                }}
              >
                <CreditCard size={18} />
                {isSubmitting ? "Processing..." : <>Pay <Cedis value={totalWithDelivery} decimals={2} /> with Paystack</>}
              </button>
            )}
          </form>
        </div>

        <div className="summary-column">
           <div className="glass shadowed" style={{ padding: "2rem", borderRadius: "24px" }}>
              <h4 className="serif" style={{ fontSize: "1.2rem", marginBottom: "1.5rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>Order Summary</h4>
              <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1.5rem" }}>
                {cartItems.map(item => (
                  <div key={item.cartId} className="flex gap-4" style={{ marginBottom: "1rem" }}>
                     <img src={item.image} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                     <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>{item.name}</p>
                        <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          Qty: {item.qty} • {item.selectedSize || "Standard"}
                          {item.selectedColor ? ` • ${item.selectedColor}` : ""}
                        </p>
                     </div>
                     <p style={{ fontSize: "0.85rem", fontWeight: 700 }}><Cedis value={item.price * item.qty} decimals={2} /></p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "2px solid #0A0A0A", paddingTop: "1.5rem" }}>
                <div className="flex justify-between" style={{ marginBottom: "0.8rem", fontSize: "0.9rem" }}>
                   <span>Subtotal</span>
                   <span><Cedis value={cartTotal} decimals={2} /></span>
                </div>
                <div className="flex justify-between" style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                   <span>Delivery</span>
                   <span style={{ color: "#0A0A0A", fontWeight: 700 }}><Cedis value={deliveryFee} decimals={2} /></span>
                </div>
                <div className="flex justify-between" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0A0A0A" }}>
                   <span>Total</span>
                   <span><Cedis value={totalWithDelivery} decimals={2} /></span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
