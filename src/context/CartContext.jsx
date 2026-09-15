import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "../components/ui/Toast";
import CartDrawer from "../components/cart/CartDrawer";

const CartContext = createContext(null);

let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };
  }, { passive: true });
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [flyItem, setFlyItem] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);

  const addToast = (name) => {
    setToast(name);
    setTimeout(() => setToast(null), 2200);
  };

  const addToCart = (product, selectedSize, selectedColor) => {
    setCartItems((prev) => {
      const parts = [product._id || product.id];
      if (selectedSize) parts.push(selectedSize);
      if (selectedColor) parts.push(typeof selectedColor === "object" ? selectedColor.name : selectedColor);
      const cartId = parts.join("-");
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing)
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i,
        );
      return [
        ...prev,
        {
          ...product,
          cartId,
          selectedSize: selectedSize || "",
          selectedColor: selectedColor ? (typeof selectedColor === "object" ? selectedColor.name : selectedColor) : "",
          qty: 1,
        },
      ];
    });

    const cartEl = document.getElementById("nav-cart-target");
    const dest = cartEl?.getBoundingClientRect();
    setFlyItem({
      key: Date.now(),
      src: product.image,
      startX: lastPointer.x,
      startY: lastPointer.y,
      endX: dest ? dest.left + dest.width / 2 : window.innerWidth - 48,
      endY: dest ? dest.top + dest.height / 2 : 28,
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
      prev.map((i) =>
        i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.qty,
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

