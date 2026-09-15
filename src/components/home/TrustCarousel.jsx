import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BRANDS = [
  { name: "Calvin Klein", src: "/calvinklein.png" },
  { name: "Chanel", src: "/channel.png" },
  { name: "Coach", src: "/coach.png" },
  { name: "Gucci", src: "/gucci.png" },
  { name: "H&M", src: "/handm.png" },
  { name: "Kate Spade", src: "/katespade.png" },
  { name: "Louis Vuitton", src: "/luisvuiton.png" },
  { name: "Michael Kors", src: "/micheal kors.png" },
  { name: "Zara", src: "/zara.png" },
];

const TrustCarousel = () => {
  const track = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];
  return (
    <section id="premium-brands" className="brands-carousel-section">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0A0A0A', marginBottom: '0.2rem' }}>Premium Brands</h2>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Unveil the finest selection of high-end clothing and bags</p>
        </div>
        <Link to="/brands" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>
          Show All Brands <ArrowRight size={14} />
        </Link>
      </div>

      <div className="trust-carousel">
        <div className="trust-carousel-track" style={{ padding: '1rem 0' }}>
          {track.map((brand, i) => (
            <span className="trust-carousel-item" key={i} style={{ display: 'flex', alignItems: 'center', padding: '0 3.5rem', borderRight: 'none' }}>
              <img
                src={brand.src}
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
