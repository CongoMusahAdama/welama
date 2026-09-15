import { useEffect } from "react";
import { useLocation } from "react-router-dom";

let sharedObserver = null;

const getObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Covers both animation systems used across the site:
            // headings (.anim-heading -> .in-view) and section
            // wrappers (.reveal -> .active). Adding both is harmless —
            // only the class actually present on the element matters.
            entry.target.classList.add("in-view", "active");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
  }
  return sharedObserver;
};

const scanForAnimatedElements = () => {
  const observer = getObserver();

  document.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
    if (!el.dataset.animObserved) {
      el.dataset.animObserved = "true";
      el.classList.add("anim-heading");
      observer.observe(el);
    }
  });

  document.querySelectorAll(".reveal").forEach((el) => {
    if (!el.dataset.animObserved) {
      el.dataset.animObserved = "true";
      observer.observe(el);
    }
  });
};

// Re-scans for new animated elements on every route change, and a couple
// more times shortly after in case content (e.g. async product data,
// modal/page content) renders late.
const HeadingAnimator = () => {
  const location = useLocation();

  useEffect(() => {
    const timers = [0, 250, 800, 1500].map((delay) => setTimeout(scanForAnimatedElements, delay));
    return () => timers.forEach(clearTimeout);
  }, [location.pathname]);

  return null;
};

export default HeadingAnimator;
