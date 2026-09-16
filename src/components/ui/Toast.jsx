import React, { useLayoutEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getVisibleCartIcon } from "../../utils/cartTarget";

const Toast = () => {
  const { toast, setToast, setIsCartOpen } = useCart();
  const [anchor, setAnchor] = useState(null);

  useLayoutEffect(() => {
    if (!toast) {
      setAnchor(null);
      return;
    }
    const cart = getVisibleCartIcon();
    const rect = cart?.getBoundingClientRect();
    if (!rect || rect.width < 8) {
      setAnchor({ top: 72, right: 12 });
      return;
    }
    setAnchor({
      top: Math.round(rect.bottom + 8),
      right: Math.max(8, Math.round(window.innerWidth - rect.right)),
    });
  }, [toast]);

  if (!toast || !anchor) return null;

  return (
    <div
      className="cart-toast fade-in-up"
      style={{ top: anchor.top, right: anchor.right, left: "auto", bottom: "auto" }}
      onClick={() => {
        setIsCartOpen(true);
        setToast(null);
      }}
    >
      <div className="toast-content">
        <div className="toast-icon">
          <CheckCircle size={18} />
        </div>
        <div className="toast-text">
          <p>
            <strong>{toast}</strong> added to bag
          </p>
          <button className="toast-view-link">View Bag</button>
        </div>
        <button
          className="toast-close"
          onClick={(e) => {
            e.stopPropagation();
            setToast(null);
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
