export const catalogProductId = (value) => {
  const id = String(value || "").trim();
  return /^[a-fA-F0-9]{24}$/.test(id) ? id : null;
};
