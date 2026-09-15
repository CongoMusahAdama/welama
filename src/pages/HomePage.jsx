import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Quote } from "lucide-react";
import Hero from "../components/home/Hero";
import TrustCarousel from "../components/home/TrustCarousel";
import ProductCard from "../components/products/ProductCard";

const HomePage = ({ products = [], categories = [] }) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categoryTabs = [
    { id: "all", label: "All Collections" },
    ...categories.map((c) =>
      typeof c === "object" ? c : { id: c.toLowerCase(), label: c },
    ),
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) =>
            entry.isIntersecting && entry.target.classList.add("active"),
        );
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory]);

  const filteredFeatured = products
    .filter((product) => {
      // Hide if sold out > 3 days ago
      const isSoldOut =
        product.status === "Sold Out" ||
        product.stock === 0 ||
        !!product.soldOutAt;
      if (isSoldOut && product.soldOutAt) {
        const soldDate = new Date(product.soldOutAt);
        const daysSoldOut = (new Date() - soldDate) / (1000 * 60 * 60 * 24);
        if (daysSoldOut > 3) return false;
      }

      // Filter by category
      if (
        activeCategory !== "all" &&
        product.category?.toLowerCase() !== activeCategory.toLowerCase()
      )
        return false;
      // Filter out products with broken blob URLs (blob URLs don't persist across sessions)
      const img = product.image || "";
      if (img.startsWith("blob:")) return false;
      return true;
    })
    // Sort: DB products with real images first (createdAt), then static
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 16);

  return (
    <>
      <Hero />
      <TrustCarousel />

      <section
        id="featured-pieces"
        className="section-padding"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="container">
          <div
            className="center-text reveal"
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            <h2 className="serif page-section-title" style={{ marginTop: "0.5rem" }}>
              Featured Pieces
            </h2>

            {/* Category Filter Tabs */}
            <div className="category-pills-container reveal">
              <div className="category-pills-scroll">
                {categoryTabs.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`category-pill-btn ${activeCategory === cat.id ? "active" : ""}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="product-grid">
            {filteredFeatured.map((product, index) => (
              <ProductCard
                key={product._id || product.id}
                {...product}
                id={product._id || product.id}
                index={index}
              />
            ))}
          </div>
          <div className="flex justify-center" style={{ marginTop: "5rem" }}>
            <Link to="/shop" className="cta-button-premium reveal">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>
      {/* Placeholder for Recently Viewed */}
      <section className="section-padding" style={{ backgroundColor: "#fff" }}>
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: "left", marginBottom: "2rem" }}>
            <h2 className="serif page-section-title page-section-title-sm">
              Recently Viewed
            </h2>
          </div>
          <div className="product-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
             {/* We will map over recently viewed items here */}
             <div style={{ padding: "2rem", background: "#fff", borderRadius: "8px", textAlign: "center", gridColumn: "1 / -1" }}>
               <p style={{ color: "#666" }}>Your recently viewed items will appear here.</p>
             </div>
          </div>
        </div>
      </section>

      <section id="our-story" className="section-padding container">
        <div className="grid home-story-grid">
          <div
            className="reveal shadow-light"
            style={{ padding: "1rem", backgroundColor: "#fff", borderRadius: "16px" }}
          >
            <img
              src="/heroframe3.png"
              alt="WELAMA Style"
              className="home-story-image"
            />
          </div>
          <div className="reveal">
            <h2 className="serif home-story-title">
              Elevate Your Wardrobe With WELAMA's Touch.
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#666",
                marginBottom: "2.5rem",
              }}
            >
              At WELAMA, we believe that what you wear is an extension of who
              you are. Our clothing and bags are crafted for those who demand
              quality materials, considered design, and effortless elegance
              in every outfit.
            </p>
            <Link
              to="/about"
              className="cta-button"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      <section id="customer-reviews" className="testimonial-section-new section-padding" style={{ padding: "8rem 0", overflow: "hidden" }}>
        <div className="container home-reviews-grid">
          {/* Left Column */}
          <div className="testimonial-left reveal">
            <h2 className="home-reviews-title">
              What Our<br/>Customers Says
            </h2>
          </div>

          {/* Right Column (Staggered Cards) */}
          <div className="testimonial-right reveal">
            <div className="testimonial-cards-container">
              {/* Card 1 — Ama Serwaa */}
              <div className="testimonial-card-new pos-1 shadow-light">
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face" alt="Ama Serwaa" className="avatar-img" />
                <div className="card-content">
                  <div className="card-header">
                    <h4>Ama Serwaa</h4>
                    <Quote className="quote-icon-small" size={24} fill="#e2e8f0" color="#e2e8f0" />
                  </div>
                  <p>The quality of the bags is outstanding. I get compliments everywhere I go. WELAMA is my go-to!</p>
                </div>
              </div>

              {/* Card 2 — Abena Osei */}
              <div className="testimonial-card-new pos-2 shadow-light border-left-accent">
                <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face" alt="Abena Osei" className="avatar-img" />
                <div className="card-content">
                  <div className="card-header">
                    <h4>Abena Osei</h4>
                    <Quote className="quote-icon-small" size={24} fill="#C9A227" color="#C9A227" />
                  </div>
                  <p>WELAMA transformed how I dress. The tailoring is exceptional — I feel confident and put-together every day.</p>
                </div>
              </div>

              {/* Card 3 — Efua Mensah */}
              <div className="testimonial-card-new pos-3 shadow-light">
                <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face" alt="Efua Mensah" className="avatar-img" />
                <div className="card-content">
                  <div className="card-header">
                    <h4>Efua Mensah</h4>
                    <Quote className="quote-icon-small" size={24} fill="#e2e8f0" color="#e2e8f0" />
                  </div>
                  <p>Every piece feels like it was made just for me. Exceptional quality and timeless African elegance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <style>{`
        .testimonial-cards-container {
          position: relative;
          height: 600px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-left: 2rem;
        }

        .testimonial-card-new {
          background: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          width: 90%;
          max-width: 500px;
          position: relative;
          transition: transform 0.3s ease;
        }
        
        .testimonial-card-new:hover {
          transform: translateY(-5px);
        }

        .shadow-light {
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.03);
        }

        .pos-1 {
          align-self: flex-end;
          margin-right: -2rem;
          margin-top: 1rem;
        }

        .pos-2 {
          align-self: flex-start;
          margin-left: -4rem;
          z-index: 2;
        }

        .pos-3 {
          align-self: flex-end;
          margin-right: 0rem;
        }

        .border-left-accent {
          position: relative;
        }
        .border-left-accent::before {
          content: "";
          position: absolute;
          left: -2px;
          top: 15%;
          bottom: 15%;
          width: 4px;
          background: #6366f1;
          border-radius: 4px;
        }

        .avatar-img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .card-content {
          flex: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .card-header h4 {
          font-weight: 700;
          font-size: 1.1rem;
          margin: 0;
          color: #1a1a1a;
        }

        .card-content p {
          font-size: 0.95rem;
          color: #737373;
          margin: 0;
          line-height: 1.5;
        }

        .gradient-btn-custom {
          background: #0A0A0A;
          color: white;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        .gradient-btn-custom:hover {
          opacity: 0.9;
        }
        
        @media (max-width: 900px) {
          .testimonial-section-new .container {
            grid-template-columns: 1fr !important;
            gap: 4rem !important;
          }
          .testimonial-cards-container {
            padding-left: 0;
            height: auto;
          }
          .pos-1, .pos-2, .pos-3 {
            align-self: center;
            margin: 0 !important;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;
