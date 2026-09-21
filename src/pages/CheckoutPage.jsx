import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../utils/api";
import { catalogProductId } from "../utils/productId";
import { Cedis, formatCedis } from "../utils/currency";
import { GHANA_REGIONS, deliveryFeeFor } from "../utils/delivery";

const CheckoutPage = ({ addOrder }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    region: "",
    notes: "",
    deliveryMethod: "Home Delivery",
  });

  const isPickup = formData.deliveryMethod === "Pickup";
  const deliveryFee = deliveryFeeFor(formData.deliveryMethod, formData.region);
  const deliveryReady = isPickup || deliveryFee != null;
  const payableTotal = cartTotal + (deliveryReady ? deliveryFee : 0);

  const itemLines = useMemo(
    () =>
      cartItems.map((item) => {
        const spec = [item.selectedSize, item.selectedColor].filter(Boolean).join(" · ");
        return {
          ...item,
          line: spec ? `${item.name} · ${spec}` : item.name,
        };
      }),
    [cartItems],
  );

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
          const res = await apiRequest(`/payment/paystack/verify/${encodeURIComponent(refToVerify)}?orderId=${encodeURIComponent(mockOrderId || "")}&mock=${isMock || ""}`, "GET", null, 28000);
          if (res.success) {
            clearCart();
            confetti({
              particleCount: 180,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#0A0A0A", "#C9A227", "#ffffff"],
            });

            const order = res.data;
            const orderId = order?.orderId || mockOrderId || "VS-SUCCESS";
            const trackUrl = `/track?orderId=${encodeURIComponent(orderId)}`;

            Swal.fire({
              title: "Payment Successful!",
              html: `
                <div style="text-align: center; font-family: inherit;">
                  <p style="margin-bottom: 1rem; font-size: 0.95rem;">Order <b>#${orderId}</b> has been paid and confirmed.</p>
                  <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1.5rem;">We sent an SMS with your tracking details.</p>
                  <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
                    <a href="${trackUrl}" style="background: #0A0A0A; color: white; text-decoration: none; border-radius: 12px; padding: 0.9rem 1.75rem; font-weight: 700; font-size: 0.9rem; width: 100%; max-width: 280px; text-align: center;">Track your package</a>
                    <a href="/shop" style="background: #f8fafc; color: #334155; border: 1px solid #e2e8f0; text-decoration: none; border-radius: 12px; padding: 0.8rem 1.75rem; font-weight: 700; font-size: 0.85rem; width: 100%; max-width: 280px; text-align: center;">Continue shopping</a>
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

  const setField = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleOrderSubmission = async (e) => {
    e?.preventDefault?.();
    if (!formData.customer.trim() || !formData.phone.trim() || !formData.email.trim()) {
      Swal.fire("Missing details", "Please fill in your name, email, and phone number.", "warning");
      return;
    }
    if (!isPickup && (!formData.street.trim() || !formData.city.trim() || !formData.region)) {
      Swal.fire("Missing details", "Please add your address, town, and region so we can price delivery.", "warning");
      return;
    }

    const deliveryLocation = isPickup
      ? "Collect in store"
      : [formData.street, formData.city, formData.region, formData.notes && `Notes: ${formData.notes}`]
          .filter(Boolean)
          .join(", ");

    setIsSubmitting(true);

    const orderData = {
      customer: formData.customer,
      phone: formData.phone,
      smsPhone: formData.phone,
      email: formData.email,
      location: deliveryLocation,
      items: cartItems.map((i) => ({
        productId: catalogProductId(i._id || i.id),
        name: i.name,
        image: i.image && !String(i.image).startsWith("blob:") ? i.image : "",
        category: i.category || "Luxury",
        qty: i.qty,
        size: i.selectedSize || i.size || "Standard",
        color: i.selectedColor || "",
      })),
      total: payableTotal,
      paymentScreenshot: null,
      paymentMethod: "Paystack (Card or MoMo)",
      payment: "Unpaid",
      status: "Processing",
    };

    try {
      const orderRes = await addOrder(orderData);
      if (!orderRes.success) {
        Swal.fire("Error", orderRes.message || "Could not place order", "error");
        setIsSubmitting(false);
        return;
      }

      const paystackRes = await apiRequest("/payment/paystack/initialize", "POST", {
        orderId: orderRes.data.orderId,
        amount: payableTotal,
        customerEmail: formData.email,
        customerName: formData.customer,
        customerPhone: formData.phone,
      }, 28000);

      if (paystackRes.success && paystackRes.data?.authorization_url) {
        window.location.href = paystackRes.data.authorization_url;
        return;
      }
      Swal.fire("Payment Notice", paystackRes.message || "Could not start Paystack checkout.", "warning");
    } catch (err) {
      console.error(err);
      Swal.fire("Payment Error", "Failed to communicate with Paystack server.", "error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="co-page">
      <form className="co-wrap" onSubmit={handleOrderSubmission}>
        <section className="co-section">
          <h2>Contact</h2>

          <label className="co-field">
            <span>Full name</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={formData.customer}
              onChange={setField("customer")}
            />
          </label>

          <label className="co-field">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={setField("email")}
            />
            <small>Your receipt goes here.</small>
          </label>

          <label className="co-field">
            <span>Phone</span>
            <input
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="024 123 4567"
              value={formData.phone}
              onChange={setField("phone")}
            />
            <small>We text delivery updates here. Use the same number for MoMo.</small>
          </label>
        </section>

        <section className="co-section">
          <h2>How would you like it?</h2>
          <div className="co-choice-list">
            <button
              type="button"
              className={`co-choice ${!isPickup ? "is-active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, deliveryMethod: "Home Delivery" }))}
            >
              <strong>Deliver to me</strong>
              <span>Priced by region</span>
            </button>
            <button
              type="button"
              className={`co-choice ${isPickup ? "is-active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, deliveryMethod: "Pickup", region: "" }))}
            >
              <strong>Collect in store</strong>
              <span>Free</span>
            </button>
          </div>
        </section>

        {!isPickup && (
          <section className="co-section">
            <h2>Delivery address</h2>

            <label className="co-field">
              <span>Address</span>
              <textarea
                required
                rows={3}
                autoComplete="street-address"
                value={formData.street}
                onChange={setField("street")}
              />
              <small>Street, house number, and any landmark that helps.</small>
            </label>

            <label className="co-field">
              <span>Town or city</span>
              <input
                type="text"
                required
                autoComplete="address-level2"
                value={formData.city}
                onChange={setField("city")}
              />
            </label>

            <label className="co-field">
              <span>Region</span>
              <select
                required
                value={formData.region}
                onChange={setField("region")}
              >
                <option value="">Choose your region</option>
                {GHANA_REGIONS.map((region) => (
                  <option key={region.name} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
              <small>Sets your delivery cost.</small>
            </label>

            <label className="co-field">
              <span>Delivery notes</span>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={setField("notes")}
              />
              <small>Optional — anything the courier should know.</small>
            </label>
          </section>
        )}

        <section className="co-section">
          <h2>How it reaches you</h2>
          <div className="co-reach">
            {isPickup
              ? "Collect in store — no delivery fee."
              : deliveryReady
                ? `${formData.region} delivery is ${formatCedis(deliveryFee)}.`
                : "Choose your region above and we'll show the delivery cost."}
          </div>
        </section>

        <section className="co-order">
          <h2>Your order</h2>
          {itemLines.length === 0 ? (
            <p className="co-empty">Your bag is empty.</p>
          ) : (
            itemLines.map((item) => (
              <div key={item.cartId} className="co-line">
                <span>{item.line}{item.qty > 1 ? ` ×${item.qty}` : ""}</span>
                <strong><Cedis value={item.price * item.qty} /></strong>
              </div>
            ))
          )}
          <div className="co-line">
            <span>Subtotal</span>
            <span><Cedis value={cartTotal} /></span>
          </div>
          <div className="co-line">
            <span>Delivery</span>
            <span>{deliveryReady ? (deliveryFee ? <Cedis value={deliveryFee} /> : "Free") : "—"}</span>
          </div>
          <div className="co-line co-total">
            <span>Total</span>
            <strong><Cedis value={payableTotal} /></strong>
          </div>
          <button type="submit" className="co-pay" disabled={isSubmitting || !cartItems.length}>
            {isSubmitting ? "Processing..." : "Pay now"}
          </button>
          <p className="co-secure">Card and mobile money, secured by Paystack.</p>
        </section>
      </form>
    </div>
  );
};

export default CheckoutPage;
