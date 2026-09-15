import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Headset, X, Phone, MessageCircle, ArrowRight } from "lucide-react";

const SupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  if (location.pathname === "/auth" || location.pathname.startsWith("/admin"))
    return null;

  return (
    <div className={`support-bot-container ${isOpen ? "open" : ""}`}>
      {isOpen ? (
        <div className="support-window">
          <div className="support-header-premium">
            <div className="flex items-center gap-4">
              <div className="support-avatar-pulse">
                <Headset size={22} color="white" />
                <div className="online-indicator"></div>
              </div>
              <div>
                <h4
                  className="serif"
                  style={{
                    fontSize: "1.1rem",
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  WELAMA Support
                </h4>
                <p className="support-status">Online | Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="close-support-btn"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="support-body-premium">
            <div className="support-msg-bubble">
              <p>
                Hello! Welcome to WELAMA. How can we help you
                find your next favorite piece today?
              </p>
            </div>

            <div className="support-action-grid">
              <a href="tel:+233244374433" className="support-action-card">
                <div className="action-icon-circle tel-bg">
                  <Phone size={18} />
                </div>
                <div className="action-details">
                  <span>Call Us Direct</span>
                  <strong>+233 24 437 4433</strong>
                </div>
                <ArrowRight size={14} className="action-arrow" />
              </a>

              <a
                href="https://wa.me/233244374433"
                target="_blank"
                rel="noreferrer"
                className="support-action-card"
              >
                <div className="action-icon-circle wa-bg">
                  <MessageCircle size={18} />
                </div>
                <div className="action-details">
                  <span>WhatsApp / Chat</span>
                  <strong>+233 24 437 4433</strong>
                </div>
                <ArrowRight size={14} className="action-arrow" />
              </a>
            </div>
          </div>

          <div className="support-footer-premium">
            <a
              href="https://wa.me/233244374433"
              target="_blank"
              rel="noreferrer"
              className="whatsapp-sticky-btn"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <button
          className="support-launcher-premium gold-theme"
          onClick={() => setIsOpen(true)}
        >
          <div className="launcher-icon-gold">
            <Headset size={22} color="#ffffff" strokeWidth={1.8} />
            <span className="gold-online-dot"></span>
          </div>
          <div className="launcher-text-wrap">
            <span className="launcher-label-gold">Contact Support</span>
            <span className="launcher-sub-gold">Online 24/7</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default SupportBot;
