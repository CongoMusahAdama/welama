import { useEffect } from "react";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "../../utils/site";

const upsertMeta = (attr, key, content) => {
  if (content == null || content === "") return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", String(content));
};

const upsertLink = (rel, href) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image,
  noindex = false,
  jsonLd,
}) => {
  const jsonText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const pageTitle = title?.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonical = absoluteUrl(path);
    const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
    const robots = noindex ? "noindex, nofollow" : "index, follow";

    document.title = pageTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "googlebot", robots);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:locale", "en_GH");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);
    upsertLink("canonical", canonical);

    let script = document.getElementById("seo-jsonld");
    if (jsonText) {
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = jsonText;
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, noindex, jsonText]);

  return null;
};

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "OnlineStore"],
      name: SITE_NAME,
      alternateName: ["Welama", "WELAMA Ghana", "shop.welama"],
      url: SITE_URL,
      logo: `${SITE_URL}/welamalogo.png`,
      image: DEFAULT_OG_IMAGE,
      email: "welama.business@gmail.com",
      telephone: "+233244374433",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressCountry: "GH",
      },
      sameAs: [
        "https://www.instagram.com/shop.welama",
        "https://www.tiktok.com/@shop.welama",
      ],
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/shop?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default Seo;
