import React, { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, MessageCircle, Instagram, CheckCircle } from "lucide-react";
import { useModal } from "../../context/ModalContext";
import { useCart } from "../../context/CartContext";
import ProductCard from "../products/ProductCard";
import { waLink } from "../../utils/whatsapp";
import { Cedis, formatCedis } from "../../utils/currency";

const ProductDetailModal = () => {
  const { selectedProduct, closeProduct, products } = useModal();
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (selectedProduct) {
      setQty(1);
      const availableSizes = selectedProduct.sizes || [];
      if (availableSizes.length > 0) {
        setSize(availableSizes[0]);
      } else {
        setSize("");
      }
      const availableColors = selectedProduct.colors || [];
      if (availableColors.length > 0) {
        const first = availableColors[0];
        setColor(typeof first === "object" ? first.name : first);
      } else {
        setColor("");
      }
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handleAdd = () => {
    const qtyNum = parseInt(qty) || 1;
    for (let i = 0; i < qtyNum; i++) {
      addToCart(selectedProduct, size, color);
    }

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      closeProduct();
    }, 800);
  };

  const {
    name,
    price,
    discountPrice,
    discountPercentage,
    badge,
    image,
    sizes,
    colors,
    stock,
    category,
  } = selectedProduct;

  const finalDiscountPrice =
    discountPrice ||
    (discountPercentage > 0
      ? (price * (1 - discountPercentage / 100)).toFixed(2)
      : null);

  const currentId = selectedProduct._id || selectedProduct.id;
  const relatedProducts = (products || [])
    .filter((p) => (p._id || p.id) !== currentId)
    .filter((p) => !category || p.category === category)
    .slice(0, 4);
  const fallbackRelated = relatedProducts.length > 0
    ? relatedProducts
    : (products || []).filter((p) => (p._id || p.id) !== currentId).slice(0, 4);

  return (
    <div className="product-modal-backdrop" onClick={closeProduct}>
      <div
        className="product-modal-window"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={closeProduct}>
          <X size={24} />
        </button>

        <div className="modal-scroll-area">
          <div className="modal-image-container">
            <img src={image} alt={name} />
            {badge && <div className="modal-badge">{badge}</div>}
          </div>

          <div className="modal-info">
            <h2 className="modal-title serif">{name}</h2>
            {selectedProduct.sku && (
              <p className="modal-sku" style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
                Product ID: {selectedProduct.sku}
              </p>
            )}
            <p className="modal-price" style={{ color: "#16a34a", fontWeight: "700" }}>
              {finalDiscountPrice ? (
                <>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "#94a3b8",
                      fontSize: "0.85em",
                      marginRight: "0.5rem",
                    }}
                  >
                    <Cedis value={price} />
                  </span>
                  <span style={{ color: "#ef4444" }}>
                    <Cedis value={finalDiscountPrice} />
                  </span>
                </>
              ) : (
                <Cedis value={price} />
              )}
            </p>

            {colors && colors.length > 0 && (
              <div className="modal-sizes-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Select Color</span>
                  {color && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A' }}>{color}</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {colors.map((c, i) => {
                    const cName = typeof c === "object" ? c.name : c;
                    const cHex = typeof c === "object" ? c.hex : c;
                    const isSelected = color === cName;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setColor(cName)}
                        title={cName}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.35rem 0.7rem',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #0A0A0A' : '1px solid #e2e8f0',
                          background: isSelected ? '#f8fafc' : '#ffffff',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 0 0 2px rgba(10,10,10,0.1)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            display: 'inline-block',
                            border: '1px solid rgba(0,0,0,0.2)',
                            backgroundColor: cHex,
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500, color: '#0A0A0A' }}>
                          {cName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {typeof stock === "number" && stock > 0 && stock <= 5 && (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginBottom: '1rem' }}>
                Only {stock} left in stock
              </p>
            )}

            {sizes && sizes.length > 0 && (
              <div className="modal-sizes-container">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Select Size</span>
                <div className="modal-size-row">
                  {sizes.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`size-chip-premium ${size === s ? "active" : ""}`}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-qty-selector">
              <span>Quantity</span>
              <div className="modal-qty-controls">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="modal-qty-btn"
                >
                  <Minus size={18} />
                </button>
                <span className="modal-qty-num">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="modal-qty-btn"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

              <div className="modal-actions">
                <button
                  className={`modal-add-btn ${justAdded ? "success" : ""}`}
                  onClick={handleAdd}
                >
                  {justAdded ? (
                    <>
                      <CheckCircle size={20} /> In Your Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} /> Add to Cart — <span style={{ color: "var(--yellow-accent)", fontWeight: "800" }}>{badge || "WELAMA"}</span>
                    </>
                  )}
                </button>

                <div className="modal-social-grid">
                  <a
                    href={waLink(`Hi WELAMA! I'm interested in ordering:
🛍️ *Product:* ${name}${selectedProduct.sku ? ` (ID: ${selectedProduct.sku})` : ''}${color ? `\n🎨 *Color:* ${color}` : ''}
📏 *Size:* ${size || 'Standard'}
🔢 *Quantity:* ${qty}
💰 *Price:* ${formatCedis(finalDiscountPrice || price)} each
🖼️ *Image:* ${window.location.origin}${image}

Can you help me?`)}
                    target="_blank"
                    rel="noreferrer"
                    className="modal-social-btn wa"
                  >
                    <MessageCircle size={20} /> WhatsApp
                  </a>
                  <a
                    href="https://www.instagram.com/shop.welama"
                    target="_blank"
                    rel="noreferrer"
                    className="modal-social-btn ig"
                  >
                    <Instagram size={20} /> Instagram
                  </a>
                </div>
              </div>
          </div>

          {fallbackRelated.length > 0 && (
            <div className="modal-related-section">
              <h3 className="serif" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
                You May Also Like
              </h3>
              <div className="modal-related-grid">
                {fallbackRelated.map((p, i) => (
                  <ProductCard key={p._id || p.id} {...p} id={p._id || p.id} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
