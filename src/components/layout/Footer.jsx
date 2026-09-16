import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, MessageCircle, Mail, Instagram, Facebook, Ghost, ArrowRight } from "lucide-react";
import { STORE_PHONE, displayStorePhone, waLink } from "../../utils/whatsapp";

const Footer = ({ settings }) => {
  const location = useLocation();
  if (location.pathname === "/auth" || location.pathname.startsWith("/admin"))
    return null;

  const isHome = location.pathname === "/home";

  const logoUrl = settings?.logoUrl || "/welamalogo.png";
  const storePhone = displayStorePhone(settings?.contactPhone);

  return (
    <footer className={`footer${isHome ? "" : " footer-mobile-hidden"}`}>
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="/" className="logo footer-logo">
              <img
                src={logoUrl}
                alt={settings?.siteName || "WELAMA"}
                className="footer-logo-img"
              />
            </a>
            <p className="footer-desc">
              {settings?.tagline || "Elegance redefined."} WELAMA crafts premium clothing and bags
              for the woman who moves through the world with quiet confidence.
            </p>
            <div className="flex flex-col gap-3" style={{ marginTop: "1rem" }}>
              <div className="flex items-center gap-3 footer-desc">
                <Phone size={16} className="text-teal" />
                <span>{storePhone}</span>
              </div>
              <div className="flex items-center gap-3 footer-desc">
                <MessageCircle size={16} className="text-teal" />
                <span>{storePhone} (WhatsApp/Call)</span>
              </div>
              <div className="flex items-center gap-3 footer-desc">
                <Mail size={16} className="text-teal" />
                <span style={{ fontSize: "0.85rem" }}>
                  {settings?.contactEmail || "info@welama.com"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              <li>
                <Link to="/shop?q=Shirts">Shirts</Link>
              </li>
              <li>
                <Link to="/shop?q=Dresses">Dresses</Link>
              </li>
              <li>
                <Link to="/shop?q=Two-piece">Two-piece</Link>
              </li>
              <li>
                <Link to="/shop?q=Bags">Bags</Link>
              </li>
              <li style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #333" }}>
                <Link to="/track" style={{ color: "#C9A227", fontWeight: 700 }}>Track Order</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Connect With Us</h4>
            <ul className="footer-links">
              <li>
                <a href="https://www.instagram.com/shop.welama" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <Instagram size={16} /> @shop.welama
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@shop.welama" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <span style={{ fontWeight: 800 }}>T</span> @shop.welama
                </a>
              </li>
              <li>
                <a href={waLink()} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <MessageCircle size={16} /> {STORE_PHONE}
                </a>
              </li>
              <li>
                <a href={`tel:${STORE_PHONE}`} className="flex items-center gap-2">
                  <Phone size={16} /> {STORE_PHONE}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4 className="footer-heading">Newsletter</h4>
            <p className="footer-desc" style={{ marginBottom: "1rem" }}>
              Join the WELAMA circle. Get exclusive access to new drops.
            </p>
            <div className="flex">
              <input
                type="text"
                placeholder="YOUR EMAIL"
                style={{
                  padding: "0.8rem",
                  background: "#222",
                  border: "none",
                  color: "white",
                  width: "100%",
                }}
              />
              <button
                className="bg-teal"
                style={{ padding: "0 1rem", color: "white" }}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 WELAMA. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
