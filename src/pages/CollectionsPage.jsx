import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const CollectionsPage = ({ settings }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
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
  }, []);

  return (
    <div className="collections-page">
      <section className="collections-hero">
        <div
          className="collections-hero-bg"
          style={{ backgroundImage: `url('${settings?.heroImageUrl || "/shophero.png"}')` }}
          role="img"
          aria-label="WELAMA collections"
        />
        <div className="collections-hero-overlay" />
        <div className="container center-text reveal">
          <span className="looks-hero-kicker">
            WELAMA
          </span>
          <h1 className="serif looks-hero-title">
            WELAMA Ranges
          </h1>
        </div>
      </section>

      <section className="section-padding container">
        <div className="looks-intro reveal">
          <div className="looks-intro-copy">
            <h2 className="serif">
              The Art of Dressing Well
            </h2>
            <p>
              Explore our curated selection of clothing and bags, where
              each piece tells a unique story of craftsmanship,
              versatility, and quiet luxury.
            </p>
          </div>
        </div>

        <div className="collections-main-grid">
          <div id="dresses" className="large-collection-card reveal">
            <img src="/WELAMA.png" alt="WELAMA Dresses Collection" />
            <div
              className="hero-overlay"
              style={{
                background: "rgba(0,0,0,0.18)",
              }}
            ></div>
            <div className="collection-overlay-content">
              <span className="collection-type">New Season</span>
              <h3 className="serif" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Dresses
              </h3>
              <p style={{ margin: "1rem 0 2rem", opacity: 0.8 }}>
                Fluid silhouettes and considered tailoring designed to move
                with you, day to night.
              </p>
              <Link
                to="/shop?category=Dresses"
                className="cta-button"
                style={{ display: "inline-block" }}
              >
                Explore Range
              </Link>
            </div>
          </div>

          <div id="bags" className="large-collection-card reveal">
            <img src="/bag10.png" alt="WELAMA Bags Collection" />
            <div
              className="hero-overlay"
              style={{
                background: "rgba(0,0,0,0.18)",
              }}
            ></div>
            <div className="collection-overlay-content">
              <span className="collection-type">Everyday Luxury</span>
              <h3 className="serif" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Bags
              </h3>
              <p style={{ margin: "1rem 0 2rem", opacity: 0.8 }}>
                Structured totes and clutches crafted from premium materials
                that carry you through every occasion.
              </p>
              <Link
                to="/shop?category=Bags"
                className="cta-button"
                style={{ display: "inline-block" }}
              >
                Explore Range
              </Link>
            </div>
          </div>

          <div
            id="signature"
            className="large-collection-card looks-featured reveal"
          >
            <img src="/heroframe.png" alt="WELAMA Signature Range" />
            <div
              className="hero-overlay"
              style={{
                background: "rgba(0,0,0,0.22)",
              }}
            ></div>
            <div
              className="collection-overlay-content"
              style={{ maxWidth: "600px" }}
            >
              <span className="collection-type">Signature Selection</span>
              <h3 className="serif" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
                WELAMA's Choice
              </h3>
              <p style={{ margin: "1rem 0 2rem", opacity: 0.8 }}>
                Our most exclusive pieces, featuring our flagship dresses, two-piece sets, and
                signature statement bags.
              </p>
              <Link to="/shop" className="cta-button-premium">
                Explore All Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage;
