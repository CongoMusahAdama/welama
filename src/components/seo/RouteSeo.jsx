import { useLocation } from "react-router-dom";
import Seo, { WEBSITE_JSON_LD } from "./Seo";

const RouteSeo = () => {
  const { pathname, search } = useLocation();

  if (pathname.startsWith("/product/")) return null;
  if (pathname === "/shop" || pathname.startsWith("/shop/")) return null;

  if (pathname.startsWith("/admin")) {
    return <Seo title="Admin" path={pathname} noindex description="WELAMA admin dashboard." />;
  }

  if (pathname === "/auth") {
    return <Seo title="Admin login" path="/auth" noindex description="Sign in to the WELAMA admin dashboard." />;
  }

  if (pathname === "/checkout") {
    return <Seo title="Checkout" path="/checkout" noindex description="Complete your WELAMA order." />;
  }

  if (pathname === "/" || pathname === "/home") {
    return (
      <Seo
        title="WELAMA | Women's Clothing & Bags in Ghana"
        description="Shop WELAMA in Ghana: women's clothing, dresses, two-piece sets and bags from Accra. Official WELAMA store at welama-gh.shop."
        path={pathname === "/home" ? "/home" : "/"}
        jsonLd={WEBSITE_JSON_LD}
      />
    );
  }

  if (pathname === "/about") {
    return (
      <Seo
        title="About WELAMA"
        description="WELAMA is a Ghana fashion brand for the modern woman. Learn the WELAMA story and shop clothing and bags from Accra."
        path="/about"
      />
    );
  }

  if (pathname === "/collections") {
    return (
      <Seo
        title="WELAMA Collections"
        description="Browse WELAMA ranges: shirts, dresses, two-piece sets and bags. Shop the official WELAMA collections in Ghana."
        path="/collections"
      />
    );
  }

  if (pathname === "/gallery") {
    return (
      <Seo
        title="WELAMA Gallery"
        description="See WELAMA styles and looks. Women's clothing and bags from the WELAMA Ghana collection."
        path="/gallery"
      />
    );
  }

  if (pathname === "/track") {
    return (
      <Seo
        title="Track a WELAMA Order"
        description="Track your WELAMA order with your order ID and phone number."
        path={`/track${search || ""}`}
        noindex
      />
    );
  }

  return (
    <Seo
      title="WELAMA"
      description="Shop WELAMA women's clothing and bags in Ghana."
      path={pathname}
    />
  );
};

export default RouteSeo;
