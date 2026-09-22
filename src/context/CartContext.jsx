import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "../components/ui/Toast";
import CartDrawer from "../components/cart/CartDrawer";
import { getVisibleCartIcon } from "../utils/cartTarget";
import { colorName, variantStock } from "../utils/productStock";
import { sellingPrice } from "../utils/sellingPrice";

const CartContext = createContext(null);

let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };
  }, { passive: true });
}

const CART_KEY = "welama_cart";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [flyItem, setFlyItem] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);

  const addToast = (name) => {
    setToast(name);
    setTimeout(() => setToast(null), 2200);
  };

  const addToCart = (product, selectedSize, selectedColor, qtyToAdd = 1) => {
    const addQty = Math.max(1, Number(qtyToAdd) || 1);
    const color = colorName(selectedColor);
    const available = variantStock(product, color, selectedSize);
    if (available <= 0) return;
    setCartItems((prev) => {
      const parts = [product._id || product.id];
      if (selectedSize) parts.push(selectedSize);
      if (color) parts.push(color);
      const cartId = parts.join("-");
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        const nextQty = Math.min(available, existing.qty + addQty);
        if (nextQty === existing.qty) return prev;
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, qty: nextQty } : i,
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartId,
          selectedSize: selectedSize || "",
          selectedColor: color,
          price: sellingPrice(product),
          qty: Math.min(available, addQty),
        },
      ];
    });

    const cartEl = getVisibleCartIcon() || document.getElementById("nav-cart-target");
    const dest = cartEl?.getBoundingClientRect();
    const destValid = dest && dest.width > 8 && dest.height > 8;
    setFlyItem({
      key: Date.now(),
      src: product.image,
      startX: lastPointer.x,
      startY: lastPointer.y,
      endX: destValid ? dest.left + dest.width / 2 : window.innerWidth - 28,
      endY: destValid ? dest.top + dest.height / 2 : 28,
    });
    addToast(product.name);
  };

  useEffect(() => {
    if (!flyItem) return undefined;
    const land = setTimeout(() => {
      setFlyItem(null);
      setCartPulse(true);
    }, 720);
    const unpulse = setTimeout(() => setCartPulse(false), 1200);
    return () => {
      clearTimeout(land);
      clearTimeout(unpulse);
    };
  }, [flyItem]);

  const removeFromCart = (cartId) =>
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));

  const updateQty = (cartId, delta) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.cartId !== cartId) return i;
        const available = variantStock(i, i.selectedColor, i.selectedSize);
        const next = Math.max(1, i.qty + delta);
        return { ...i, qty: Math.min(available || 1, next) };
      }),
    );
  };

  const clearCart = () => setCartItems([]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch {
      /* quota / private mode */
    }
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + sellingPrice(i) * i.qty,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        toast,
        setToast,
        cartPulse,
      }}
    >
      {children}
      {flyItem && (
        <img
          key={flyItem.key}
          src={flyItem.src}
          alt=""
          className="cart-fly-thumb"
          style={{
            left: flyItem.startX,
            top: flyItem.startY,
            "--fly-dx": `${flyItem.endX - flyItem.startX}px`,
            "--fly-dy": `${flyItem.endY - flyItem.startY}px`,
          }}
        />
      )}
      <Toast />
      <CartDrawer />
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

