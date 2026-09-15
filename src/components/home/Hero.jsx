import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TITLE_LINES = [
  { text: "Elegant.", italic: false },
  { text: "Effortless.", italic: false },
  { text: "Empowered.", italic: true },
];

const Hero = () => {
  const [typed, setTyped] = useState(["", "", ""]);
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;
    let line = 0;
    let char = 0;

    const typeNext = () => {
      if (cancelled) return;
      const full = TITLE_LINES[line].text;
      char += 1;
      const current = full.slice(0, char);
      const lineNow = line;
      setTyped((prev) => {
        const next = [...prev];
        next[lineNow] = current;
        return next;
      });

      if (char < full.length) {
        timer = setTimeout(typeNext, 85);
        return;
      }

      if (line < TITLE_LINES.length - 1) {
        timer = setTimeout(() => {
          line += 1;
          char = 0;
          typeNext();
        }, 280);
        return;
      }

      setShowRest(true);
      timer = setTimeout(() => {
        if (cancelled) return;
        line = 0;
        char = 0;
        setTyped(["", "", ""]);
        typeNext();
      }, 3200);
    };

    timer = setTimeout(typeNext, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="hero-split" aria-label="WELAMA hero">
      <div
        className="hero-split-bg"
        style={{ backgroundImage: "url('/hero.png')" }}
        role="img"
        aria-label="Woman carrying a collection of WELAMA handbags"
      />
      <div className="hero-split-overlay" />

      <div className="container hero-split-inner">
        <div className="hero-split-text">
          <h1 className="serif hero-split-title" aria-label="Elegant. Effortless. Empowered.">
            {TITLE_LINES.map((line, index) => {
              const content = typed[index];
              const word = line.italic ? <em>{content}</em> : content;
              return (
                <span className="hero-type-line" key={line.text}>
                  {word}
                </span>
              );
            })}
          </h1>
          <p className={`hero-split-subtitle ${showRest ? "hero-copy-in" : "hero-copy-wait"}`}>
            Curated corporate wears &amp; bags for the modern woman
          </p>
          <div className={`hero-actions ${showRest ? "hero-copy-in" : "hero-copy-wait"}`}>
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
