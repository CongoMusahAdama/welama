export const STORE_PHONE = "0244374433";
export const WHATSAPP_NUMBER = "233244374433";

export const displayStorePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits || digits.endsWith("244374433")) return STORE_PHONE;
  return String(value).trim() || STORE_PHONE;
};

export const waLink = (text = "") =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
