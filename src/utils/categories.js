export const DEFAULT_CATEGORIES = ["Shirts", "Dresses", "Two-piece", "Bags"];

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
