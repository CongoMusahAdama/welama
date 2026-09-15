import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { apiRequest } from "../../utils/api";
import { DEFAULT_BRANDS } from "../../data/defaultBrands";

const TrustCarousel = () => {
  const [brands, setBrands] = useState(DEFAULT_BRANDS);

  useEffect(() => {
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

  if (!brands.length) return null;

  const track = [...brands, ...brands, ...brands, ...brands];
  return (
    <section id="premium-brands" className="brands-carousel-section">
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
        <div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0A0A0A", marginBottom: "0.2rem" }}>Premium Brands</h2>
          <p style={{ color: "#666", fontSize: "0.95rem" }}>Unveil the finest selection of high-end clothing and bags</p>
        </div>
        <Link to="/brands" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: "#0A0A0A", textDecoration: "none" }}>
          Show All Brands <ArrowRight size={14} />
        </Link>
      </div>

      <div className="trust-carousel">
        <div className="trust-carousel-track" style={{ padding: "1rem 0" }}>
          {track.map((brand, i) => (
            <span className="trust-carousel-item" key={`${brand._id || brand.name}-${i}`} style={{ display: "flex", alignItems: "center", padding: "0 3.5rem", borderRight: "none" }}>
              <img
                src={brand.logoUrl || brand.src}
                alt={brand.name}
                style={{
                  height: "58px",
                  maxWidth: "170px",
                  objectFit: "contain",
                  opacity: 0.9,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  imageRendering: "auto",
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = 1;
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = 0.9;
                  e.target.style.transform = "scale(1)";
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustCarousel;
