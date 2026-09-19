import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import { Cedis } from "../utils/currency";
import { DEFAULT_CATEGORIES, mergeCategories } from "../utils/categories";
import Seo from "../components/seo/Seo";
import { productFullySoldOut } from "../utils/productStock";

const PROMO_SLIDES = [
  {
    image: "/heroframe2.png",
    kicker: "New Arrival",
    title: "Elegance, curated just for you",
    position: "72% 18%",
  },
  {
    image: "/heroframe1.png",
    kicker: "Limited Offer",
    title: "First Purchase Enjoy a Special Offer",
    position: "58% 12%",
  },
  {
    image: "/heroframe3.png",
    kicker: "WELAMA",
    title: "Luxury looks, made to move",
    position: "62% 10%",
  },
];

const ShopPage = ({ products = [], categories = [] }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "";
    const known = mergeCategories(DEFAULT_CATEGORIES, categories).map((c) =>
      c.toLowerCase(),
    );
    const qLooksLikeCategory = known.includes(q.trim().toLowerCase());

    if (cat) {
      setActiveCategory(cat.toLowerCase());
      setSearchQuery(qLooksLikeCategory ? "" : q);
    } else if (qLooksLikeCategory) {
      setActiveCategory(q.trim().toLowerCase());
      setSearchQuery("");
    } else {
      setSearchQuery(q);
      setActiveCategory("all");
    }
  }, [searchParams, categories]);

  const filteredProducts = products
    .filter((product) => {
      // Hide if sold out > 3 days ago
      const isSoldOut = productFullySoldOut(product);
      if (isSoldOut && product.soldOutAt) {
        const soldDate = new Date(product.soldOutAt);
        const daysSoldOut = (new Date() - soldDate) / (1000 * 60 * 60 * 24);
        if (daysSoldOut > 3) return false;
      }

      const matchesCategory =
        activeCategory === "all" ||
        product.category?.toLowerCase() === activeCategory.toLowerCase();

      const matchesSearch =
        (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const priceValue = parseFloat(product.price);
      const matchesPrice = Number.isNaN(priceValue) || priceValue <= maxPrice;

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "Price: Low to High")
        return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "Price: High to Low")
        return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  useEffect(() => {
    window.scrollTo(0, 0);
    const observerOptions = { threshold: 0.08, rootMargin: "0px 0px 80px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => entry.isIntersecting && entry.target.classList.add("active"),
      );
    }, observerOptions);
    const id = window.requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    });
    return () => {
      window.cancelAnimationFrame(id);
      observer.disconnect();
    };
  }, [activeCategory, searchQuery, sortBy, maxPrice, products.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setMaxPrice(5000);
    setSortBy("Recommended");
    setShowFilters(false);
  };

  const isSearching = Boolean(searchQuery.trim());

  const categoryCount = (id) =>
    id === "all"
      ? products.length
      : products.filter((p) => p.category?.toLowerCase() === id.toLowerCase()).length;

  const categoryTabs = [
    { id: "all", label: "All Collections" },
    ...mergeCategories(DEFAULT_CATEGORIES, categories).map((c) => ({
      id: c.toLowerCase(),
      label: c,
    })),
  ];

  const categoryCards = categoryTabs
    .filter((cat) => cat.id !== "all")
    .map((cat) => {
      const sample =
        products.find((p) => {
          const same = p.category?.toLowerCase() === cat.id.toLowerCase();
          const src = String(p.image || "");
          return (
            same &&
            src &&
            !src.startsWith("blob:") &&
            !src.includes("welamalogo")
          );
        }) ||
        products.find((p) => p.category?.toLowerCase() === cat.id.toLowerCase());
      return { ...cat, image: sample?.image || "/heroframe1.png" };
    });
  const filterCategories = categoryTabs;
  const categoryLabel =
    activeCategory !== "all"
      ? mergeCategories(DEFAULT_CATEGORIES, categories).find(
          (c) => c.toLowerCase() === activeCategory.toLowerCase(),
        ) || activeCategory
      : "";
  const shopTitle = searchQuery
    ? `${searchQuery} | Shop WELAMA`
    : categoryLabel
      ? `${categoryLabel} | Shop WELAMA`
      : "Shop WELAMA | Women's Clothing & Bags in Ghana";
  const shopDescription = searchQuery
    ? `Search WELAMA for ${searchQuery}. Women's clothing and bags from Accra, Ghana.`
    : categoryLabel
      ? `Shop WELAMA ${categoryLabel} in Ghana. Official WELAMA store for women's clothing and bags.`
      : "Shop WELAMA women's clothing, dresses, two-piece sets and bags. Official WELAMA Ghana store.";
  const shopPath = searchQuery
    ? `/shop?q=${encodeURIComponent(searchQuery)}`
    : categoryLabel
      ? `/shop?category=${encodeURIComponent(categoryLabel)}`
      : "/shop";

  return (
    <div className={`shop-page-wrapper${isSearching ? " is-searching" : ""}`}>
      <Seo title={shopTitle} description={shopDescription} path={shopPath} />
      {!isSearching && (
        <section className="shop-hero">
          <div className="center-text reveal">
            <span className="shop-hero-brand">WELAMA</span>
            <h1 className="serif shop-hero-title">Shop WELAMA</h1>
          </div>
        </section>
      )}

      <section className="shop-section">
        <div className="container">
          <div className="shop-layout">
            {/* Desktop Sidebar / Mobile Filter Drawer Wrapper */}
            <aside
              className={`shop-sidebar ${showFilters ? "mobile-open" : ""}`}
            >
              <div className="sidebar-inner filter-sheet">
                <div className="filter-sheet-handle mobile-only" aria-hidden="true" />
                <div className="sidebar-header filter-sheet-head mobile-only flex">
                  <div className="filter-sheet-titles">
                    <h3>Filters</h3>
                  </div>
                  <button
                    type="button"
                    className="close-filters"
                    onClick={() => setShowFilters(false)}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="filter-sheet-body">
                <div className="sidebar-section desktop-only">
                  <h4 className="sidebar-title">Search</h4>
                  <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Find your product..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Category</h4>
                  <div className="category-list">
                    {filterCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setShowFilters(false);
                        }}
                        className={`category-item-btn ${activeCategory === cat.id ? "active" : ""}`}
                      >
                        <span className="cat-label">{cat.id === "all" ? "All" : cat.label}</span>
                        <span className="cat-count">{categoryCount(cat.id)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sidebar-section">
                  <div className="sidebar-title-row">
                    <h4 className="sidebar-title">Price</h4>
                    <span className="price-current-label">Up to <Cedis value={maxPrice} /></span>
                  </div>
                  <div className="price-filter">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      onPointerUp={() => setShowFilters(false)}
                      onKeyUp={() => setShowFilters(false)}
                      className="price-slider"
                    />
                    <div className="price-labels">
                      <span><Cedis value={0} /></span>
                      <span><Cedis value={5000} /></span>
                    </div>
                  </div>
                </div>

                <div className="sidebar-section mobile-only">
                  <h4 className="sidebar-title">Sort</h4>
                  <div className="mobile-sort-options">
                    {[
                      "Recommended",
                      "Price: Low to High",
                      "Price: High to Low",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`sort-option-btn ${sortBy === opt ? "active" : ""}`}
                        onClick={() => {
                          setSortBy(opt);
                          setShowFilters(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                </div>

                <div className="sidebar-footer filter-sheet-actions mobile-only">
                  <button type="button" className="reset-btn" onClick={resetFilters}>
                    Reset
                  </button>
                  <button
                    type="button"
                    className="apply-btn"
                    onClick={() => setShowFilters(false)}
                  >
                    View {filteredProducts.length}
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Product Area */}
            <div className="shop-content">
              <div className="app-shop-home mobile-only">
                <form
                  className="app-shop-search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate(searchQuery.trim() ? `/shop?q=${encodeURIComponent(searchQuery.trim())}` : "/shop");
                  }}
                >
                  <Search size={18} strokeWidth={2} />
                  <input
                    type="search"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search products"
                  />
                  <button
                    type="button"
                    className="app-shop-filter-btn"
                    onClick={() => setShowFilters(true)}
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                </form>

                {!isSearching && activeCategory === "all" && (
                  <div className="app-promo-card">
                    {PROMO_SLIDES.map((slide, i) => (
                      <img
                        key={slide.image}
                        className={`app-promo-photo ${i === promoIndex ? "is-on" : ""}`}
                        src={slide.image}
                        alt=""
                        style={{ objectPosition: slide.position }}
                      />
                    ))}
                    <div className="app-promo-copy" key={PROMO_SLIDES[promoIndex].title}>
                      <span>{PROMO_SLIDES[promoIndex].kicker}</span>
                      <h2>{PROMO_SLIDES[promoIndex].title}</h2>
                      <button type="button" onClick={() => window.scrollTo({ top: 520, behavior: "smooth" })}>
                        Shop Now <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="app-promo-dots" role="tablist" aria-label="Promo slides">
                      {PROMO_SLIDES.map((slide, i) => (
                        <button
                          key={slide.image}
                          type="button"
                          className={i === promoIndex ? "is-on" : ""}
                          aria-label={`Show offer ${i + 1}`}
                          onClick={() => setPromoIndex(i)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="app-section-head">
                  <h3>Categories</h3>
                  <button type="button" onClick={() => setActiveCategory("all")}>
                    See all
                  </button>
                </div>
                <div className="app-cat-scroller" role="tablist" aria-label="Filter by category">
                  {categoryCards.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={activeCategory === cat.id}
                      className={`app-cat-card ${activeCategory === cat.id ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <span className="app-cat-photo">
                        <img src={cat.image} alt="" />
                      </span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="app-section-head">
                  <h3>{activeCategory === "all" ? "New arrival" : categoryTabs.find((c) => c.id === activeCategory)?.label}</h3>
                  <span className="app-item-count">{filteredProducts.length} pieces</span>
                </div>
              </div>

              {/* Desktop Only Controls */}
              <div className="shop-toolbar desktop-only reveal">
                <div className="results-info">
                  Showing{" "}
                  <span className="highlight">{filteredProducts.length}</span>{" "}
                  pieces
                </div>
                <div className="toolbar-actions">
                  <label>Sort By:</label>
                  <select
                    className="premium-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Chips */}
              {(activeCategory !== "all" || searchQuery || maxPrice < 1000) && (
                <div className="active-filters-row">
                  {activeCategory !== "all" && (
                    <div className="filter-chip">
                      {categoryTabs.find((c) => c.id === activeCategory)?.label}
                      <X size={14} onClick={() => setActiveCategory("all")} />
                    </div>
                  )}
                  {searchQuery && (
                    <div className="filter-chip">
                      "{searchQuery}"
                      <X size={14} onClick={() => setSearchQuery("")} />
                    </div>
                  )}
                  {maxPrice < 1000 && (
                    <div className="filter-chip">
                      Under <Cedis value={maxPrice} />
                      <X size={14} onClick={() => setMaxPrice(1000)} />
                    </div>
                  )}
                </div>
              )}

              <div className="shop-results-container">
                {filteredProducts.length > 0 ? (
                  <div className="product-grid-shop fade-in">
                    {filteredProducts.map((p, index) => (
                      <ProductCard key={p._id || p.id} {...p} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results reveal">
                    <div className="no-results-icon">
                      <Search size={48} />
                    </div>
                    <h3>No products match your criteria</h3>
                    <p>
                      Try adjusting your filters or searching for something
                      else.
                    </p>
                    <button
                      className="clear-all-btn"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("all");
                        setMaxPrice(5000);
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sidebar Backdrop */}
      {showFilters && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setShowFilters(false)}
        ></div>
      )}
    </div>
  );
};

export default ShopPage;
