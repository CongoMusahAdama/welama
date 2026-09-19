import { colorName } from "./productStock";

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
  (Array.isArray(product.colors) ? product.colors : []).forEach((c) => {
    if (c && typeof c === "object") add(c.image);
  });
  return out.length ? out : [FALLBACK];
};

export const galleryThumbLabel = (index, total) => {
  if (total === 2) return index === 0 ? "FRONT" : "BACK";
  return `VIEW ${index + 1}`;
};

export const imageForColor = (product, color) => {
  const gallery = productGalleryImages(product);
  const colors = Array.isArray(product?.colors) ? product.colors : [];
  if (!colors.length) return gallery[0] || FALLBACK;

  const name = colorName(color).toLowerCase();
  const idx = colors.findIndex((c) => colorName(c).toLowerCase() === name);
  const match = idx >= 0 ? colors[idx] : null;

  if (match && typeof match === "object" && match.image) {
    return match.image;
  }

  if (idx >= 0 && gallery[idx]) return gallery[idx];

  const named = gallery.find((src) => {
    const file = String(src).toLowerCase();
    return name
      .split(/[\s/_-]+/)
      .filter((word) => word.length > 2)
      .some((word) => file.includes(word));
  });
  if (named) return named;

  return gallery[0] || FALLBACK;
};
