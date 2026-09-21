import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { isBuilderCatalogItem } from "../../utils/catalog";

const RecentlyViewed = () => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const loadRecent = () => {
      const data = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
        .filter((item) => !isBuilderCatalogItem(item));
      setRecent(data);
    };

    loadRecent();
    window.addEventListener("click", loadRecent);
    return () => window.removeEventListener("click", loadRecent);
  }, []);

  if (!recent.length) return null;

  return (
    <section className="section-padding recent-products-section">
      <div className="container">
        <div className="section-header reveal" style={{ marginBottom: "3rem" }}>
          <h2 className="serif" style={{ fontSize: "2.5rem" }}>Recently Viewed</h2>
          <p style={{ color: "#64748b" }}>Pick up where you left off in your style journey.</p>
        </div>

        <div
          className="product-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2.5rem"
          }}
        >
          {recent.map((product, index) => (
            <ProductCard key={product._id || product.id} {...product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
