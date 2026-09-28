export const DEFAULT_CATEGORIES = ["Shirts", "Dresses", "Two-piece", "Bags"];

export const CLOTHING_SIZES = ["UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18"];

export const isClothingCategory = (value) => {
  const label = categoryLabel(value).toLowerCase();
  return /dress|shirt|two[\s-]?piece|cloth|kaftan/.test(label);
};

export const categoryLabel = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value.name || value.label || "").trim();
  return String(value).trim();
};

export const mergeCategories = (...groups) => {
  const seen = new Set();
  const out = [];
  groups.flat().forEach((value) => {
    const raw = categoryLabel(value);
    if (!raw) return;
    const key = raw.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(raw.charAt(0).toUpperCase() + raw.slice(1));
  });
  return out;
};
