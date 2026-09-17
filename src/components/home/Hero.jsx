import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = ({ settings }) => {
  const TITLE_LINES = [
    { text: settings?.heroTitle1 || "Elegant.", italic: false },
    { text: settings?.heroTitle2 || "Effortless.", italic: false },
    { text: settings?.heroTitle3 || "Empowered.", italic: true },
  ];

  return (
    <section className="hero-split" aria-label="WELAMA hero">
      <div className="hero-split-bg">
        <img
          className="hero-split-photo"
          src={settings?.heroImageUrl || "/hero.png"}
          alt="Woman carrying a collection of WELAMA handbags"
        />
      </div>
      <div className="hero-split-overlay" />

      <div className="container hero-split-inner">
        <div className="hero-split-text">
          <span className="shop-hero-brand">WELAMA</span>
          <h1 className="serif hero-split-title" aria-label="WELAMA. Elegant. Effortless. Empowered.">
            {TITLE_LINES.map((line, index) => {
              const content = line.text;
              const word = line.italic ? <em>{content}</em> : content;
              return (
                <span className="hero-type-line hero-copy-in" key={index} style={{ animationDelay: `${0.2 + (index * 0.15)}s` }}>
                  {word}
                </span>
              );
            })}
          </h1>
          <p className="hero-split-subtitle hero-copy-in" style={{ animationDelay: "0.7s" }}>
            {settings?.heroSubtitle || "Curated corporate wears & bags for the modern woman"}
          </p>
          <div className="hero-actions hero-copy-in" style={{ animationDelay: "0.9s" }}>
            <Link to="/shop" className="cta-button-premium">
              <span>Shop Collection</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/collections" className="cta-button-outline">
              <span>Explore</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
