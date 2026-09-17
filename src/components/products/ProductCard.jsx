import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { Cedis } from "../../utils/currency";

const ProductCard = ({
  id,
  _id,
  name,
  price,
  discountPrice,
  badge,
  image,
  status,
  stock,
  soldOutAt,
  sku,
  colors,
  index = 0,
}) => {
  const resolvedId = _id || id;
  const isSoldOut = status === "Sold Out" || stock === 0 || !!soldOutAt;
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const cartItem = cartItems.find((i) => (i._id || i.id) === resolvedId);
  const inCart = !!cartItem;
  const resolvedImage =
    image && !image.startsWith("blob:") ? image : "/welamalogo.png";
  const currentPrice = discountPrice || price;

  const addToRecentlyViewed = () => {
    const productObj = { 
      id: resolvedId, 
      _id: resolvedId, 
      name, 
      price, 
      discountPrice, 
      badge, 
      image: resolvedImage, 
      sku,
      colors,
      stock,
      status,
      soldOutAt,
    };
    const existing = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const filtered = existing.filter((p) => (p._id || p.id) !== resolvedId);
    const updated = [productObj, ...filtered].slice(0, 10);
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    addToRecentlyViewed();
    navigate(`/product/${resolvedId}`);
  };

  return (
    <div
      className="product-card reveal"
      onClick={handleSelect}
      style={{
        filter: isSoldOut ? "grayscale(100%)" : "none",
      }}
    >
      {sku && (
        <div className="product-sku-tag" style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.65rem',
          fontWeight: 700,
          color: '#0A0A0A',
          zIndex: 5,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {sku}
        </div>
      )}
      <div className="product-image-container">
        {isSoldOut ? (
          <div className="product-badge badge-soldout">
            SOLD OUT
          </div>
        ) : (
          <div className="product-badge-group">
            {badge && (
              <div className="product-badge badge-custom">
                {badge}
              </div>
            )}
            {discountPrice && (
              <div className="product-badge badge-sale">
                SALE
              </div>
            )}
          </div>
        )}
        {inCart && (
          <div className="product-in-cart-badge">
            <CheckCircle size={14} />
            <span>In Cart</span>
          </div>
        )}
        <img src={resolvedImage} alt={name} className="product-main-image" />
        <img
          src={resolvedImage}
          alt={name}
          className="product-hover-image"
        />
        {!isSoldOut && <span className="product-view-tag">View</span>}
      </div>
      <div className="product-details">
        <h4 className="product-name">{name}</h4>

        {colors && colors.length > 0 && (
          <div className="product-color-swatches">
            {colors.map((c, i) => (
              <span
                key={i}
                className="product-color-swatch"
                title={typeof c === "object" ? c.name : c}
                style={{ backgroundColor: typeof c === "object" ? c.hex : c }}
              />
            ))}
          </div>
        )}

        <p className="product-price">
          {discountPrice && (
            <span className="product-price-was"><Cedis value={price} /></span>
          )}
          <span className={discountPrice ? "product-price-sale" : "product-price-current"}>
            <Cedis value={currentPrice} />
          </span>
        </p>

        {!isSoldOut && typeof stock === "number" && stock > 0 && stock <= 5 && (
          <p className="product-stock-hint">Only {stock} left in stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
