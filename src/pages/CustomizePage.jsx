import React, { useState } from "react";
import { Sparkles, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const PRODUCT_TYPES = ["Dress", "Bag", "Top", "Skirt", "Outerwear", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

const CustomizePage = ({ addOrder }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    location: "",
    productType: "Dress",
    color: "",
    size: "M",
    fabric: "",
    instructions: "",
  });

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const itemName = `Custom ${form.productType} — ${form.color || "Color: customer's choice"}`;
    const notes = [
      `Product Type: ${form.productType}`,
      `Color: ${form.color || "Not specified"}`,
      `Size: ${form.size}`,
      form.fabric && `Fabric/Material: ${form.fabric}`,
      form.instructions && `Special Instructions: ${form.instructions}`,
    ]
      .filter(Boolean)
      .join("\n");

    const orderData = {
      customer: form.customer,
      phone: form.phone,
      smsPhone: form.phone,
      location: form.location,
      items: [{ name: itemName, category: form.productType, qty: 1, size: form.size }],
      total: 0,
      notes,
      isCustomRequest: true,
      paymentMethod: "To Be Confirmed",
      status: "Pending",
    };

    const res = await addOrder(orderData);
    setIsSubmitting(false);

    if (res?.success) {
      Swal.fire({
        title: "Request Received!",
        text: "We've received your custom order request. Our team will reach out on WhatsApp/phone to confirm design details and pricing.",
        icon: "success",
        confirmButtonColor: "#0A0A0A",
      }).then(() => navigate("/"));
    } else {
      Swal.fire("Error", res?.message || "Could not submit your request. Please try again.", "error");
    }
  };

  return (
    <div className="customize-page">
      <section className="section-padding container">
        <div className="customize-layout">
          <div id="how-it-works" className="customize-intro">
            <h2 className="serif" style={{ fontSize: "2.4rem", margin: "0 0 1.5rem" }}>
              Your Vision, Handcrafted by WELAMA
            </h2>
            <p style={{ color: "#666", lineHeight: "1.8", marginBottom: "2rem" }}>
              Can't find exactly what you're picturing? Tell us the piece, the
              color, the fit, and any special details — our team will bring
              your idea to life and reach out to confirm pricing before we
              begin.
            </p>

            <ul className="customize-steps">
              <li>
                <CheckCircle size={18} color="#C9A227" />
                <span>Tell us what you want to create</span>
              </li>
              <li>
                <CheckCircle size={18} color="#C9A227" />
                <span>We confirm design details & price with you</span>
              </li>
              <li>
                <CheckCircle size={18} color="#C9A227" />
                <span>Your custom piece is made and delivered</span>
              </li>
            </ul>
          </div>

          <div id="start-order" className="customize-form-card">
            <div className="customize-form-header">
              <Sparkles size={22} color="#C9A227" />
              <h3 className="serif">Start Your Custom Order</h3>
            </div>

            <form onSubmit={handleSubmit} className="review-form">
              <div className="review-form-group">
                <label>Product Type</label>
                <select value={form.productType} onChange={handleChange("productType")}>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4" style={{ display: "flex", gap: "1rem" }}>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label>Preferred Color</label>
                  <input
                    type="text"
                    required
                    value={form.color}
                    onChange={handleChange("color")}
                    placeholder="e.g. Emerald Green"
                  />
                </div>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label>Size</label>
                  <select value={form.size} onChange={handleChange("size")}>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="review-form-group">
                <label>Fabric / Material (optional)</label>
                <input
                  type="text"
                  value={form.fabric}
                  onChange={handleChange("fabric")}
                  placeholder="e.g. Silk blend, leather, cotton"
                />
              </div>

              <div className="review-form-group">
                <label>Special Instructions (optional)</label>
                <textarea
                  rows={4}
                  value={form.instructions}
                  onChange={handleChange("instructions")}
                  placeholder="Describe the design, fit, or any details you'd like..."
                />
              </div>

              <div className="review-form-group">
                <label>Your Name</label>
                <input type="text" required value={form.customer} onChange={handleChange("customer")} placeholder="Full name" />
              </div>

              <div className="flex gap-4" style={{ display: "flex", gap: "1rem" }}>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label>Phone Number</label>
                  <input type="tel" required value={form.phone} onChange={handleChange("phone")} placeholder="e.g. 0551082163" />
                </div>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label>Location</label>
                  <input type="text" required value={form.location} onChange={handleChange("location")} placeholder="e.g. Accra" />
                </div>
              </div>

              <button
                type="submit"
                className="cta-button-premium"
                disabled={isSubmitting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span>{isSubmitting ? "Submitting..." : "Submit Custom Request"}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomizePage;
