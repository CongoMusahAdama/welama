export const SITE_URL = "https://welama-gh.shop";
export const SITE_NAME = "WELAMA";
export const SITE_TAGLINE = "Women's clothing and bags from Accra, Ghana";
export const DEFAULT_DESCRIPTION =
  "WELAMA is a Ghana women's fashion shop for clothing, dresses, two-piece sets and bags. Shop WELAMA online at welama-gh.shop.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/heroframe1.png`;
export const DEFAULT_LOGO = `${SITE_URL}/welamalogo.png`;

export const absoluteUrl = (path = "/") => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${SITE_URL}${path}`;
  return `${SITE_URL}/${path}`;
};
