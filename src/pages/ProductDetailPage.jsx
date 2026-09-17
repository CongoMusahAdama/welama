import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, MessageCircle, CheckCircle, ChevronLeft, ShoppingCart, PackageSearch } from "lucide-react";
import Swal from "sweetalert2";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/products/ProductCard";
import { apiRequest } from "../utils/api";
import { waLink, getFullImageUrl, displayStorePhone } from "../utils/whatsapp";
import { catalogProductId } from "../utils/productId";
import { Cedis, formatCedis } from "../utils/currency";
import Seo from "../components/seo/Seo";
import { SITE_NAME, SITE_URL, absoluteUrl } from "../utils/site";

const ProductDetailPage = ({ products = [], addOrder, settings = {} }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount, setIsCartOpen, cartPulse } = useCart();

  const product = products.find((p) => (p._id || p.id) === id);

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("whatsapp"); // 'whatsapp' | 'paystack'
  const [orderForm, setOrderForm] = useState({ customer: "", phone: "", smsPhone: "", email: "", location: "", country: "Ghana", deliveryMethod: "Home Delivery", street: "", city: "", region: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setQty(1);
      setSize(product.sizes?.[0] || "");
      const firstColor = product.colors?.[0];
      setColor(firstColor ? (typeof firstColor === "object" ? firstColor.name : firstColor) : "");
    }
  }, [id]);

  if (!products.length) {
    return (
      <div className="section-padding container" style={{ minHeight: "60vh" }}></div>
    );
  }

  if (!product) {
    return (
      <div className="section-padding container center-text" style={{ minHeight: "60vh" }}>
        <Seo title="Product not found" path={`/product/${id}`} noindex description="This WELAMA product is no longer available." />
        <h2 className="serif">Product Not Found</h2>
        <p style={{ color: "#666", margin: "1rem 0 2rem" }}>
          This item may have sold out or been removed.
        </p>
        <Link to="/shop" className="cta-button-premium" style={{ display: "inline-flex" }}>
          <span>Back To Shop</span>
        </Link>
      </div>
    );
  }

  const { name, price, discountPrice, badge, image, sizes, colors, stock, sku, category, description } = product;
  const isSoldOut = product.status === "Sold Out" || stock === 0 || !!product.soldOutAt;
  const currentPrice = discountPrice || price;
  const resolvedImage = image && !image.startsWith("blob:") ? image : "/welamalogo.png";
  const productUrl = `/product/${id}`;
  const productImage = absoluteUrl(resolvedImage);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: [productImage],
    description: description || `${name} from WELAMA, Accra Ghana.`,
    sku: sku || undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: category || "Women's clothing",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${productUrl}`,
      priceCurrency: "GHS",
      price: String(currentPrice || price || 0),
      availability: isSoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  const handleAddToCart = () => {
    addToCart(product, size, color, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleOrderViaWhatsApp = async (e) => {
    e.preventDefault();
    if (!orderForm.customer.trim() || !orderForm.phone.trim() || !orderForm.smsPhone.trim()) {
      Swal.fire("Almost there", "Please fill in your name, WhatsApp number and SMS number first.", "info");
      return;
    }

    setIsSubmitting(true);

    const itemName = `${name}${color ? ` (${color})` : ""}`;
    const total = currentPrice * qty;

    const orderData = {
      customer: orderForm.customer,
      phone: orderForm.phone,
      smsPhone: orderForm.smsPhone,
      location: [orderForm.street, orderForm.city, orderForm.region, orderForm.country || "Ghana"].filter(Boolean).join(", "),
      items: [{ productId: catalogProductId(product._id || product.id), name: itemName, image: resolvedImage, category, qty, size: size || "Standard", color: color || "" }],
      total,
      paymentMethod: "Direct WhatsApp Order",
      status: "Pending",
    };

    const res = await addOrder(orderData);
    setIsSubmitting(false);

    if (res?.success) {
      const order = res.data;
      const deliveryLine = orderForm.deliveryMethod === "Pickup"
        ? "🏪 Pickup"
        : `🏠 Home Delivery\n📍 ${[orderForm.street, orderForm.city, orderForm.region, orderForm.country || "Ghana"].filter(Boolean).join(", ")}`;
      const imgUrl = getFullImageUrl(resolvedImage);
      const whatsappMessage = `Hi WELAMA! I'd like to order:\n\n🛍️ *${name}*${sku ? ` (SKU: ${sku})` : ""}${color ? `\n🎨 Color: ${color}` : ""}\n📏 Size: ${size || "Standard"}\n🔢 Quantity: ${qty}\n💰 Total: ${formatCedis(total)}\n🖼️ Image: ${imgUrl}\n\n*Order ID:* ${order.orderId}\n👤 Name: ${orderForm.customer}\n📞 WhatsApp: ${orderForm.phone}\n📱 SMS Number: ${orderForm.smsPhone}\n${deliveryLine}\n\nPlease confirm availability. Thank you! 🙏`;

      window.open(waLink(whatsappMessage), "_blank");
      setOrderForm({ customer: "", phone: "", smsPhone: "", location: "", country: "Ghana", deliveryMethod: "Home Delivery", street: "", city: "", region: "" });

      const trackingUrl = `/track?orderId=${encodeURIComponent(order.orderId)}&phone=${encodeURIComponent(orderForm.smsPhone || orderForm.phone)}`;

      Swal.fire({
        title: "Order Placed Successfully! 🎉",
        html: `
          <div style="font-family: inherit; padding: 0.5rem 0;">
            <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 1rem;">
              Thank you, <strong>${orderForm.customer}</strong>! Your order has been registered.
            </p>
            <div style="background: #f8fafc; border: 2px dashed #0A0A0A; border-radius: 14px; padding: 1rem; margin-bottom: 1.25rem;">
              <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Your Order ID</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: #0A0A0A; letter-spacing: 1px; margin-top: 4px;">${order.orderId}</div>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.5rem;">
              📱 We sent an <strong>SMS with your Order ID & tracking link</strong> to <strong>${orderForm.smsPhone}</strong>.
            </p>
          </div>
        `,
        icon: "success",
        confirmButtonColor: "#0A0A0A",
        confirmButtonText: "Track My Order 🚀",
        showCancelButton: true,
        cancelButtonText: "Close",
        cancelButtonColor: "#64748b",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(trackingUrl);
        }
      });
    } else {
      Swal.fire("Error", res?.message || "Could not submit your order. Please try again.", "error");
    }
  };

  const handlePaystack = async (e) => {
    e.preventDefault();
    if (!orderForm.customer.trim() || !orderForm.phone.trim() || !orderForm.smsPhone.trim() || !orderForm.email.trim()) {
      Swal.fire("Almost there", "Please fill in your name, WhatsApp number, SMS number, and email before paying.", "info");
      return;
    }
    if (settings.paystackEnabled === false) {
      Swal.fire("Paystack unavailable", "Online card payments are turned off right now. Please order via WhatsApp.", "info");
      return;
    }

    const total = currentPrice * qty;
    const itemName = `${name}${color ? ` (${color})` : ""}`;
    setIsSubmitting(true);

    const orderData = {
      customer: orderForm.customer,
      phone: orderForm.phone,
      smsPhone: orderForm.smsPhone,
      location: [orderForm.street, orderForm.city, orderForm.region, orderForm.country || "Ghana"].filter(Boolean).join(", "),
      items: [{ productId: catalogProductId(product._id || product.id), name: itemName, image: resolvedImage, category, qty, size: size || "Standard", color: color || "" }],
      total,
      paymentMethod: "Paystack (Online)",
      payment: "Unpaid",
      status: "Processing",
    };

    const orderRes = await addOrder(orderData);
    if (!orderRes?.success || !orderRes.data?.orderId) {
      setIsSubmitting(false);
      Swal.fire("Error", orderRes?.message || "Could not create your order. Please try again.", "error");
      return;
    }

    const paystackRes = await apiRequest("/payment/paystack/initialize", "POST", {
      orderId: orderRes.data.orderId,
      amount: total,
      customerEmail: orderForm.email,
      customerName: orderForm.customer,
      customerPhone: orderForm.phone,
    }, 28000);

    if (paystackRes.success && paystackRes.data?.authorization_url) {
      window.location.href = paystackRes.data.authorization_url;
      return;
    }

    setIsSubmitting(false);
    Swal.fire("Payment Notice", paystackRes.message || "Could not start Paystack checkout.", "warning");
  };

  const related = products
    .filter((p) => (p._id || p.id) !== (product._id || product.id))
    .filter((p) => !category || p.category === category)
    .slice(0, 4);

  return (
    <div className="product-detail-page section-padding container">
      <Seo
        title={`${name} | WELAMA`}
        description={
          description ||
          `Buy ${name} from WELAMA in Ghana.${category ? ` Shop ${category} at the official WELAMA store.` : ""}`
        }
        path={productUrl}
        image={productImage}
        jsonLd={productJsonLd}
      />
      <div className="app-pdp-topbar mobile-only">
        <button type="button" className="app-pdp-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <h2>Details</h2>
        <div className="app-pdp-top-actions">
          <button type="button" className="app-pdp-icon-btn" onClick={() => navigate("/track")} aria-label="Track order">
            <PackageSearch size={18} />
          </button>
          <button
            type="button"
            className={`app-pdp-icon-btn ${cartPulse ? "cart-pulse" : ""}`}
            data-cart-fly-target
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="app-pdp-cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>

      <div className="product-detail-layout">
        <div className="product-detail-pin">
          <button className="product-detail-back" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} /> Back
          </button>

          <div className="product-detail-gallery">
            <div className="product-detail-heading">
              <h1 className="serif product-detail-title">{name}</h1>
              {sku && <p className="product-detail-sku">{sku}</p>}

              <p className="product-detail-price">
                {discountPrice && <span className="product-price-was"><Cedis value={price} /></span>}
                <span className={discountPrice ? "product-price-sale" : "product-price-current"}>
                  <Cedis value={currentPrice} />
                </span>
              </p>
            </div>

            <div className="product-detail-main-image">
              <img src={resolvedImage} alt={`${name} — WELAMA`} />
              {badge && !isSoldOut && <div className="product-detail-badge">{badge}</div>}
              {isSoldOut && (
                <div className="product-detail-badge" style={{ background: "#ef4444", color: "white" }}>
                  SOLD OUT
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="product-detail-info">
          <div className="app-pdp-meta mobile-only">
            <p className="app-pdp-category">{category || "WELAMA"}</p>
            <h1 className="app-pdp-title">{name}</h1>
            <div className="app-pdp-store">
              <img src={settings?.logoUrl || "/welamalogo.png"} alt="WELAMA" />
              <div>
                <strong>WELAMA</strong>
                <span>Official store · Concierge</span>
              </div>
              <a className="app-pdp-contact" href={`tel:${displayStorePhone(settings?.contactPhone)}`}>Call</a>
            </div>
            {description && (
              <div className="app-pdp-desc">
                <h3>Description</h3>
                <p>{description}</p>
              </div>
            )}
          </div>

          {colors && colors.length > 0 && (
            <div className="product-detail-option-group">
              <span className="product-detail-option-label">
                Color{color ? `: ${color}` : ""}
              </span>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {colors.map((c, i) => {
                  const cName = typeof c === "object" ? c.name : c;
                  const cHex = typeof c === "object" ? c.hex : c;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setColor(cName)}
                      title={cName}
                      className={`product-detail-swatch ${color === cName ? "active" : ""}`}
                      style={{ backgroundColor: cHex }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {!isSoldOut && typeof stock === "number" && stock > 0 && stock <= 5 && (
            <p className="product-stock-hint" style={{ fontSize: "0.85rem" }}>
              Only {stock} left in stock
            </p>
          )}

          {sizes && sizes.length > 0 && (
            <div className="product-detail-option-group">
              <span className="product-detail-option-label">Select Size</span>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {sizes.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`size-chip-premium ${size === s ? "active" : ""}`}
                    onClick={() => setSize(s)}
                    style={{
                      cursor: "pointer",
                      border: size === s ? "1px solid #0A0A0A" : "1px solid #e2e8f0",
                      background: size === s ? "#0A0A0A" : "#f8fafc",
                      color: size === s ? "white" : "#0A0A0A",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-detail-option-group">
            <span className="product-detail-option-label">Quantity</span>
            <div className="product-detail-qty-controls" style={{ justifyContent: "flex-start" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="product-detail-qty-btn">
                <Minus size={18} />
              </button>
              <span className="product-detail-qty-num">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="product-detail-qty-btn">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <button
            className="cta-button-premium desktop-add-to-cart"
            disabled={isSoldOut}
            onClick={handleAddToCart}
            style={{ width: "60%", minWidth: "220px", justifyContent: "center", opacity: isSoldOut ? 0.5 : 1, cursor: isSoldOut ? "not-allowed" : "pointer", marginBottom: "1.75rem" }}
          >
            {justAdded ? (
              <>
                <CheckCircle size={18} /> <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> <span>{isSoldOut ? "Sold Out" : "Add to Cart"}</span>
              </>
            )}
          </button>

          {!isSoldOut && (
            <div className="order-details-inline">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <h3 className="serif" style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Delivery / Pickup
                </h3>
              </div>
              <p style={{ color: "var(--teal-primary)", fontSize: "0.78rem", marginBottom: "1rem" }}>
                Fill in your details below and choose how you'd like to pay.
              </p>

              {/* ── PAYMENT METHOD TOGGLE ── */}
              <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "2px solid #e2e8f0", marginBottom: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("whatsapp")}
                  style={{
                    flex: 1, padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.75rem",
                    textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                    background: paymentMethod === "whatsapp" ? "#25D366" : "#f8fafc",
                    color: paymentMethod === "whatsapp" ? "white" : "#666",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
                  }}
                >
                  <span>💬</span> WhatsApp Order
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paystack")}
                  style={{
                    flex: 1, padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.75rem",
                    textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                    background: paymentMethod === "paystack" ? "#0BA4DB" : "#f8fafc",
                    color: paymentMethod === "paystack" ? "white" : "#666",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
                  }}
                >
                  <span>💳</span> Pay with Paystack
                </button>
              </div>

              <form onSubmit={paymentMethod === "paystack" ? handlePaystack : handleOrderViaWhatsApp} className="review-form order-form">
                <div className="order-form-row">
                  <div className="review-form-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={orderForm.customer}
                      onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
                      placeholder="e.g. Ama Serwaa"
                    />
                  </div>

                  <div className="review-form-group" style={{ marginBottom: 0 }}>
                    <label>Phone (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      placeholder="e.g. 0244374433"
                    />
                  </div>
                </div>

                <div className="order-form-row">
                  <div className="review-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      📱 SMS Number
                      <span style={{ fontSize: "0.65rem", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>TRACKING</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={orderForm.smsPhone}
                      onChange={(e) => setOrderForm({ ...orderForm, smsPhone: e.target.value })}
                      placeholder="e.g. 0244123456"
                    />
                  </div>

                  <div className="review-form-group" style={{ marginBottom: 0 }}>
                    <label>Country</label>
                    <select
                      value={orderForm.country || "Ghana"}
                      onChange={(e) => setOrderForm({ ...orderForm, country: e.target.value })}
                      style={{ width: "100%", padding: "0.8rem 1rem", border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: "8px", fontSize: "0.95rem", background: "var(--white)", color: "#1a1a1a", cursor: "pointer" }}
                    >
                      <option>Ghana</option>
                      <option>Nigeria</option>
                      <option>Togo</option>
                      <option>Ivory Coast</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#666", margin: "-0.6rem 0 0" }}>
                  We'll send you an SMS with your tracking link when your order is confirmed.
                </p>

                {/* Email — only shown for Paystack */}
                {paymentMethod === "paystack" && (
                  <div className="review-form-group">
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      📧 Email Address
                      <span style={{ fontSize: "0.65rem", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>REQUIRED FOR PAYSTACK</span>
                    </label>
                    <input
                      type="email"
                      required={paymentMethod === "paystack"}
                      value={orderForm.email}
                      onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                      placeholder="e.g. ama@gmail.com"
                    />
                  </div>
                )}

                <div className="review-form-group">
                  <label>How do you want to receive your order?</label>
                  <div style={{ display: "flex", gap: "0", borderRadius: "6px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <button
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, deliveryMethod: "Home Delivery" })}
                      style={{
                        flex: 1, padding: "0.7rem 1rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                        background: (!orderForm.deliveryMethod || orderForm.deliveryMethod === "Home Delivery") ? "#0A0A0A" : "#f8fafc",
                        color: (!orderForm.deliveryMethod || orderForm.deliveryMethod === "Home Delivery") ? "white" : "#666",
                        transition: "all 0.2s"
                      }}
                    >
                      Home Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, deliveryMethod: "Pickup" })}
                      style={{
                        flex: 1, padding: "0.7rem 1rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                        background: orderForm.deliveryMethod === "Pickup" ? "#0A0A0A" : "#f8fafc",
                        color: orderForm.deliveryMethod === "Pickup" ? "white" : "#666",
                        transition: "all 0.2s"
                      }}
                    >
                      Pickup
                    </button>
                  </div>
                </div>

                {(!orderForm.deliveryMethod || orderForm.deliveryMethod === "Home Delivery") && (
                  <>
                    <div className="review-form-group">
                      <label>Street / Area</label>
                      <input
                        type="text"
                        required
                        value={orderForm.street || ""}
                        onChange={(e) => setOrderForm({ ...orderForm, street: e.target.value })}
                        placeholder="e.g. 5 Adenta Road"
                      />
                    </div>
                    <div className="order-form-row">
                      <div className="review-form-group" style={{ marginBottom: 0 }}>
                        <label>City</label>
                        <input
                          type="text"
                          required
                          value={orderForm.city || ""}
                          onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                          placeholder="e.g. Accra"
                        />
                      </div>
                      <div className="review-form-group" style={{ marginBottom: 0 }}>
                        <label>Region / State</label>
                        <input
                          type="text"
                          value={orderForm.region || ""}
                          onChange={(e) => setOrderForm({ ...orderForm, region: e.target.value })}
                          placeholder="e.g. Greater Accra"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ── SUBMIT BUTTONS ── */}
                {paymentMethod === "whatsapp" ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "0.6rem", marginTop: "1.25rem", padding: "0.95rem",
                      background: isSubmitting ? "#aaa" : "#25D366",
                      color: "white", border: "none", borderRadius: "8px", fontWeight: 700,
                      fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      boxShadow: isSubmitting ? "none" : "0 4px 15px rgba(37, 211, 102, 0.35)",
                      transition: "all 0.2s",
                    }}
                  >
                    <MessageCircle size={18} /> <span>{isSubmitting ? "Preparing..." : "Send Order On WhatsApp"}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "0.6rem", marginTop: "1.25rem", padding: "0.95rem",
                      background: isSubmitting ? "#aaa" : "#0BA4DB",
                      color: "white", border: "none", borderRadius: "8px", fontWeight: 700,
                      fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(11,164,219,0.35)",
                      transition: "all 0.2s",
                    }}
                  >
                    <span>💳</span>
                    <span>{isSubmitting ? "Processing..." : <>Pay <Cedis value={(discountPrice || price) * qty} /> with Paystack</>}</span>
                  </button>
                )}
              </form>
            </div>
          )}

          {/* RELATED PRODUCTS NOW SCROLL IN THE RIGHT COLUMN */}
          {related.length > 0 && (
            <div className="product-detail-related" style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 className="serif" style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>
                You May Also Like
              </h3>
              <div className="product-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
                {related.map((p, i) => (
                  <ProductCard key={p._id || p.id} {...p} id={p._id || p.id} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="app-pdp-bar mobile-only">
        <div className="app-pdp-bar-price">
          <span>Total price</span>
          <strong><Cedis value={currentPrice * qty} /></strong>
        </div>
        <button
          className="app-pdp-add"
          disabled={isSoldOut}
          onClick={handleAddToCart}
        >
          {justAdded ? <CheckCircle size={18} /> : <ShoppingBag size={18} />}
          <span>{isSoldOut ? "Sold Out" : justAdded ? "Added" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
