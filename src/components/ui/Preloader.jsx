import React from "react";
import { motion } from "framer-motion";

const COLLAGE = [
  { src: "/heroframe.png", alt: "WELAMA styled bags", rotate: -6 },
  { src: "/heroframe1.png", alt: "WELAMA bag collection", rotate: 5 },
  { src: "/heroframe3.png", alt: "WELAMA tailored fashion", rotate: 4 },
  { src: "/heroframe2.png", alt: "WELAMA everyday style", rotate: -4 },
];

const Preloader = () => {
  return (
    <motion.div
      className="app-preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="preloader-collage">
        {COLLAGE.map((item, i) => (
          <motion.div
            key={item.src}
            className="preloader-collage-frame"
            initial={{ opacity: 0, y: 12, scale: 0.96, rotate: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: item.rotate }}
            transition={{ duration: 0.28, delay: i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <img src={item.src} alt={item.alt} fetchPriority={i < 2 ? "high" : "low"} />
          </motion.div>
        ))}
      </div>

      <motion.h2
        className="serif"
        style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#0A0A0A", margin: 0, fontWeight: 900, letterSpacing: "-0.02em", textAlign: "center" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08, ease: "easeOut" }}
      >
        Welcome to WELAMA
      </motion.h2>

      <motion.p
        style={{
          margin: 0,
          fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
          letterSpacing: "0.04em",
          color: "var(--yellow-accent, #C9A227)",
          fontWeight: 700,
          textAlign: "center",
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.12, ease: "easeOut" }}
      >
        What are you shopping for today?
      </motion.p>

      <div
        className="loader-premium loader-premium-lg"
        style={{ borderTopColor: "var(--yellow-accent, #C9A227)" }}
      ></div>
    </motion.div>
  );
};

export default Preloader;
