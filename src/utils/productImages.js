const FALLBACK = "/welamalogo.png";

export const productGalleryImages = (product) => {
  if (!product) return [FALLBACK];
  const seen = new Set();
  const out = [];
  const add = (src) => {
    if (!src || typeof src !== "string") return;
    const url = src.trim();
    if (!url || url.startsWith("blob:") || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };
  add(product.image);
  (Array.isArray(product.images) ? product.images : []).forEach(add);
  return out.length ? out : [FALLBACK];
};

export const galleryThumbLabel = (index, total) => {
  if (total === 2) return index === 0 ? "FRONT" : "BACK";
  return `VIEW ${index + 1}`;
};
