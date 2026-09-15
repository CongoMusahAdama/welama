import React, { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { DEFAULT_BRANDS } from "../data/defaultBrands";

const BrandsPage = () => {
  const [brands, setBrands] = useState(DEFAULT_BRANDS);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    const load = async () => {
      const data = await apiRequest("/brands", "GET", null, 8000);
      if (!cancelled && data?.success && Array.isArray(data.data)) {
        setBrands(data.data);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="brands-page">
      <section className="section-padding container">
        <div className="brands-page-header">
          <h1 className="serif">Premium Brands</h1>
          <p>The labels we carry — curated clothing and bags you can shop in store and online.</p>
        </div>
        {brands.length === 0 ? (
          <p style={{ color: "#666" }}>No brands listed yet.</p>
        ) : (
        <div className="brands-page-grid">
          {brands.map((brand) => (
            <article key={brand._id || brand.name} className="brand-tile">
              <img src={brand.logoUrl || brand.src} alt={brand.name} />
              <span>{brand.name}</span>
            </article>
          ))}
        </div>
        )}
      </section>
    </div>
  );
};

export default BrandsPage;
