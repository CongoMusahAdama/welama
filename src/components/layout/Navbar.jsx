import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Heart, Menu, X, ArrowRight, LayoutGrid, ChevronDown, ShoppingCart, Phone, Mail, PackageSearch, Moon, Sun } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { useMobileMenu } from "../../context/MobileMenuContext";
import RecentlyViewedDropdown from "./RecentlyViewedDropdown";
import { Cedis } from "../../utils/currency";
import { STORE_PHONE, waLink } from "../../utils/whatsapp";

const NavCartButton = () => {
  const { cartCount, cartTotal, setIsCartOpen, cartPulse } = useCart();
  return (
    <button
      id="nav-cart-target"
      data-cart-fly-target
      className={`icon-link nav-cart-btn ${cartPulse ? "cart-pulse" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCartOpen(true);
      }}
    >
      <span style={{ position: "relative", display: "inline-flex" }}>
        <ShoppingCart size={22} strokeWidth={1.5} />
        <span className="nav-cart-badge">{cartCount}</span>
      </span>
      <span className="nav-cart-text desktop-only">
        <small>Your Cart</small>
        <strong><Cedis value={cartTotal} decimals={0} /></strong>
      </span>
    </button>
  );
};

const ANNOUNCEMENTS = [
  "Urgent? Choose pick up & send rider",
  "Free Delivery On Orders Above 1000 Cedis",
  "Standard Delivery Within 48 Hours In Accra",
];

const AnnouncementTicker = ({ className = "nav-announcement-ticker desktop-only" }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    let msgIndex = 0;
    let i = 0;
    let timer;
    let pauseTimeout;

    const eraseText = () => {
      const fullText = ANNOUNCEMENTS[msgIndex];
      timer = setInterval(() => {
        i--;
        setText(fullText.substring(0, i));
        if (i <= 0) {
          clearInterval(timer);
          msgIndex = (msgIndex + 1) % ANNOUNCEMENTS.length;
          pauseTimeout = setTimeout(typeText, 300);
        }
      }, 25);
    };

    const typeText = () => {
      const fullText = ANNOUNCEMENTS[msgIndex];
      i = 0;
      timer = setInterval(() => {
        setText(fullText.substring(0, i + 1));
        i++;
        if (i === fullText.length) {
          clearInterval(timer);
          pauseTimeout = setTimeout(eraseText, 1800);
        }
      }, 45);
    };

    typeText();

    return () => {
      clearInterval(timer);
      clearTimeout(pauseTimeout);
    };
  }, []);

  return (
    <div className={className} aria-live="polite">
      <span className="nav-announcement-text">{text}</span>
    </div>
  );
};

const NavDropdown = ({ label, to, items }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`nav-item-dropdown${open ? " is-open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link to={to} className="nav-link">{label}</Link>
      {items?.length > 0 && (
        <div className="category-dropdown-menu">
          {items.map((item) => (
            <Link key={`${item.to}-${item.label}`} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryDropdown = ({ categories = [] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`category-dropdown${open ? " is-open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="category-dropdown-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <LayoutGrid size={16} />
        <span>Shop By Category</span>
        <ChevronDown size={14} />
      </button>
      {categories.length > 0 && (
        <div className="category-dropdown-menu">
          {categories.map((c) => {
            const label = typeof c === "object" ? c.label || c.name : c;
            return (
              <Link
                key={label}
                to={`/shop?q=${encodeURIComponent(label)}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-overlay-backdrop" onClick={onClose}></div>
      <div className="search-overlay-content">
        <button className="search-overlay-close" onClick={onClose}>
          <X size={32} strokeWidth={1.5} />
        </button>
        <div className="container center-text">
          <span className="search-overlay-label">Find Your Style</span>
          <form onSubmit={handleSearch} className="search-overlay-form">
            <input
              type="text"
              autoFocus
              placeholder="Searching for dresses, bags & more..."
              className="search-overlay-input serif"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="search-overlay-btn">
              <ArrowRight size={32} />
            </button>
          </form>
          <div className="search-overlay-suggestions">
            <p>
              Popular:
              <strong
                onClick={() => {
                  setQuery("Dresses");
                  navigate("/shop?q=Dresses");
                  onClose();
                }}
              >
                Dresses
              </strong>
              ,
              <strong
                onClick={() => {
                  setQuery("Bags");
                  navigate("/shop?q=Bags");
                  onClose();
                }}
              >
                Bags
              </strong>
              ,
              <strong
                onClick={() => {
                  setQuery("Accessories");
                  navigate("/shop?q=Accessories");
                  onClose();
                }}
              >
                Accessories
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ user, categories = [], settings }) => {
  const logoUrl = settings?.logoUrl || "/welamalogo.png";
  const storePhone = STORE_PHONE;
  const { theme, toggleTheme } = useTheme();
  const { isOpen: isMobileMenuOpen, setOpen: setIsMobileMenuOpen } = useMobileMenu();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inlineQuery, setInlineQuery] = useState("");
  const [inlineCategory, setInlineCategory] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prevPath = useRef(location.pathname);
  const [logoAnimKey, setLogoAnimKey] = useState(1);
  const isShopPage = location.pathname.startsWith("/shop");
  const isHomePage = location.pathname === "/";
  const isProductPage = location.pathname.startsWith("/product");
  const isAuthPage =
    location.pathname === "/auth" || location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const html = document.documentElement;
    if (isMobileMenuOpen) {
      const y = window.scrollY;
      html.classList.add("nav-menu-open");
      document.body.style.top = `-${y}px`;
      document.body.dataset.scrollLockY = String(y);
    } else {
      const y = Number(document.body.dataset.scrollLockY || 0);
      html.classList.remove("nav-menu-open");
      document.body.style.top = "";
      delete document.body.dataset.scrollLockY;
      if (y) window.scrollTo(0, y);
    }
    return () => {
      html.classList.remove("nav-menu-open");
      document.body.style.top = "";
      delete document.body.dataset.scrollLockY;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (location.pathname === "/" && prevPath.current !== "/") {
      setLogoAnimKey((key) => key + 1);
    }
    prevPath.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const homeMenuItems = [
    { to: "/#featured-pieces", label: "Featured Pieces" },
    { to: "/#our-story", label: "Our Story" },
    { to: "/#customer-reviews", label: "Customer Reviews" },
  ];

  const shopMenuItems = [
    ...categories.map((c) => {
      const label = typeof c === "object" ? c.label : c;
      return { to: `/shop?q=${encodeURIComponent(label)}`, label };
    }),
    { to: "/shop", label: "View All Products" },
  ];

  const collectionsMenuItems = categories.map((c) => {
    const label = typeof c === "object" ? c.label || c.name : c;
    return { to: `/shop?q=${encodeURIComponent(label)}`, label };
  });

  const galleryMenuItems = [
    { to: "/gallery", label: "All" },
    ...categories.map((c) => {
      const label = typeof c === "object" ? c.label || c.name : c;
      return { to: `/gallery?category=${encodeURIComponent(label)}`, label };
    }),
  ];

  const trackMenuItems = [
    { to: "/track", label: "Track Your Order" },
  ];

  useEffect(() => {
    if (!isShopPage) return;
    const q = searchParams.get("q") || "";
    setInlineQuery((prev) => (prev === q ? prev : q));
  }, [isShopPage, searchParams]);

  useEffect(() => {
    if (!isShopPage) return undefined;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const current = params.get("q") || "";
      const next = inlineQuery.trim();
      if (next === current) return;
      if (next) params.set("q", next);
      else params.delete("q");
      const qs = params.toString();
      navigate(qs ? `/shop?${qs}` : "/shop", { replace: true });
    }, 160);
    return () => window.clearTimeout(timer);
  }, [inlineQuery, isShopPage, location.search, navigate]);

  const handleInlineSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inlineQuery.trim()) params.set("q", inlineQuery.trim());
    if (inlineCategory) params.set("category", inlineCategory);
    navigate(params.toString() ? `/shop?${params.toString()}` : "/shop");
  };

  if (isAuthPage) return null;

  return (
    <>
      <header className={`header ${isScrolled ? "scrolled" : ""} ${isShopPage ? "header-shop" : ""} ${isHomePage ? "header-home" : ""} ${isProductPage ? "header-product" : ""}`}>
        <AnnouncementTicker />
        <div className="main-nav-row">
          <div className="container main-nav-row-inner">
            <Link to="/" className="logo logo-lockup">
              <img
                key={logoAnimKey}
                src={logoUrl}
                alt={settings?.siteName || "WELAMA"}
                className="logo-img logo-img-enter"
              />
              <AnnouncementTicker className="logo-announce mobile-only flex" />
            </Link>

            <div className="nav-contact-line desktop-only">
              <a href={`tel:${storePhone}`}>
                <Phone size={13} /> {storePhone}
              </a>
              <a href="mailto:info@welama.com">
                <Mail size={13} /> info@welama.com
              </a>
            </div>

            <div className="nav-search-wrap desktop-only">
              <form className="nav-search-bar" onSubmit={handleInlineSearch}>
                <select
                  className="nav-search-category"
                  value={inlineCategory}
                  onChange={(e) => setInlineCategory(e.target.value)}
                  aria-label="Category"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => {
                    const label = typeof c === "object" ? c.label : c;
                    return (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={inlineQuery}
                  onChange={(e) => setInlineQuery(e.target.value)}
                />
                <button type="submit" className="nav-search-btn">
                  <Search size={16} />
                </button>
              </form>
            </div>

            <div className="nav-icons">
              <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} strokeWidth={2} />
              </button>
              <a href="#" className="icon-link desktop-only">
                <Heart size={20} strokeWidth={1.5} />
              </a>
              <RecentlyViewedDropdown />
              <NavCartButton />
            </div>
          </div>
        </div>

        {isShopPage && (
        <div className="mobile-header-search mobile-only">
          <form className="mobile-header-search-form" onSubmit={handleInlineSearch}>
            <input
              type="search"
              placeholder="I'm searching for..."
              value={inlineQuery}
              onChange={(e) => setInlineQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              <Search size={18} strokeWidth={2} />
            </button>
          </form>
        </div>
        )}

        <div className="sub-nav-row desktop-only">
          <div className="container sub-nav-row-inner">
            <CategoryDropdown categories={categories} />
            <nav className="nav-menu">
              <NavDropdown label="Home" to="/" items={homeMenuItems} />
              <NavDropdown label="Shop" to="/shop" items={shopMenuItems} />
              <NavDropdown label="Collections" to="/collections" items={collectionsMenuItems} />
              <NavDropdown label="Gallery" to="/gallery" items={galleryMenuItems} />
              <NavDropdown label="Track Order" to="/track" items={trackMenuItems} />
            </nav>
            <Link to="/track" className="sub-nav-track-link">
              Track Order
            </Link>
          </div>
        </div>
      </header>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-sheet-handle mobile-only" aria-hidden="true" />
        <div className="mobile-nav-header">
          <h2 className="mobile-nav-title">Menu</h2>
          <button
            className="mobile-menu-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>
        <nav className="mobile-nav-links">
          <p className="mobile-nav-section-label">Categories</p>
          {categories.map((c) => {
            const label = typeof c === "object" ? c.label : c;
            return (
              <Link
                key={label}
                to={`/shop?q=${encodeURIComponent(label)}`}
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </Link>
            );
          })}

          <p className="mobile-nav-section-label">Explore</p>
          <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link to="/collections" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
          <Link to="/gallery" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link>
          <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          <Link
            to="/track"
            className="mobile-nav-track"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PackageSearch size={18} />
            Track Order
          </Link>
        </nav>
        <div className="mobile-nav-footer">
          <div className="mobile-nav-contact">
            <p>Concierge</p>
            <a href={`tel:${storePhone}`}>
              <Phone size={15} /> {storePhone}
            </a>
            <a href="mailto:info@welama.com">
              <Mail size={15} /> info@welama.com
            </a>
          </div>
          <button
            type="button"
            className="mobile-theme-toggle"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="mobile-nav-cta mobile-nav-cta-dark"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact Support
          </a>
          <Link
            to="/shop"
            className="mobile-nav-cta mobile-nav-cta-gold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shop Collection
          </Link>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
