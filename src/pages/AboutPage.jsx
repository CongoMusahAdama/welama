import React, { useEffect } from "react";
import { Shield, Globe, Award, Phone, MessageCircle, Instagram, Facebook, Ghost } from "lucide-react";
import { STORE_PHONE, waLink } from "../utils/whatsapp";

const AboutPage = () => {
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
    <div className="about-page">
      <section className="about-hero">
        <div className="container center-text reveal">
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.5em",
              fontSize: "0.9rem",
            }}
          >
            WELAMA
          </span>
          <h1 className="serif page-hero-heading" style={{ marginTop: "1rem" }}>
            About WELAMA
          </h1>
        </div>
      </section>

      <section className="section-padding container">
        <div className="about-story-grid">
          <div className="reveal">
            <span
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                fontSize: "0.8rem",
                color: "#0A0A0A",
              }}
            >
              Established 2025
            </span>
            <h2
              className="serif"
              style={{
                fontSize: "3.5rem",
                marginTop: "1rem",
                marginBottom: "2rem",
              }}
            >
              A Legacy of Timeless Elegance.
            </h2>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#666",
                lineHeight: "1.8",
                marginBottom: "2rem",
              }}
            >
              WELAMA was born from a simple yet profound belief: that a
              woman's wardrobe should be as confident and considered as she
              is. For years, we have been curating clothing and bags that
              balance clean silhouettes with rich, tactile detail.
            </p>
            <p style={{ color: "#666", lineHeight: "1.8" }}>
              Our journey began with a small capsule collection, designed for
              women who value quality over noise. Today, we are proud to be a
              premier destination for those who seek pieces that feel as good
              as they look — refined, versatile, and unmistakably WELAMA.
            </p>
          </div>
          <div className="heritage-image-wrapper reveal">
            <img
              src="/heroframe2.png"
              alt="WELAMA Craftsmanship"
              style={{
                width: "100%",
                height: "600px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      </section>

      <section
        className="section-padding"
        style={{
          backgroundColor: "#0A0A0A",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="hair-pattern-overlay"></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div
            className="center-text reveal"
            style={{ textAlign: "center", marginBottom: "5rem" }}
          >
            <span
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                fontSize: "0.8rem",
                color: "#C9A227",
              }}
            >
              Our Philosophy
            </span>
            <h2
              className="serif"
              style={{ fontSize: "3.5rem", marginTop: "1rem", color: "white" }}
            >
              Values That Define Us
            </h2>
          </div>

          <div className="values-grid">
            <div
              className="value-card reveal"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <div className="value-icon" style={{ color: "#C9A227" }}>
                <Shield size={30} strokeWidth={1.5} />
              </div>
              <h4
                className="serif"
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "1.5rem",
                  color: "white",
                }}
              >
                Premium Craftsmanship
              </h4>
              <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.6" }}>
                We source only the finest fabrics and materials, from supple
                leathers to fluid, breathable textiles, ensuring every piece
                is built to last.
              </p>
            </div>

            <div
              className="value-card reveal"
              style={{
                transitionDelay: "0.2s",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <div className="value-icon" style={{ color: "#C9A227" }}>
                <Globe size={30} strokeWidth={1.5} />
              </div>
              <h4
                className="serif"
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "1.5rem",
                  color: "white",
                }}
              >
                Global Reach
              </h4>
              <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.6" }}>
                Our designs draw on a global sensibility, formulated to serve
                the modern woman's wardrobe wherever she calls home.
              </p>
            </div>

            <div
              className="value-card reveal"
              style={{
                transitionDelay: "0.4s",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <div className="value-icon" style={{ color: "#C9A227" }}>
                <Award size={30} strokeWidth={1.5} />
              </div>
              <h4
                className="serif"
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "1.5rem",
                  color: "white",
                }}
              >
                Customer Care
              </h4>
              <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.6" }}>
                WELAMA is a partner in your personal style journey. We provide
                personalized advice for every customer's unique taste.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="contact-luxury-section section-padding"
        style={{ backgroundColor: "#0A0A0A", color: "white" }}
      >
        <div className="hair-pattern-overlay"></div>
        <div className="container" style={{ position: "relative", zIndex: 5 }}>
          <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
            <div className="reveal" style={{ flex: 1 }}>
              <span
                className="text-yellow"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.4em",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                Get in Touch
              </span>
              <h2
                className="serif"
                style={{ fontSize: "4.5rem", marginTop: "1rem", lineHeight: 1 }}
              >
                Contact <br />
                WELAMA
              </h2>
            </div>
            <div className="reveal" style={{ flex: 1, paddingTop: "2.5rem" }}>
              <p
                style={{
                  fontSize: "1.25rem",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: "1.8",
                  maxWidth: "500px",
                }}
              >
                Whether you have a question about our collections, need
                personalized styling advice, or want to discuss a wholesale
                partnership, we are here to assist you.
              </p>
            </div>
          </div>

          <div className="contact-luxury-grid">
            <div className="contact-main-card reveal">
              <div className="contact-methods-stack">
                <div className="contact-premium-item">
                  <div className="icon-wrap">
                    <Phone size={24} />
                  </div>
                  <div className="text-wrap">
                    <label>Call & Direct Inquiries</label>
                    <a href={`tel:${STORE_PHONE}`}>{STORE_PHONE} (Customer Care)</a>
                  </div>
                </div>

                <div className="contact-premium-item">
                  <div
                    className="icon-wrap"
                    style={{ backgroundColor: "#0A0A0A" }}
                  >
                    <MessageCircle size={24} />
                  </div>
                  <div className="text-wrap">
                    <label>WhatsApp / Call</label>
                    <a href={waLink()}>{STORE_PHONE}</a>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="social-community-card reveal"
              style={{ transitionDelay: "0.2s" }}
            >
              <h3 className="serif" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Join Our Community</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>Follow our journey and share your style with us.</p>
              <div className="contact-social-pills">
                <a href="https://www.instagram.com/shop.welama" target="_blank" rel="noreferrer" className="social-pill">
                  <Instagram size={18} />
                  <span>@shop.welama</span>
                </a>
                <a href="https://www.tiktok.com/@shop.welama" target="_blank" rel="noreferrer" className="social-pill">
                  <span style={{ fontWeight: 800 }}>T</span>
                  <span>@shop.welama</span>
                </a>
                <a href={waLink()} target="_blank" rel="noreferrer" className="social-pill">
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
