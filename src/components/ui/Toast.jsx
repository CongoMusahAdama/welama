import React from "react";
import { CheckCircle, X } from "lucide-react";
import { useCart } from "../../context/CartContext";

const Toast = () => {
  const { toast, setToast, setIsCartOpen } = useCart();
  if (!toast) return null;

  return (
    <div
      className="cart-toast fade-in-up"
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
