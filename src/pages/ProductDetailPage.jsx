import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, CheckCircle, ChevronLeft, ShoppingCart, PackageSearch } from "lucide-react";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/products/ProductCard";
import ProductDescription from "../components/products/ProductDescription";
import { displayStorePhone } from "../utils/whatsapp";
import { Cedis } from "../utils/currency";
import { galleryThumbLabel, imageForColor, productGalleryImages } from "../utils/productImages";
import { colorAvailable, colorName, firstAvailableColor, firstAvailableSize, productFullySoldOut, sizeAvailable, variantStock } from "../utils/productStock";
import Seo from "../components/seo/Seo";
import { SITE_NAME, SITE_URL, absoluteUrl } from "../utils/site";

const ProductDetailPage = ({ products = [], settings = {} }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount, setIsCartOpen, cartPulse } = useCart();

  const product = products.find((p) => (p._id || p.id) === id);

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setQty(1);
      const firstColor = firstAvailableColor(product);
      setColor(firstColor);
      setSize(firstAvailableSize(product, firstColor));
    }
  }, [id, product?._id || product?.id]);

  const galleryImages = product ? productGalleryImages(product) : [];

  useEffect(() => {
    if (!product) return;
    const next = imageForColor(product, color || firstAvailableColor(product));
    if (next) setActiveImage(next);
  }, [id, product?._id || product?.id, color]);

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

  const { name, price, discountPrice, badge, sizes, colors, sku, category, description } = product;
  const isFullySoldOut = productFullySoldOut(product);
  const remaining = variantStock(product, color, size);
  const selectionSoldOut = remaining <= 0;
  const currentPrice = discountPrice || price;
  const resolvedImage = galleryImages.includes(activeImage)
    ? activeImage
    : imageForColor(product, color) || galleryImages[0];
  const productUrl = `/product/${id}`;
  const productImage = absoluteUrl(resolvedImage);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: galleryImages.map((src) => absoluteUrl(src)),
    description: description || `${name} from WELAMA, Accra Ghana.`,
    sku: sku || undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: category || "Women's clothing",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${productUrl}`,
      priceCurrency: "GHS",
      price: String(currentPrice || price || 0),
      availability: isFullySoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  const handleAddToCart = () => {
    if (selectionSoldOut) return;
    addToCart(product, size, color, Math.min(qty, remaining));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (selectionSoldOut) return;
    addToCart(product, size, color, Math.min(qty, remaining));
    setTimeout(() => navigate("/checkout"), 0);
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
            <div className="product-detail-stage">
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
              <img key={resolvedImage} src={resolvedImage} alt={`${name}${color ? ` — ${color}` : ""} — WELAMA`} />
              {badge && !isFullySoldOut && <div className="product-detail-badge">{badge}</div>}
              {isFullySoldOut && (
                <div className="product-detail-badge" style={{ background: "#ef4444", color: "white" }}>
                  SOLD OUT
                </div>
              )}
            </div>
            </div>
            {galleryImages.length > 1 && (
              <div className="product-detail-thumbs" role="tablist" aria-label="Product photos">
                {galleryImages.map((src, index) => {
                  const selected = src === resolvedImage;
                  return (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      className={`product-detail-thumb${selected ? " is-active" : ""}`}
                      onClick={() => setActiveImage(src)}
                      aria-pressed={selected}
                      aria-label={galleryThumbLabel(index, galleryImages.length)}
                    >
                      <img src={src} alt="" />
                      <span>{galleryThumbLabel(index, galleryImages.length)}</span>
                    </button>
                  );
                })}
              </div>
            )}
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
          </div>

          {colors && colors.length > 0 && (
            <div className="product-detail-option-group">
              <span className="product-detail-option-label">
                Color{color ? `: ${color}` : ""}
              </span>
              <div className="product-detail-color-row">
                {colors.map((c, i) => {
                  const cName = typeof c === "object" ? c.name : c;
                  const cHex = typeof c === "object" ? c.hex : c;
                  const available = colorAvailable(product, cName, size);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setColor(cName);
                        setSize(firstAvailableSize(product, cName));
                        setQty(1);
                        const next = imageForColor(product, cName);
                        if (next) setActiveImage(next);
                      }}
                      title={available ? cName : `${cName} — sold out`}
                      className={`product-detail-color-chip ${color === cName ? "active" : ""} ${!available ? "is-sold" : ""}`}
                    >
                      <span className="product-detail-swatch" style={{ backgroundColor: cHex }} />
                      <span className="product-detail-color-name">{cName}{!available ? " (sold out)" : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isFullySoldOut && remaining > 0 && remaining <= 5 && (
            <p className="product-stock-hint" style={{ fontSize: "0.85rem" }}>
              Only {remaining} left{color || size ? ` for this ${[color, size].filter(Boolean).join(" / ")}` : " in stock"}
            </p>
          )}
          {selectionSoldOut && !isFullySoldOut && (
            <p className="product-stock-hint" style={{ fontSize: "0.85rem", color: "#ef4444" }}>
              {[color, size].filter(Boolean).join(" / ") || "This option"} is sold out — pick another color or size.
            </p>
          )}

          {sizes && sizes.length > 0 && (
            <div className="product-detail-option-group">
              <span className="product-detail-option-label">
                Size{size ? `: ${size}` : ""}
              </span>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {sizes.map((s, idx) => {
                  const available = sizeAvailable(product, s, color);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`size-chip-premium ${size === s ? "active" : ""} ${!available ? "is-sold" : ""}`}
                      onClick={() => {
                        if (!available) return;
                        setSize(s);
                        setQty(1);
                      }}
                      disabled={!available}
                      title={available ? s : `${s} — sold out`}
                      style={{
                        cursor: available ? "pointer" : "not-allowed",
                        border: size === s ? "1px solid #0A0A0A" : "1px solid #e2e8f0",
                        background: size === s ? "#0A0A0A" : "#f8fafc",
                        color: size === s ? "white" : "#0A0A0A",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <ProductDescription text={description} />

          <div className="product-detail-option-group">
            <span className="product-detail-option-label">Quantity</span>
            <div className="product-detail-qty-controls" style={{ justifyContent: "flex-start" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="product-detail-qty-btn">
                <Minus size={18} />
              </button>
              <span className="product-detail-qty-num">{qty}</span>
              <button
                onClick={() => setQty(Math.min(Math.max(1, remaining), qty + 1))}
                className="product-detail-qty-btn"
                disabled={selectionSoldOut || qty >= remaining}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <button
            className="cta-button-premium desktop-add-to-cart"
            disabled={selectionSoldOut}
            onClick={handleAddToCart}
            style={{ width: "60%", minWidth: "220px", justifyContent: "center", opacity: selectionSoldOut ? 0.5 : 1, cursor: selectionSoldOut ? "not-allowed" : "pointer", marginBottom: "1.75rem" }}
          >
            {justAdded ? (
              <>
                <CheckCircle size={18} /> <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> <span>{selectionSoldOut ? "Sold Out" : "Add to Cart"}</span>
              </>
            )}
          </button>

          {!isFullySoldOut && !selectionSoldOut && (
            <div className="order-details-inline" style={{ marginBottom: "1.75rem" }}>
              <button
                type="button"
                className="cta-button-premium"
                onClick={handleBuyNow}
                style={{ width: "60%", minWidth: "220px", justifyContent: "center", background: "#111", borderColor: "#111" }}
              >
                Pay now — card or MoMo
              </button>
              <p style={{ margin: "0.65rem 0 0", color: "#64748b", fontSize: "0.82rem" }}>
                Card and mobile money, secured by Paystack.
              </p>
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
          disabled={selectionSoldOut}
          onClick={handleAddToCart}
        >
          {justAdded ? <CheckCircle size={18} /> : <ShoppingBag size={18} />}
          <span>{selectionSoldOut ? "Sold Out" : justAdded ? "Added" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
