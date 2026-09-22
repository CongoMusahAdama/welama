import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, X, Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { Cedis } from "../../utils/currency";
import { variantStock } from "../../utils/productStock";
import { sellingPrice } from "../../utils/sellingPrice";

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
                Browse our collections and add items to checkout with Paystack.
              </p>
            </div>
          ) : (
            <>
              {cartItems.map((item) => {
                const available = variantStock(item, item.selectedColor, item.selectedSize);
                return (
                <div key={item.cartId} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "-2px", marginBottom: "4px" }}>
                      {item.selectedSize && (
                        <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
                          Size: <span style={{ color: "#0A0A0A" }}>{item.selectedSize}</span>
                        </p>
                      )}
                      {item.selectedColor && (
                        <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
                          Color: <span style={{ color: "#0A0A0A" }}>{item.selectedColor}</span>
                        </p>
                      )}
                    </div>
                    <p className="cart-item-price">
                      <Cedis value={sellingPrice(item)} decimals={2} />
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
                        disabled={item.qty >= available}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <p className="cart-item-subtotal">
                      <Cedis value={sellingPrice(item) * item.qty} decimals={2} />
                    </p>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
              })}
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

            <p className="cart-checkout-label">Pay securely with Paystack</p>

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
