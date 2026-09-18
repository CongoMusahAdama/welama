export const STORE_PHONE = "0244374433";
export const WHATSAPP_NUMBER = "233244374433";

export const displayStorePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits || digits.endsWith("244374433") || digits.endsWith("551082163")) {
    return STORE_PHONE;
  }
  return String(value).trim() || STORE_PHONE;
};

export const waLink = (text = "") =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const getFullImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return `${window.location.origin}/welamalogo.png`;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${window.location.origin}${cleanPath}`;
};

