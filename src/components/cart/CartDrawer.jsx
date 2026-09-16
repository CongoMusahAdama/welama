import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, X, Send, Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { waLink, getFullImageUrl } from "../../utils/whatsapp";
import { Cedis, formatCedis } from "../../utils/currency";

const CartDrawer = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQty,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const buildOrderMessage = () => {
    if (cartItems.length === 0) return "";
    const lines = cartItems.map(
      (i) => {
        const spec = [i.selectedSize && `Size: ${i.selectedSize}`, i.selectedColor && `Color: ${i.selectedColor}`].filter(Boolean).join(", ");
        const imgUrl = getFullImageUrl(i.image);
        return `• *${i.name}*${i.sku ? ` [${i.sku}]` : ''} ${spec ? `(${spec}) ` : ""}x${i.qty} — ${formatCedis(parseFloat(i.price) * i.qty, 2)}\n  🖼️ Image: ${imgUrl}`;
      }
    );
    return `Hi WELAMA! I'd like to place an order:\n\n${lines.join("\n\n")}\n\n*Total: ${formatCedis(cartTotal, 2)}*\n\nPlease confirm my order. Thank you! 🙏`;
  };

  const msg = buildOrderMessage().replace(/GH₵/g, "GHS");
  const waUrl = waLink(msg);
  const fbUrl = `https://m.me/welama?ref=${encodeURIComponent("ORDER_CART")}`;
  const igUrl = `https://ig.me/m/welama`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(waUrl)}`;

  return (
    <>
      {isCartOpen && (
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)} />
      )}

      <div className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="cart-drawer-header">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} strokeWidth={1.5} />
            <h3 className="serif" style={{ margin: 0, fontSize: "1.4rem" }}>
              Your Order
            </h3>
            {cartCount > 0 && (
              <span className="cart-count-badge">{cartCount}</span>
            )}
          </div>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag
                size={56}
                strokeWidth={0.8}
                style={{ opacity: 0.2, marginBottom: "1.5rem" }}
              />
              <p style={{ opacity: 0.5, fontSize: "1rem" }}>
                Your cart is empty
              </p>
              <p
                style={{
                  opacity: 0.4,
                  fontSize: "0.85rem",
                  marginTop: "0.5rem",
                }}
              >
                Browse our collections and add items to order via WhatsApp,
                Facebook, or Instagram.
              </p>
            </div>
          ) : (
            <>
              <div className="cart-social-banner">
                <Send size={14} />
                <span>
                  Quick Social Checkout — <strong>No Account Needed!</strong>
                </span>
              </div>
              {cartItems.map((item) => (
                <div key={item.cartId} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '-2px', marginBottom: '4px' }}>
                      {item.selectedSize && (
                        <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
                          Size: <span style={{ color: '#0A0A0A' }}>{item.selectedSize}</span>
                        </p>
                      )}
                      {item.selectedColor && (
                        <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
                          Color: <span style={{ color: '#0A0A0A' }}>{item.selectedColor}</span>
                        </p>
                      )}
                    </div>
                    <p className="cart-item-price">
                      <Cedis value={item.price} decimals={2} />
                    </p>
                    <div className="cart-item-controls">
                      <button
                        className="qty-btn-sm"
                        onClick={() => updateQty(item.cartId, -1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-sm">{item.qty}</span>
                      <button
                        className="qty-btn-sm"
                        onClick={() => updateQty(item.cartId, 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <p className="cart-item-subtotal">
                      <Cedis value={parseFloat(item.price) * item.qty} decimals={2} />
                    </p>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">
                Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})
              </span>
              <span className="cart-total-price">
                <Cedis value={cartTotal} decimals={2} />
              </span>
            </div>

            <p className="cart-checkout-label">Send order directly to:</p>

            <div className="cart-checkout-btns">
              <Link
                to="/checkout"
                className="checkout-social-btn"
                style={{
                  background: "#0A0A0A",
                  color: "white",
                  border: "none",
                }}
                onClick={() => setIsCartOpen(false)}
              >
                <CheckCircle size={20} />
                <span>Secure Checkout</span>
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="checkout-social-btn checkout-whatsapp"
                onClick={() => setTimeout(clearCart, 1000)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>
              <a
                href={fbUrl}
                target="_blank"
                rel="noreferrer"
                className="checkout-social-btn checkout-facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
              <a
                href={igUrl}
                target="_blank"
                rel="noreferrer"
                className="checkout-social-btn checkout-instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>

            <div className="cart-qr-section">
              <div className="cart-qr-container">
                <img
                  src={qrImageUrl}
                  alt="WhatsApp Order QR"
                  className="cart-qr-img"
                  loading="lazy"
                />
              </div>
              <div className="cart-qr-text">
                <p className="qr-title">Scan to Order</p>
                <p className="qr-desc">
                  Scan this QR code to complete your purchase on WhatsApp
                  instantly.
                </p>
              </div>
            </div>

            <button className="cart-clear-btn" onClick={clearCart}>
              <Trash2 size={14} /> Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
