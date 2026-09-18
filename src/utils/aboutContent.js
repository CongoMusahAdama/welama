export const DEFAULT_ABOUT = {
  aboutHeroKicker: "WELAMA",
  aboutHeroTitle: "About WELAMA",
  aboutEstablished: "Established 2026",
  aboutTitle: "A Legacy of Timeless Elegance.",
  aboutBody1:
    "WELAMA was born from a simple yet profound belief: that a woman's wardrobe should be as confident and considered as she is. We are curating clothing and bags that balance clean silhouettes with rich, tactile detail.",
  aboutBody2:
    "Our journey begins with a small capsule collection, designed for women who value quality over noise. Soon, we will be proud to be a premier destination for those who seek pieces that feel as good as they look — refined, versatile, and unmistakably WELAMA.",
  aboutImageUrl: "/heroframe2.png",
  aboutPhilosophyKicker: "Our Philosophy",
  aboutPhilosophyTitle: "Values That Define Us",
  aboutValue1Title: "Premium Craftsmanship",
  aboutValue1Body:
    "We source only the finest fabrics and materials, from supple leathers to fluid, breathable textiles, ensuring every piece is built to last.",
  aboutValue2Title: "Global Reach",
  aboutValue2Body:
    "Our designs draw on a global sensibility, formulated to serve the modern woman's wardrobe wherever she calls home.",
  aboutValue3Title: "Customer Care",
  aboutValue3Body:
    "WELAMA is a partner in your personal style journey. We provide personalized advice for every customer's unique taste.",
  aboutContactIntro:
    "Whether you have a question about our collections, need personalized styling advice, or want to discuss a wholesale partnership, we are here to assist you.",
  footerIntro:
    "WELAMA crafts premium clothing and bags for the woman who moves through the world with quiet confidence.",
};

export const aboutContent = (settings = {}) => {
  const out = {};
  Object.keys(DEFAULT_ABOUT).forEach((key) => {
    const value = String(settings?.[key] || "").trim();
    out[key] = value || DEFAULT_ABOUT[key];
  });
  return out;
};
