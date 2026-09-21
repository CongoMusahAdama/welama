export const optimizedImage = (url, width = 720) => {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*f_auto/.test(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto:eco,c_limit,w_${width}/`);
};
